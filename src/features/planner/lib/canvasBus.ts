type LayerProvider = () => { staticCanvas: HTMLCanvasElement; dynamicCanvas: HTMLCanvasElement } | null;

let provider: LayerProvider | null = null;

/** The stage registers its layers so PNG export can composite them. */
export function registerCanvasLayers(next: LayerProvider): () => void {
  provider = next;
  return () => {
    if (provider === next) provider = null;
  };
}

export function getCanvasLayers(): ReturnType<LayerProvider> {
  return provider ? provider() : null;
}
