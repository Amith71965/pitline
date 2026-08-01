import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import RecallLookup from "@/components/sections/RecallLookup";

afterEach(() => {
  vi.unstubAllGlobals();
});

async function fillAndSubmit(year = "2019", make = "Honda", model = "Accord") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/model year/i), year);
  await user.type(screen.getByLabelText(/^make$/i), make);
  await user.type(screen.getByLabelText(/^model$/i), model);
  await user.click(screen.getByRole("button", { name: /check recalls/i }));
}

describe("RecallLookup", () => {
  it("flags empty fields instead of querying", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<RecallLookup />);
    await userEvent.click(screen.getByRole("button", { name: /check recalls/i }));
    expect(screen.getByText(/enter year · make · model/)).toBeInTheDocument();
    expect(screen.getByLabelText(/model year/i)).toHaveAttribute("aria-invalid", "true");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders live recall cards", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          results: [
            {
              NHTSACampaignNumber: "20V314000",
              Component: "FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP",
              Summary: "The fuel pump may fail.",
              ReportReceivedDate: "05/28/2020",
            },
          ],
        }),
      ),
    );
    render(<RecallLookup />);
    await fillAndSubmit();
    await waitFor(() => expect(screen.getByText("20V314000")).toBeInTheDocument());
    expect(screen.getByText(/1 open recall/)).toBeInTheDocument();
    expect(screen.getByText(/source: live NHTSA/)).toBeInTheDocument();
  });

  it("celebrates a clean vehicle", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ results: [] })));
    render(<RecallLookup />);
    await fillAndSubmit("2024", "Toyota", "Corolla");
    await waitFor(() =>
      expect(screen.getByText("No open recalls. Nice.")).toBeInTheDocument(),
    );
  });

  it("falls back to curated samples when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network"))));
    render(<RecallLookup />);
    await fillAndSubmit();
    await waitFor(() => expect(screen.getByText("20V314000")).toBeInTheDocument());
    expect(screen.getByText(/sample · offline/)).toBeInTheDocument();
  });

  it("reports unreachable when offline with no sample", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network"))));
    render(<RecallLookup />);
    await fillAndSubmit("1999", "Yugo", "GV");
    await waitFor(() => expect(screen.getByText(/NHTSA unreachable/)).toBeInTheDocument());
  });
});
