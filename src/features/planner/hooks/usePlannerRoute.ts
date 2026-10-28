import { useCallback, useEffect, useRef, useState } from 'react';

const HASH = '#planner';

/** `#planner` opens the workspace; browser Back closes it. */
export function usePlannerRoute() {
  const [open, setOpen] = useState(() => typeof window !== 'undefined' && window.location.hash === HASH);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === HASH);
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  // The dialog is rendered from app state, so Radix has no Trigger to restore
  // focus to. Remember the element that opened it and return focus on close.
  useEffect(() => {
    if (open) return;
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) requestAnimationFrame(() => trigger.focus());
  }, [open]);

  const openPlanner = useCallback(() => {
    triggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
    if (window.location.hash !== HASH) window.location.hash = 'planner';
  }, []);

  const closePlanner = useCallback(() => {
    if (window.location.hash === HASH) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setOpen(false);
  }, []);

  return { open, openPlanner, closePlanner };
}
