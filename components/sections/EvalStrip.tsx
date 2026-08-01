"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/reduced";
import { useReveal } from "@/lib/useReveal";

const CARDS = [
  {
    metric: "booking accuracy",
    val: 98.4,
    suffix: "%",
    pass: true,
    bar: 98,
    note: "Correct bay, correct time slot, correct service line.",
  },
  {
    metric: "interruption handling",
    val: 96.1,
    suffix: "%",
    pass: true,
    bar: 96,
    note: "Caller talks over the agent — it yields and re-listens.",
  },
  {
    metric: "hallucinated price",
    val: 0.3,
    suffix: "%",
    pass: false,
    bar: 30,
    note: "Quotes a number not in the price book. Target: 0.0%.",
  },
  {
    metric: "answer rate",
    val: 99.9,
    suffix: "%",
    pass: true,
    bar: 99,
    note: "Rings picked up before the first ring completes.",
  },
  {
    metric: "p50 turn latency",
    val: 647,
    suffix: " ms",
    pass: true,
    bar: 78,
    note: "Median round-trip, caller word to agent audio.",
  },
  {
    metric: "p99 turn latency",
    val: 1.24,
    suffix: "s",
    pass: true,
    bar: 62,
    note: "Worst 1% still well under the redline.",
  },
];

function decimalsOf(val: number) {
  return val % 1 !== 0 ? (String(val).split(".")[1] || "").length : 0;
}

export default function EvalStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = [...section.querySelectorAll<HTMLElement>(".eval-card")];

    const finish = (card: HTMLElement) => {
      const val = parseFloat(card.dataset.val ?? "0");
      const suf = card.dataset.suffix ?? "";
      const valEl = card.querySelector<HTMLElement>(".val");
      if (valEl) valEl.textContent = val.toFixed(decimalsOf(val)) + suf;
      const bar = card.querySelector<HTMLElement>(".bar i");
      if (bar) bar.style.width = `${bar.dataset.w ?? 60}%`;
    };

    if (prefersReducedMotion()) {
      cards.forEach(finish);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const card = e.target as HTMLElement;
          const val = parseFloat(card.dataset.val ?? "0");
          const suf = card.dataset.suffix ?? "";
          const dec = decimalsOf(val);
          const valEl = card.querySelector<HTMLElement>(".val");
          const t0 = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / 1000);
            const ee = 1 - Math.pow(1 - p, 3);
            if (valEl) valEl.textContent = (val * ee).toFixed(dec) + suf;
            if (p < 1) requestAnimationFrame(step);
            else if (valEl) valEl.textContent = val.toFixed(dec) + suf;
          };
          requestAnimationFrame(step);
          const bar = card.querySelector<HTMLElement>(".bar i");
          if (bar) bar.style.width = `${bar.dataset.w ?? 60}%`;
          io.unobserve(card);
        });
      },
      { threshold: 0.5 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section id="eval" ref={sectionRef}>
      <div className="wrap sec-pad">
        <span className="label reveal">eval strip · test suite</span>
        <h2 className="reveal" style={{ marginTop: 14 }}>
          Engineered, not vibed.
        </h2>
        <p className="lede reveal" style={{ marginTop: 14 }}>
          Every build runs the suite before it ships. Green passes the bar, orange gets
          pulled from the line.
        </p>
        <div className="eval-grid">
          {CARDS.map((c) => (
            <div
              className={`eval-card reveal${c.pass ? "" : " warn"}`}
              data-val={c.val}
              data-suffix={c.suffix}
              key={c.metric}
            >
              <div className="top">
                <span className="metric">{c.metric}</span>
                <span className={`ev-chip ${c.pass ? "pass" : "fail"}`}>
                  {c.pass ? "pass" : "watch"}
                </span>
              </div>
              <div className="val">0</div>
              <div className="bar">
                <i data-w={c.bar} />
              </div>
              <div className="note">{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
