export type OrbStateName = "idle" | "listening" | "thinking" | "speaking";

export const ORB_STATES: Record<
  OrbStateName,
  { col: [number, number, number]; amp: number; scale: number }
> = {
  idle: { col: [0.42, 0.4, 0.38], amp: 0.1, scale: 1.0 },
  listening: { col: [0.3, 0.65, 1.0], amp: 0.55, scale: 1.03 },
  thinking: { col: [0.7, 0.55, 1.0], amp: 0.4, scale: 0.94 },
  speaking: { col: [1.0, 0.3, 0.0], amp: 0.8, scale: 1.02 },
};

export const STATE_COLORS: Record<OrbStateName, string> = {
  idle: "var(--fg2)",
  listening: "var(--blue)",
  thinking: "var(--violet)",
  speaking: "var(--accent)",
};

/* Hero demo cycle so all four states and the HUD are shown. */
export const CYCLE: [OrbStateName, number][] = [
  ["idle", 2600],
  ["listening", 2200],
  ["thinking", 1300],
  ["speaking", 2600],
];

/* CSS glow colours mirror the shader tints so the blurred halo behind the
   mesh stays in step without a per-frame DOM write. */
export const GLOW_COLORS: Record<OrbStateName, string> = {
  idle: "rgba(107,102,97,0.45)",
  listening: "rgba(77,166,255,0.55)",
  thinking: "rgba(180,140,255,0.5)",
  speaking: "rgba(255,77,0,0.6)",
};
