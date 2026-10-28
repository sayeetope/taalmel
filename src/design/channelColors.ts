/**
 * Channel color system.
 *
 * Hue advances linearly with channel number, so channels far apart in the
 * spectrum are far apart in hue — the same idea the T-coloring constraint
 * encodes. A fixed hue and chroma alone collapsed channel 6 into channel 11
 * under deuteranopia (ΔE2000 ≈ 1), so lightness steps in a three-beat rhythm.
 * The resulting triple clears ΔE2000 ≥ 15 under protan, deutan and tritan
 * simulation (worst measured pair: 22.0), and every fill clears 4.5:1 for the
 * dark node numbers.
 */
export const HUE_START = 152;
export const HUE_END = 338;
export const CHANNEL_CHROMA = 0.17;
export const CHANNEL_LIGHTNESS = [0.68, 0.6, 0.92] as const;

/** Channels 1–13 keep stable hues; wider spans compress into the same sweep. */
const REFERENCE_SPAN = 13;

export function channelHue(channel: number, maxChannel = REFERENCE_SPAN): number {
  const denominator = Math.max(REFERENCE_SPAN - 1, maxChannel - 1, 1);
  const index = Math.max(0, channel - 1);
  return HUE_START + ((HUE_END - HUE_START) * index) / denominator;
}

/** Lightness rhythm keyed to the channel, not to the span. */
export function channelLightness(channel: number): number {
  const index = Math.max(0, channel - 1);
  return CHANNEL_LIGHTNESS[index % CHANNEL_LIGHTNESS.length];
}

/** CSS color for a channel number (1-based). */
export function channelColor(channel: number, maxChannel = REFERENCE_SPAN): string {
  return `oklch(${channelLightness(channel)} ${CHANNEL_CHROMA} ${channelHue(channel, maxChannel).toFixed(1)})`;
}

/** CSS color for a coloring group (0-based), spread over the hue sweep. */
export function groupColor(group: number, groupCount = 3): string {
  const denominator = Math.max(groupCount - 1, 1);
  const hue = HUE_START + ((HUE_END - HUE_START) * Math.max(0, group)) / denominator;
  return `oklch(${CHANNEL_LIGHTNESS[group % CHANNEL_LIGHTNESS.length]} ${CHANNEL_CHROMA} ${hue.toFixed(1)})`;
}

/** All channel colors for a span, used by legends and tests. */
export function channelPalette(maxChannel: number): Array<{ channel: number; color: string }> {
  return Array.from({ length: maxChannel }, (_, i) => ({
    channel: i + 1,
    color: channelColor(i + 1, maxChannel),
  }));
}
