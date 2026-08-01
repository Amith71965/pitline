"use client";

import { useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import { useCountUp } from "@/lib/useCountUp";

export default function ProblemTicker() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  useCountUp(ref);
  return (
    <section className="ticker" ref={ref}>
      <div className="wrap sec-pad">
        <span className="label reveal">the pit wall is empty</span>
        <div className="big reveal" style={{ marginTop: 18 }}>
          <span className="hl">
            ~
            <span className="pct" data-count="30" data-suffix="%">
              0%
            </span>
          </span>{" "}
          of dealership service calls go unanswered.
        </div>
        <div className="stat-row">
          <div className="stat reveal">
            <div className="n">
              <span data-count="62">0</span>
              <span className="u">calls / mo</span>
            </div>
            <div className="cap">Missed at an average single-rooftop service department.</div>
          </div>
          <div className="stat reveal">
            <div className="n">
              $<span data-count="41" data-suffix="k">0</span>
            </div>
            <div className="cap">Lost repair-order revenue per month, unanswered calls alone.</div>
          </div>
          <div className="stat reveal">
            <div className="n">
              <span data-count="4" data-decimals="1" data-suffix=" min">0</span>
            </div>
            <div className="cap">Average hold before a caller hangs up and dials the next lot.</div>
          </div>
        </div>
        <p className="label" style={{ marginTop: 20, fontSize: 11 }}>
          figures shown are illustrative benchmarks — replace with your CRM data
        </p>
      </div>
    </section>
  );
}
