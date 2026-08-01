import { afterEach, describe, expect, it, vi } from "vitest";
import { curatedKey, lookupRecalls, NhtsaUnreachableError } from "@/lib/nhtsa";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("curatedKey", () => {
  it("normalizes casing and whitespace", () => {
    expect(curatedKey(" 2019", " Honda ", "ACCORD ")).toBe("2019|honda|accord");
  });
});

describe("lookupRecalls", () => {
  it("returns live results when the proxy responds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          results: [
            {
              NHTSACampaignNumber: "24V001000",
              Component: "BRAKES",
              Summary: "Brake issue.",
              ReportReceivedDate: "01/01/2024",
            },
          ],
        }),
      ),
    );
    const out = await lookupRecalls("2020", "Toyota", "Camry");
    expect(out.source).toBe("live");
    expect(out.results).toHaveLength(1);
    expect(out.results[0].NHTSACampaignNumber).toBe("24V001000");
  });

  it("falls back to curated samples when the proxy fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({}, { status: 502 })));
    const out = await lookupRecalls("2019", "Honda", "Accord");
    expect(out.source).toBe("sample");
    expect(out.results[0].NHTSACampaignNumber).toBe("20V314000");
  });

  it("throws NhtsaUnreachableError when offline with no sample", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network"))));
    await expect(lookupRecalls("1999", "Yugo", "GV")).rejects.toBeInstanceOf(
      NhtsaUnreachableError,
    );
  });
});
