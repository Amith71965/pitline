import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/recalls/route";

afterEach(() => {
  vi.unstubAllGlobals();
});

const req = (qs: string) => new Request(`http://localhost/api/recalls${qs}`);

describe("GET /api/recalls", () => {
  it("rejects missing params with 400", async () => {
    const res = await GET(req("?year=2019&make=Honda"));
    expect(res.status).toBe(400);
  });

  it("proxies NHTSA results through", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ results: [{ NHTSACampaignNumber: "20V314000" }] })),
    );
    const res = await GET(req("?year=2019&make=Honda&model=Accord"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toHaveLength(1);
  });

  it("maps upstream failure to 502", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("timeout"))));
    const res = await GET(req("?year=2019&make=Honda&model=Accord"));
    expect(res.status).toBe(502);
  });
});
