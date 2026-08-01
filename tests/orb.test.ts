import { describe, expect, it } from "vitest";
import {
  createOrbUniforms,
  declaredUniforms,
  ORB_FRAGMENT,
  ORB_VERTEX,
} from "@/components/orb/orbMaterial";
import { CYCLE, GLOW_COLORS, ORB_STATES, STATE_COLORS } from "@/components/orb/orbStates";

const STATES = ["idle", "listening", "thinking", "speaking"] as const;

describe("orb shaders", () => {
  it("declares only uniforms the material actually supplies", () => {
    const supplied = Object.keys(createOrbUniforms());
    const used = [...declaredUniforms(ORB_VERTEX), ...declaredUniforms(ORB_FRAGMENT)];
    expect(used.length).toBeGreaterThan(0);
    used.forEach((name) => expect(supplied).toContain(name));
  });

  it("passes displacement and lighting varyings from vertex to fragment", () => {
    ["vDisp", "vNormal", "vView"].forEach((v) => {
      expect(ORB_VERTEX).toContain(v);
      expect(ORB_FRAGMENT).toContain(v);
    });
  });

  it("displaces in the vertex stage, keeping the fragment stage cheap", () => {
    expect(ORB_VERTEX).toContain("snoise");
    expect(ORB_FRAGMENT).not.toContain("snoise");
  });

  it("writes a fragment colour and a clip position", () => {
    expect(ORB_VERTEX).toContain("gl_Position");
    expect(ORB_FRAGMENT).toContain("gl_FragColor");
  });
});

describe("orb states", () => {
  it("covers every state across shader, label and glow colours", () => {
    STATES.forEach((s) => {
      expect(ORB_STATES[s]).toBeDefined();
      expect(STATE_COLORS[s]).toBeTruthy();
      expect(GLOW_COLORS[s]).toMatch(/^rgba\(/);
    });
  });

  it("keeps colour channels and scale in sane ranges", () => {
    STATES.forEach((s) => {
      const { col, amp, scale } = ORB_STATES[s];
      col.forEach((c) => expect(c).toBeGreaterThanOrEqual(0));
      col.forEach((c) => expect(c).toBeLessThanOrEqual(1));
      expect(amp).toBeGreaterThan(0);
      expect(scale).toBeGreaterThan(0.5);
      expect(scale).toBeLessThan(1.5);
    });
  });

  it("cycles through all four states with positive durations", () => {
    expect(CYCLE.map(([name]) => name).sort()).toEqual([...STATES].sort());
    CYCLE.forEach(([, ms]) => expect(ms).toBeGreaterThan(0));
  });
});

describe("createOrbUniforms", () => {
  it("returns an independent set per material", () => {
    const a = createOrbUniforms();
    const b = createOrbUniforms();
    a.uTime.value = 42;
    expect(b.uTime.value).toBe(0);
    expect(a.uColor.value).not.toBe(b.uColor.value);
  });
});
