import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GraphRenderer, type CanvasData } from './renderer';
import { buildHitIndex, hitTest } from './hitTest';
import { fitView, toModel, type View } from './view';
import { createFrameScheduler } from '@/lib/raf';
import { registerCanvasLayers } from '../lib/canvasBus';
import { selectChannelAssignment, selectShowChannels, usePlanner } from '../store/plannerStore';
import type { PlannerState } from '../store/plannerStore';

declare global {
  interface Window {
    __taalmel?: {
      getView: () => View;
      getRect: () => DOMRect | null;
      getState: () => PlannerState;
    };
  }
}

interface DragState {
  pointerId: number;
  id: number;
  startScreen: { x: number; y: number };
  startModel: { x: number; y: number };
  current: { x: number; y: number };
  moved: boolean;
}

export function CanvasStage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const staticRef = useRef<HTMLCanvasElement>(null);
  const dynamicRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GraphRenderer | null>(null);
  const viewRef = useRef<View>({ scale: 1, tx: 0, ty: 0 });
  const rectRef = useRef<DOMRect | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const aps = usePlanner((state) => state.aps);
  const defaultRadius = usePlanner((state) => state.defaultRadius);
  const graph = usePlanner((state) => state.graph);
  const coloring = usePlanner((state) => state.coloring);
  const stats = usePlanner((state) => state.stats);
  const separation = usePlanner((state) => state.separation);
  const selectedId = usePlanner((state) => state.selectedId);
  const tool = usePlanner((state) => state.tool);
  const showCoverage = usePlanner((state) => state.showCoverage);
  const showGrid = usePlanner((state) => state.showGrid);
  const fitNonce = usePlanner((state) => state.fitNonce);
  const channels = usePlanner(selectChannelAssignment);
  const showChannels = usePlanner(selectShowChannels);

  const addAp = usePlanner((state) => state.addAp);
  const moveAp = usePlanner((state) => state.moveAp);
  const deleteAp = usePlanner((state) => state.deleteAp);
  const selectAp = usePlanner((state) => state.selectAp);
  const setTool = usePlanner((state) => state.setTool);

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);

  const apsRef = useRef(aps);
  apsRef.current = aps;
  const defaultRadiusRef = useRef(defaultRadius);
  defaultRadiusRef.current = defaultRadius;

  const schedule = useMemo(() => createFrameScheduler(() => rendererRef.current?.draw()), []);

  const fitToView = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (width === 0 || height === 0) return;
    const radii = apsRef.current.map((ap) => ap.radius ?? defaultRadiusRef.current);
    // Narrow screens need a tighter margin so labels and numbers stay legible.
    const padding = width < 640 ? 28 : 64;
    const view = fitView(apsRef.current, radii, width, height, padding);
    viewRef.current = view;
    rendererRef.current?.setView(view);
    rendererRef.current?.setGhost(null);
    schedule();
  }, [schedule]);

  // Renderer + resize observation.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const staticCanvas = staticRef.current;
    const dynamicCanvas = dynamicRef.current;
    if (!wrapper || !staticCanvas || !dynamicCanvas) return;

    const renderer = new GraphRenderer(staticCanvas, dynamicCanvas);
    rendererRef.current = renderer;

    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };
      rectRef.current = rect;
      renderer.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      fitToView();
      schedule();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    measure();

    let interval: number | null = null;
    if (import.meta.env.DEV) {
      interval = window.setInterval(() => {
        const median = renderer.getMedianFrameMs();
        setFps(median === null ? null : Math.round(median * 10) / 10);
      }, 700);
    }

    return () => {
      observer.disconnect();
      if (interval !== null) clearInterval(interval);
      rendererRef.current = null;
    };
  }, [fitToView, schedule]);

  useEffect(() => {
    fitToView();
  }, [fitNonce, fitToView]);

  // Development-only probe used by the automated UI and performance checks.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__taalmel = {
      getView: () => viewRef.current,
      getRect: () => rectRef.current,
      getState: () => usePlanner.getState(),
    };
    return () => {
      delete window.__taalmel;
    };
  }, []);

  // Expose the layers so PNG export composites grid + graph.
  useEffect(
    () =>
      registerCanvasLayers(() => {
        const staticCanvas = staticRef.current;
        const dynamicCanvas = dynamicRef.current;
        return staticCanvas && dynamicCanvas ? { staticCanvas, dynamicCanvas } : null;
      }),
    []
  );

  // Push committed state into the renderer; one draw per frame at most.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const data: CanvasData = {
      aps,
      defaultRadius,
      graph,
      coloring,
      channels: showChannels ? channels : null,
      separation,
      groupCount: Math.max(3, stats.colors),
      selectedId,
      hoveredId,
      showCoverage,
      showGrid,
      showGhost: tool === 'add' && aps.length > 0,
    };
    renderer.setData(data);
    schedule();
  }, [
    aps,
    defaultRadius,
    graph,
    coloring,
    channels,
    showChannels,
    separation,
    stats.colors,
    selectedId,
    hoveredId,
    showCoverage,
    showGrid,
    tool,
    schedule,
  ]);

  useEffect(() => {
    if (tool !== 'add') {
      rendererRef.current?.setGhost(null);
      schedule();
    }
  }, [tool, schedule]);

  const localPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const point = localPoint(event);
    rectRef.current = event.currentTarget.getBoundingClientRect();
    const index = buildHitIndex(aps, viewRef.current);
    const hit = hitTest(index, point.x, point.y);

    if (aps.length === 0) {
      const model = toModel(viewRef.current, point);
      addAp(Math.round(model.x), Math.round(model.y));
      return;
    }

    if (tool === 'add') {
      const model = toModel(viewRef.current, point);
      addAp(Math.round(model.x), Math.round(model.y));
      return;
    }

    if (tool === 'delete') {
      if (hit !== -1) deleteAp(aps[hit].id);
      return;
    }

    if (hit === -1) {
      selectAp(null);
      return;
    }

    const ap = aps[hit];
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      id: ap.id,
      startScreen: point,
      startModel: { x: ap.x, y: ap.y },
      current: { x: ap.x, y: ap.y },
      moved: false,
    };
    selectAp(ap.id);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = localPoint(event);
    const drag = dragRef.current;

    if (!drag) {
      const index = buildHitIndex(aps, viewRef.current);
      const hit = hitTest(index, point.x, point.y);
      const nextId = hit === -1 ? null : aps[hit].id;
      if (nextId !== hoveredId) setHoveredId(nextId);

      if (tool === 'add') {
        const model = toModel(viewRef.current, point);
        rendererRef.current?.setGhost(model);
        schedule();
      }
      return;
    }

    // Use the newest coalesced sample so a fast drag reports its true endpoint.
    const native = event.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
    const samples = native.getCoalescedEvents?.() ?? [];
    const latest = samples.length > 0 ? samples[samples.length - 1] : native;
    const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect();
    const screen = { x: latest.clientX - rect.left, y: latest.clientY - rect.top };

    const dx = screen.x - drag.startScreen.x;
    const dy = screen.y - drag.startScreen.y;
    if (!drag.moved && Math.hypot(dx, dy) < 2) return;

    drag.moved = true;
    const model = {
      x: drag.startModel.x + dx / viewRef.current.scale,
      y: drag.startModel.y + dy / viewRef.current.scale,
    };
    drag.current = model;
    rendererRef.current?.setTransient(drag.id, model);
    schedule();
  };

  const endDrag = (commit: boolean) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    rendererRef.current?.setTransient(null, null);
    if (commit && drag.moved) {
      moveAp(drag.id, Math.round(drag.current.x * 10) / 10, Math.round(drag.current.y * 10) / 10);
    }
    schedule();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current && dragRef.current.pointerId === event.pointerId) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      endDrag(true);
    }
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current && dragRef.current.pointerId === event.pointerId) endDrag(false);
  };

  const handlePointerLeave = () => {
    if (dragRef.current) return;
    setHoveredId(null);
    rendererRef.current?.setGhost(null);
    schedule();
  };

  // Keyboard operation that mirrors the canvas tool set.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea' || target?.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'Escape' && dragRef.current) {
        event.preventDefault();
        event.stopPropagation();
        dragRef.current = null;
        rendererRef.current?.setTransient(null, null);
        schedule();
        return;
      }
      if (event.key === 'v' || event.key === 'V') {
        setTool('select');
        return;
      }
      if (event.key === 'a' || event.key === 'A') {
        const { width, height } = sizeRef.current;
        const centre = toModel(viewRef.current, { x: width / 2, y: height / 2 });
        addAp(Math.round(centre.x), Math.round(centre.y));
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selected = usePlanner.getState().selectedId;
        if (selected !== null) {
          event.preventDefault();
          deleteAp(selected);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [addAp, deleteAp, schedule, setTool]);

  const cursor =
    tool === 'add' ? 'crosshair' : tool === 'delete' ? 'not-allowed' : hoveredId !== null ? 'grab' : 'default';

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden bg-base">
      <canvas ref={staticRef} aria-hidden="true" className="absolute inset-0 block" />
      <canvas
        ref={dynamicRef}
        aria-hidden="true"
        className="absolute inset-0 block touch-none"
        style={{ cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      />

      {aps.length > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 hidden -translate-x-1/2 lg:block">
          <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-3">
            <span className="font-medium text-ink-2">Interference graph</span>
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <span>
              {tool === 'add'
                ? 'Click to place an AP'
                : tool === 'delete'
                  ? 'Click an AP to delete it'
                  : 'Drag an AP to move · press A to add'}
            </span>
          </div>
        </div>
      )}

      {aps.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
          <div className="pointer-events-auto max-w-sm rounded-lg border border-line-strong bg-surface p-6 text-center">
            <h2 className="font-display text-xl text-ink">This canvas is empty</h2>
            <p className="mt-2 text-sm text-ink-2">
              Click anywhere to place your first AP, or start from the twelve-building campus demo.
            </p>
            <button
              type="button"
              onClick={() => usePlanner.getState().loadPreset('campus')}
              className="mt-4 inline-flex h-9 items-center rounded-md bg-accent px-3 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              Load campus demo
            </button>
          </div>
        </div>
      )}

      {import.meta.env.DEV && fps !== null && (
        <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-ink-3/70">
          frame {fps.toFixed(1)} ms
        </p>
      )}
    </div>
  );
}
