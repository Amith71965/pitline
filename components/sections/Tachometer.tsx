"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/reduced";
import { useReveal } from "@/lib/useReveal";
import {
  arcPath,
  msToDeg,
  PITLINE_MS,
  polar,
  TACH_CX,
  TACH_CY,
  TACH_R,
  TACH_REDLINE_MS,
  TACH_START,
  TACH_SWEEP,
  tachProgressToMs,
  tachStatus,
} from "@/lib/tach";

const TONE_COLORS = {
  accent: "var(--accent)",
  dim: "var(--fg2)",
  green: "var(--green)",
} as const;

const TICKS = Array.from({ length: 7 }, (_, i) => {
  const ms = i * 500;
  const d = msToDeg(ms);
  const [x1, y1] = polar(d, TACH_R - 13);
  const [x2, y2] = polar(d, TACH_R + 2);
  const [lx, ly] = polar(d, TACH_R - 30);
  return { ms, x1, y1, x2, y2, lx, ly, red: ms >= TACH_REDLINE_MS };
});

const [redLabelX, redLabelY] = polar(msToDeg(TACH_REDLINE_MS), TACH_R + 22);

export default function Tachometer() {
  const sectionRef = useRef<HTMLElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  useReveal(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    const needle = needleRef.current;
    const val = valRef.current;
    const label = labelRef.current;
    if (!section || !needle || !val || !label) return;

    const setTach = (ms: number) => {
      needle.setAttribute("transform", `rotate(${msToDeg(ms) + 90} ${TACH_CX} ${TACH_CY})`);
      val.textContent = String(Math.round(ms));
      const { label: text, tone } = tachStatus(ms);
      label.textContent = text;
      label.style.color = TONE_COLORS[tone];
    };

    if (prefersReducedMotion()) {
      setTach(PITLINE_MS);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      setTach(0);
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=1300",
        pin: section.querySelector(".pin-h"),
        scrub: 0.6,
        onUpdate: (self) => setTach(tachProgressToMs(self.progress)),
      });
      return () => st.kill();
    });
    mm.add("(max-width: 900px)", () => {
      setTach(PITLINE_MS);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="tach" ref={sectionRef}>
      <div className="pin-h">
        <div className="wrap">
          <div className="tach-wrap">
            <div className="tach-copy">
              <span className="label reveal">the tachometer</span>
              <h2 className="reveal" style={{ marginTop: 14 }}>
                Latency is a redline.
              </h2>
              <p className="lede reveal" style={{ marginTop: 16 }}>
                Every millisecond past 2000 and the caller is gone. pitline holds in the
                healthy band — where a human never can.
              </p>
              <div className="tach-legend reveal">
                <div className="row">
                  <span className="sw" style={{ background: "var(--fg2)" }} />
                  <span>
                    front desk, busy Saturday <span className="mono">45 s+</span>
                  </span>
                </div>
                <div className="row">
                  <span className="sw" style={{ background: "var(--fg2)" }} />
                  <span>
                    voicemail <span className="mono">∞</span>
                  </span>
                </div>
                <div className="row">
                  <span className="sw" style={{ background: "var(--accent)" }} />
                  <span>
                    redline — caller hangs up <span className="mono">2000 ms</span>
                  </span>
                </div>
                <div className="row">
                  <span className="sw" style={{ background: "var(--green)" }} />
                  <span>
                    pitline turn latency <span className="mono">~650 ms</span>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <svg
                className="tach-svg"
                viewBox="0 0 400 400"
                role="img"
                aria-label="Latency tachometer showing pitline at about 650 milliseconds"
              >
                <defs>
                  <linearGradient id="redzone" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#FF4D00" stopOpacity=".5" />
                    <stop offset="1" stopColor="#FF4D00" />
                  </linearGradient>
                </defs>
                <g>
                  {TICKS.map((t) => (
                    <g key={t.ms}>
                      <line
                        x1={t.x1.toFixed(1)}
                        y1={t.y1.toFixed(1)}
                        x2={t.x2.toFixed(1)}
                        y2={t.y2.toFixed(1)}
                        stroke={t.red ? "#FF4D00" : "#8A8A93"}
                        strokeWidth="2"
                      />
                      <text
                        x={t.lx.toFixed(1)}
                        y={t.ly.toFixed(1)}
                        fill={t.red ? "#FF4D00" : "#8A8A93"}
                        fontFamily="var(--font-mono)"
                        fontSize="11"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {t.ms}
                      </text>
                    </g>
                  ))}
                  <text
                    x={redLabelX.toFixed(1)}
                    y={redLabelY.toFixed(1)}
                    fill="#FF4D00"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    letterSpacing="1"
                    textAnchor="middle"
                  >
                    REDLINE
                  </text>
                </g>
                <path
                  d={arcPath(TACH_START, TACH_START + TACH_SWEEP, TACH_R)}
                  fill="none"
                  stroke="#26262B"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d={arcPath(msToDeg(TACH_REDLINE_MS), TACH_START + TACH_SWEEP, TACH_R)}
                  fill="none"
                  stroke="url(#redzone)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <g ref={needleRef} transform={`rotate(${msToDeg(0) + 90} ${TACH_CX} ${TACH_CY})`}>
                  <line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="72"
                    stroke="#FF4D00"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="200" cy="200" r="10" fill="#0A0A0B" stroke="#FF4D00" strokeWidth="2" />
                </g>
                <circle cx="200" cy="200" r="3.5" fill="#FF4D00" />
              </svg>
              <div className="tach-read">
                <div>
                  <span className="rv" ref={valRef}>
                    0
                  </span>
                  <span className="ru"> ms</span>
                </div>
                <div className="rl label" ref={labelRef}>
                  idle
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
