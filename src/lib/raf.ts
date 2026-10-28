/** Schedule work at most once per animation frame. */
export function createFrameScheduler(callback: () => void): () => void {
  let handle: number | null = null;

  return () => {
    if (handle !== null) return;
    handle = requestAnimationFrame(() => {
      handle = null;
      callback();
    });
  };
}
