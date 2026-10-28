const SPRITE_SIZE = 128;
const cache = new Map<string, HTMLCanvasElement>();

/**
 * A soft coverage disc rendered once per color and reused with drawImage.
 * Fills sit at 3–7% opacity so they never compete with nodes or edges.
 */
export function coverageSprite(color: string): HTMLCanvasElement {
  const cached = cache.get(color);
  if (cached) return cached;

  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext('2d');

  if (ctx) {
    const half = SPRITE_SIZE / 2;
    const gradient = ctx.createRadialGradient(half, half, SPRITE_SIZE * 0.06, half, half, half);
    gradient.addColorStop(0, withAlpha(color, 0.075));
    gradient.addColorStop(0.72, withAlpha(color, 0.045));
    gradient.addColorStop(1, withAlpha(color, 0.012));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(half, half, half, 0, Math.PI * 2);
    ctx.fill();
  }

  cache.set(color, sprite);
  return sprite;
}

/** Apply alpha to an oklch()/hex color string. */
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('oklch(')) {
    return color.replace(/^oklch\(([^)]+)\)$/, (_match, body: string) => `oklch(${body} / ${alpha})`);
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

/**
 * Conflict icon: a small rotated square with a bang, drawn once so a dense
 * graph can stamp thousands of them without per-marker path and text setup.
 * The source is rendered at 2× and scaled down, keeping it crisp on retina.
 */
export function conflictMarkerSprite(): HTMLCanvasElement {
  const cached = cache.get('conflict-marker');
  if (cached) return cached;

  const size = 28;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  if (ctx) {
    ctx.translate(size / 2, size / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ff5c3a';
    ctx.fillRect(-7, -7, 14, 14);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#0a0d1a';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0.5);
  }

  cache.set('conflict-marker', sprite);
  return sprite;
}

export function clearSpriteCache(): void {
  cache.clear();
}
