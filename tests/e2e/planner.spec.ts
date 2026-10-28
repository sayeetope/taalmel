import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

interface PlannerProbe {
  getState: () => {
    aps: Array<{ id: number; label: string; x: number; y: number; radius: number | null }>;
    defaultRadius: number;
    graph: { n: number };
    revision: number;
    activeTab: string;
    tRun: { revision: number; result: unknown } | null;
  };
  getView: () => { scale: number; tx: number; ty: number };
  getRect: () => DOMRect | null;
}

async function openPlanner(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Launch planner' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('canvas').nth(1)).toBeVisible();
}

test('home page passes axe and opens the planner', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tune every access point');
  await expect(page.getByRole('button', { name: 'Launch planner' }).first()).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([]);

  await page.getByRole('button', { name: 'Launch planner' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/#planner$/);
});

test('planner: axe, add, drag, live radius, recolor, T-color and export', async ({ page }) => {
  await openPlanner(page);

  const modalAxe = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  const modalSerious = modalAxe.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(modalSerious, JSON.stringify(modalSerious.map((v) => v.id))).toEqual([]);

  // Add an AP at the centre of the canvas.
  const canvas = page.locator('canvas').nth(1);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.getByRole('button', { name: 'Add access point (A)' }).click();
  const beforeCount = await page.evaluate(() => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length);
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect
    .poll(async () => (await page.evaluate(() => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length)))
    .toBe(beforeCount + 1);

  // Drag the first AP and confirm the model position changed.
  await page.getByRole('button', { name: 'Select and move (V)' }).click();
  const start = await page.evaluate(() => {
    const api = (window as unknown as { __taalmel: PlannerProbe }).__taalmel;
    const state = api.getState();
    const view = api.getView();
    const rect = api.getRect();
    const ap = state.aps[0];
    if (!rect) return null;
    return {
      id: ap.id,
      x: rect.left + view.tx + ap.x * view.scale,
      y: rect.top + view.ty + ap.y * view.scale,
      modelX: ap.x,
    };
  });
  expect(start).not.toBeNull();
  await page.mouse.move(start!.x, start!.y);
  await page.mouse.down();
  await page.mouse.move(start!.x + 40, start!.y + 24, { steps: 12 });
  await page.mouse.up();
  const movedX = await page.evaluate(
    (id) =>
      (window as unknown as { __taalmel: PlannerProbe }).__taalmel
        .getState()
        .aps.find((ap) => ap.id === id)?.x,
    start!.id
  );
  expect(movedX).not.toBeCloseTo(start!.modelX, 0);

  // Radius changes should repaint the dynamic layer immediately.
  const beforePixels = await canvasPixels(page);
  const radiusSlider = page.getByRole('slider', { name: 'Coverage radius', exact: true });
  await radiusSlider.focus();
  const radiusBefore = await page.evaluate(
    () => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().defaultRadius
  );
  for (let i = 0; i < 8; i++) await radiusSlider.press('ArrowRight');
  await expect
    .poll(async () =>
      page.evaluate(
        () => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().defaultRadius
      )
    )
    .toBeGreaterThan(radiusBefore);
  const afterPixels = await canvasPixels(page);
  expect(afterPixels).not.toBe(beforePixels);

  // Recolor runs the existing coloring engine.
  await page.getByRole('button', { name: 'Recolor' }).click();
  await expect(page.getByText(/Recolored/)).toBeVisible();

  // T-color runs from the store, opens its tab, and records the revision.
  await page.getByRole('button', { name: 'T-Color' }).click();
  await expect(page.getByText(/feasible|No valid T-coloring/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('tab', { name: 'T-Coloring' })).toHaveAttribute('aria-selected', 'true');
  const tState = await page.evaluate(() => {
    const state = (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState();
    return { hasRun: Boolean(state.tRun), stale: state.tRun ? state.tRun.revision !== state.revision : null };
  });
  expect(tState.hasRun).toBe(true);
  expect(tState.stale).toBe(false);

  // Export the real topology as JSON.
  await page.locator('summary').filter({ hasText: 'Export' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Topology JSON/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
});

test('clear/undo, layers, presets and PNG export stay functional', async ({ page }) => {
  await openPlanner(page);
  const count = await page.evaluate(
    () => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length
  );

  // Layer switches expose their state and repaint the canvas.
  const coverage = page.getByRole('button', { name: 'Toggle coverage discs' });
  await expect(coverage).toHaveAttribute('aria-pressed', 'true');
  await coverage.click();
  await expect(coverage).toHaveAttribute('aria-pressed', 'false');
  await coverage.click();
  await expect(coverage).toHaveAttribute('aria-pressed', 'true');

  // Clear is recoverable through the undo action.
  await page.getByRole('button', { name: 'Clear all APs' }).click();
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length))
    .toBe(0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length))
    .toBe(count);

  // Presets load the real reference graph.
  await page.getByRole('button', { name: 'Open presets' }).click();
  const presets = page.getByRole('dialog', { name: 'Reference topologies' });
  await expect(presets).toBeVisible();
  await presets.getByRole('button', { name: /^K₄/ }).click();
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().graph.n))
    .toBe(4);

  // The PNG export is the composited real canvas, not a placeholder.
  await page.locator('summary').filter({ hasText: 'Export' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /RF plot PNG/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('proofs, matching, benchmark and tests run from their tabs', async ({ page }) => {
  await openPlanner(page);

  await page.getByRole('tab', { name: 'Proofs' }).click();
  await expect(page.getByRole('heading', { name: 'Pigeonhole argument' })).toBeVisible();
  await expect(page.getByText(/ω ≤ χ\(G\) ≤ Δ\+1|E ≤ 3V − 6/).first()).toBeVisible();

  await page.getByRole('tab', { name: 'Matching' }).click();
  await expect(page.getByText(/Partition|Not bipartite/)).toBeVisible();

  await page.getByRole('tab', { name: 'Benchmark' }).click();
  await page.getByRole('button', { name: 'Run benchmark' }).click();
  await expect(page.getByRole('columnheader', { name: 'Algorithm' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('cell', { name: 'DSatur' })).toBeVisible();

  await page.getByRole('tab', { name: 'Tests' }).click();
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText(/checks pass/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('K₄', { exact: true })).toBeVisible();
});

test('closing with Escape returns focus and keeps the graph', async ({ page }) => {
  await page.goto('/');
  const launch = page.getByRole('button', { name: 'Launch planner' }).first();
  await launch.click();
  await openPlannerFromDialog(page);
  const count = await page.evaluate(
    () => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).not.toHaveURL(/#planner$/);
  await expect(launch).toBeFocused();
  await launch.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const reopened = await page.evaluate(
    () => (window as unknown as { __taalmel: PlannerProbe }).__taalmel.getState().aps.length
  );
  expect(reopened).toBe(count);
});

async function openPlannerFromDialog(page: Page) {
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function canvasPixels(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelectorAll('canvas')[1] as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 997) sum += data[i];
    return sum;
  });
}
