import { describe, expect, it } from "vitest";
import {
  arcPath,
  msToDeg,
  PITLINE_MS,
  TACH_MAX_MS,
  TACH_START,
  TACH_SWEEP,
  tachProgressToMs,
  tachStatus,
} from "@/lib/tach";

describe("msToDeg", () => {
  it("maps 0 ms to the dial start", () => {
    expect(msToDeg(0)).toBe(TACH_START);
  });
  it("maps max ms to the dial end", () => {
    expect(msToDeg(TACH_MAX_MS)).toBe(TACH_START + TACH_SWEEP);
  });
  it("clamps values beyond the dial", () => {
    expect(msToDeg(99999)).toBe(TACH_START + TACH_SWEEP);
  });
});

describe("tachProgressToMs", () => {
  it("starts at 0", () => {
    expect(tachProgressToMs(0)).toBe(0);
  });
  it("holds at the max during the pause phase", () => {
    expect(tachProgressToMs(0.5)).toBe(TACH_MAX_MS);
    expect(tachProgressToMs(0.59)).toBe(TACH_MAX_MS);
  });
  it("settles on pitline's turn latency", () => {
    expect(tachProgressToMs(1)).toBeCloseTo(PITLINE_MS, 5);
  });
});

describe("tachStatus", () => {
  it("is healthy below 1200 ms", () => {
    expect(tachStatus(650)).toEqual({ label: "healthy", tone: "green" });
  });
  it("is too slow from 1200 ms", () => {
    expect(tachStatus(1200).label).toBe("too slow");
  });
  it("redlines at 2000 ms", () => {
    expect(tachStatus(2000)).toEqual({ label: "caller hangs up", tone: "accent" });
  });
});

describe("arcPath", () => {
  it("produces a valid SVG arc command", () => {
    expect(arcPath(-220, 40, 128)).toMatch(/^M[\d.-]+ [\d.-]+ A 128 128 0 [01] 1 /);
  });
});
