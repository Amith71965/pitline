/* Tachometer geometry: latency (ms) mapped onto a rev-counter dial.
   Arc runs from -220° to +40° (gap at the bottom), redline at 2000 ms. */

export const TACH_START = -220;
export const TACH_SWEEP = 260;
export const TACH_MAX_MS = 3000;
export const TACH_REDLINE_MS = 2000;
export const TACH_CX = 200;
export const TACH_CY = 200;
export const TACH_R = 128;
export const PITLINE_MS = 650;

export function polar(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [TACH_CX + r * Math.cos(a), TACH_CY + r * Math.sin(a)];
}

/* Coordinates are emitted at fixed precision so SSR and client markup match
   exactly (trig results can differ in the last ULP between engines). */
export function arcPath(a0: number, a1: number, r: number): string {
  const [x0, y0] = polar(a0, r);
  const [x1, y1] = polar(a1, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function msToDeg(ms: number): number {
  return TACH_START + (Math.min(ms, TACH_MAX_MS) / TACH_MAX_MS) * TACH_SWEEP;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* Scrub keyframes: sweep up to the redline, hold, then snap back to pitline's
   real turn latency. */
export function tachProgressToMs(p: number): number {
  if (p < 0.45) return (p / 0.45) * TACH_MAX_MS;
  if (p < 0.6) return TACH_MAX_MS;
  const q = Math.min(1, (p - 0.6) / 0.4);
  return TACH_MAX_MS + (PITLINE_MS - TACH_MAX_MS) * easeOutCubic(q);
}

export type TachStatus = { label: string; tone: "accent" | "dim" | "green" };

export function tachStatus(ms: number): TachStatus {
  if (ms >= TACH_REDLINE_MS) return { label: "caller hangs up", tone: "accent" };
  if (ms >= 1200) return { label: "too slow", tone: "dim" };
  return { label: "healthy", tone: "green" };
}
