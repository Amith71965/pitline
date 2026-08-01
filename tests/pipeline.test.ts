import { describe, expect, it } from "vitest";
import { cardOn, fillWidthPct, nodeLit, packetLeftPct, turnTotalMs } from "@/lib/pipeline";

describe("packet position", () => {
  it("starts at the track origin and ends at 98%", () => {
    expect(packetLeftPct(0)).toBe(2);
    expect(packetLeftPct(1)).toBe(98);
    expect(fillWidthPct(0.5)).toBe(48);
  });
});

describe("nodeLit", () => {
  it("lights nodes as the packet passes them", () => {
    expect(nodeLit(0, 0)).toBe(true);
    expect(nodeLit(4, 0.5)).toBe(false);
    expect(nodeLit(4, 1)).toBe(true);
  });
});

describe("cardOn", () => {
  it("activates each stage card after its node", () => {
    expect(cardOn(0, 0.1)).toBe(false);
    expect(cardOn(0, 0.25)).toBe(true);
    expect(cardOn(2, 0.7)).toBe(false);
    expect(cardOn(2, 0.75)).toBe(true);
  });
});

describe("turnTotalMs", () => {
  it("accumulates latency at each stage boundary", () => {
    expect(turnTotalMs(0)).toBe(0);
    expect(turnTotalMs(0.25)).toBe(180);
    expect(turnTotalMs(0.5)).toBe(530);
    expect(turnTotalMs(1)).toBe(650);
  });
  it("ramps toward the first stage before it lands", () => {
    expect(turnTotalMs(0.125)).toBe(90);
  });
});
