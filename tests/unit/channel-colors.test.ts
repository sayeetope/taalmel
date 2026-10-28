import { describe, expect, it } from 'vitest';
import {
  converter,
  differenceCiede2000,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  parse,
  type Color,
} from 'culori';
import { channelColor, channelPalette, groupColor } from '@/design/channelColors';

const toRgb = converter('rgb');

type Deficiency = 'normal' | 'protan' | 'deutan' | 'tritan';
type Filter = (color: Color) => Color;

const filters: Record<Deficiency, Filter> = {
  normal: (color) => color,
  protan: filterDeficiencyProt(1),
  deutan: filterDeficiencyDeuter(1),
  tritan: filterDeficiencyTrit(1),
};

const ciede2000 = differenceCiede2000();

function deltaE(a: string, b: string, vision: Deficiency): number {
  const parsedA = parse(a);
  const parsedB = parse(b);
  if (!parsedA || !parsedB) throw new Error(`Could not parse ${a} / ${b}`);
  const filter = filters[vision];
  const left = toRgb(filter(parsedA));
  const right = toRgb(filter(parsedB));
  if (!left || !right) throw new Error('Could not convert channel colors to RGB');
  return ciede2000(left, right);
}

describe('channel color system', () => {
  it('returns one stable color per channel across a 13-channel span', () => {
    const palette = channelPalette(13);
    expect(palette).toHaveLength(13);
    expect(new Set(palette.map((entry) => entry.color)).size).toBe(13);
    expect(channelColor(6, 13)).toBe(palette[5].color);
  });

  it('keeps channels 1, 6 and 11 apart for protan, deutan and tritan viewers', () => {
    const colors = [1, 6, 11].map((channel) => channelColor(channel, 13));
    for (const vision of ['normal', 'protan', 'deutan', 'tritan'] as const) {
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          expect(deltaE(colors[i], colors[j], vision), `${vision} ${i}-${j}`).toBeGreaterThanOrEqual(15);
        }
      }
    }
  });

  it('keeps every adjacent channel pair distinguishable', () => {
    const colors = channelPalette(13).map((entry) => entry.color);
    for (let i = 0; i < colors.length - 1; i++) {
      expect(deltaE(colors[i], colors[i + 1], 'normal'), `channels ${i + 1}-${i + 2}`).toBeGreaterThan(5);
    }
  });

  it('gives the three coloring groups distinct colors', () => {
    const groups = [0, 1, 2].map((group) => groupColor(group, 3));
    expect(new Set(groups).size).toBe(3);
  });
});
