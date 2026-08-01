import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the hero headline and call CTA", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Call it.");
    expect(screen.getAllByRole("link", { name: /start a call/i }).length).toBeGreaterThan(0);
  });

  it("renders every landing section in order", () => {
    render(<Home />);
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(headings).toEqual([
      "One lap of the pipeline.",
      "Latency is a redline.",
      "Scroll the call.",
      "This isn't a canned demo.",
      "Engineered, not vibed.",
      "Call it. Right now.",
    ]);
  });

  it("shows static HUD latency values under reduced motion", async () => {
    render(<Home />);
    const hud = screen.getByRole("group", { name: /turn latency/i });
    await waitFor(() => expect(hud).toHaveTextContent("180 ms"));
    expect(hud).toHaveTextContent("350 ms");
    expect(hud).toHaveTextContent("120 ms");
    expect(hud).toHaveTextContent("650 ms");
  });

  it("renders the tachometer at pitline's turn latency under reduced motion", () => {
    render(<Home />);
    expect(
      screen.getByRole("img", { name: /latency tachometer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("healthy")).toBeInTheDocument();
  });
});
