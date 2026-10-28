import { beforeEach, describe, expect, it } from 'vitest';
import { usePlanner } from '@/features/planner/store/plannerStore';
import { CAMPUS_APS, edgeCount } from '@/engine';

const state = () => usePlanner.getState();

describe('planner store', () => {
  beforeEach(() => {
    state().reset();
    state().dismissToast(0);
  });

  it('loads the campus demo with a derived graph', () => {
    expect(state().aps).toHaveLength(CAMPUS_APS.length);
    expect(state().graph.n).toBe(CAMPUS_APS.length);
    expect(state().stats.colors).toBeGreaterThan(0);
  });

  it('adds, selects and deletes an AP, and undo restores it', () => {
    const before = state().aps.length;
    state().addAp(120, 40);
    expect(state().aps).toHaveLength(before + 1);
    const added = state().aps.at(-1);
    expect(added).toBeDefined();
    expect(state().selectedId).toBe(added?.id);

    state().deleteAp(added!.id);
    expect(state().aps).toHaveLength(before);

    state().undo();
    expect(state().aps).toHaveLength(before + 1);
    expect(state().aps.at(-1)?.id).toBe(added!.id);
  });

  it('clears all APs and undo restores the full set', () => {
    const before = state().aps.length;
    state().clearAll();
    expect(state().aps).toHaveLength(0);
    expect(edgeCount(state().graph)).toBe(0);

    state().undo();
    expect(state().aps).toHaveLength(before);
    expect(state().graph.n).toBe(before);
  });

  it('applies the default radius live to inheriting APs but keeps overrides', () => {
    const override = state().aps[0].id;
    state().setApRadius(override, 210);
    const revision = state().revision;

    state().setDefaultRadius(140);

    expect(state().defaultRadius).toBe(140);
    expect(state().revision).toBeGreaterThan(revision);
    const ap = state().aps.find((item) => item.id === override);
    expect(ap?.radius).toBe(210);
    expect(state().aps.some((item) => item.radius === null)).toBe(true);
  });

  it('marks results stale by bumping the revision on constraint changes', () => {
    const base = state().revision;
    state().setSeparation(2);
    expect(state().revision).toBe(base + 1);
    state().setMaxChannel(11);
    expect(state().revision).toBe(base + 2);
  });

  it('recolors with the selected algorithm', () => {
    state().setAlgorithm('welsh-powell');
    state().recolor();
    expect(state().algorithm).toBe('welsh-powell');
    expect(state().coloring).toHaveLength(state().aps.length);
  });
});
