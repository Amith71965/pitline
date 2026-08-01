/* Pipeline scrub math for the "anatomy of a call" pinned section.
   Nodes sit at progress 0, .25, .5, .75, 1 along the track (2%..98%). */

export const TRACK_START = 2;
export const TRACK_SPAN = 96;

export function packetLeftPct(p: number): number {
  return TRACK_START + p * TRACK_SPAN;
}

export function fillWidthPct(p: number): number {
  return p * TRACK_SPAN;
}

export function nodeLit(index: number, p: number): boolean {
  return p >= index / 4 - 0.02;
}

export function cardOn(index: number, p: number): boolean {
  return p >= (index + 1) / 4 - 0.03;
}

/* Running turn-latency total accumulates as the packet passes each stage:
   STT ~180, +LLM ~350 → 530, +TTS ~120 → 650. */
export function turnTotalMs(p: number): number {
  if (p >= 0.75) return 650;
  if (p >= 0.5) return 530;
  if (p >= 0.25) return 180;
  return Math.round((p / 0.25) * 180);
}
