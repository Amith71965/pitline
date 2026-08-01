"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useReveal } from "@/lib/useReveal";
import { lookupRecalls, type Recall } from "@/lib/nhtsa";

type Status =
  | { kind: "idle" }
  | { kind: "invalid" }
  | { kind: "loading" }
  | { kind: "clear" }
  | { kind: "found"; count: number; source: "live" | "sample" }
  | { kind: "unreachable" };

export default function RecallLookup() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useReveal(sectionRef);

  const [fields, setFields] = useState({ year: "", make: "", model: "" });
  const [invalid, setInvalid] = useState({ year: false, make: false, model: false });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [results, setResults] = useState<Recall[]>([]);

  /* Stagger cards in after each new result set renders. */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !results.length) return;
    const cards = [...grid.querySelectorAll<HTMLElement>(".recall-card")];
    const timers = cards.map((c, i) => setTimeout(() => c.classList.add("in"), 60 * i));
    return () => timers.forEach(clearTimeout);
  }, [results]);

  const setField = (name: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [name]: e.target.value }));
    setInvalid((v) => ({ ...v, [name]: false }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const bad = {
      year: !fields.year.trim(),
      make: !fields.make.trim(),
      model: !fields.model.trim(),
    };
    setInvalid(bad);
    if (bad.year || bad.make || bad.model) {
      setStatus({ kind: "invalid" });
      setResults([]);
      return;
    }
    setStatus({ kind: "loading" });
    setResults([]);
    try {
      const { results: found, source } = await lookupRecalls(
        fields.year.trim(),
        fields.make.trim(),
        fields.model.trim(),
      );
      setResults(found);
      setStatus(found.length ? { kind: "found", count: found.length, source } : { kind: "clear" });
    } catch {
      setStatus({ kind: "unreachable" });
    }
  }

  return (
    <section id="recalls" ref={sectionRef}>
      <div className="wrap sec-pad">
        <span className="label reveal">real recalls · nhtsa</span>
        <h2 className="reveal" style={{ marginTop: 14 }}>
          {"This isn't a canned demo."}
        </h2>
        <p className="lede reveal" style={{ marginTop: 14 }}>
          Ask it about your own car. We hit the live NHTSA recalls database — same source
          pitline calls mid-conversation.
        </p>

        <form className="recall-form reveal" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="year">Model year</label>
            <input
              id="year"
              name="year"
              inputMode="numeric"
              placeholder="2019"
              autoComplete="off"
              value={fields.year}
              onChange={setField("year")}
              aria-invalid={invalid.year}
            />
          </div>
          <div className="field">
            <label htmlFor="make">Make</label>
            <input
              id="make"
              name="make"
              placeholder="Honda"
              autoComplete="off"
              value={fields.make}
              onChange={setField("make")}
              aria-invalid={invalid.make}
            />
          </div>
          <div className="field">
            <label htmlFor="model">Model</label>
            <input
              id="model"
              name="model"
              placeholder="Accord"
              autoComplete="off"
              value={fields.model}
              onChange={setField("model")}
              aria-invalid={invalid.model}
            />
          </div>
          <button type="submit" className="btn go">
            Check recalls
          </button>
        </form>

        <div className="recall-status" aria-live="polite">
          {status.kind === "invalid" && <span className="chip warn">enter year · make · model</span>}
          {status.kind === "loading" && <span className="chip info">querying NHTSA…</span>}
          {status.kind === "clear" && <span className="chip ok">✓ clear</span>}
          {status.kind === "found" && (
            <>
              <span className="chip warn">
                {status.count} open recall{status.count > 1 ? "s" : ""}
              </span>{" "}
              {status.source === "live" ? (
                <span className="mono" style={{ color: "var(--fg2)", marginLeft: 8 }}>
                  source: live NHTSA
                </span>
              ) : (
                <span className="chip info" style={{ marginLeft: 8 }}>
                  sample · offline
                </span>
              )}
            </>
          )}
          {status.kind === "unreachable" && (
            <>
              <span className="chip warn">NHTSA unreachable</span>{" "}
              <span style={{ marginLeft: 8 }}>
                live API blocked here — try 2019 Honda Accord for a cached sample.
              </span>
            </>
          )}
        </div>

        <div className="recall-grid" ref={gridRef}>
          {status.kind === "clear" && (
            <div className="empty-good" style={{ gridColumn: "1/-1" }}>
              <span className="chip ok">no open recalls</span>
              <span className="txt">No open recalls. Nice.</span>
            </div>
          )}
          {results.map((r) => (
            <div className="recall-card" key={r.NHTSACampaignNumber}>
              <div className="cmp">{(r.Component || "Recall").split(":")[0].replace(/,/g, " · ")}</div>
              <div className="rid">{r.NHTSACampaignNumber || "—"}</div>
              <div className="summ">
                {(r.Summary || "No summary provided.").slice(0, 240)}
                {(r.Summary || "").length > 240 ? "…" : ""}
              </div>
              <div className="date">reported {r.ReportReceivedDate || "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
