"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { prefersReducedMotion, useReducedMotion } from "@/lib/reduced";
import { CYCLE, GLOW_COLORS, STATE_COLORS, type OrbStateName } from "./orbStates";

/* three.js stays out of the initial bundle and never runs on the server —
   the hero's text is the LCP, not the orb. */
const Orb = dynamic(() => import("./Orb"), { ssr: false });

const jitter = (base: number, spread: number) =>
  Math.round(base + (Math.random() * 2 - 1) * spread);

type HudValues = {
  stt: number | null;
  llm: number | null;
  tts: number | null;
  total: number | null;
};

export default function OrbStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [orbState, setOrbState] = useState<OrbStateName>("idle");
  const [hud, setHud] = useState<HudValues>({ stt: null, llm: null, tts: null, total: null });
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();

  /* Pause the render loop and the demo cycle whenever the orb scrolls out of
     view, so it stops competing with the pinned scroll sections below. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const t = setTimeout(() => setHud({ stt: 180, llm: 350, tts: 120, total: 650 }), 0);
      return () => clearTimeout(t);
    }
    if (!visible) return;
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;
    const last = { stt: 0, llm: 0 };
    const runCycle = () => {
      const [name, dur] = CYCLE[idx];
      setOrbState(name);
      if (name === "listening") {
        last.stt = jitter(180, 25);
        setHud((h) => ({ ...h, stt: last.stt }));
      }
      if (name === "thinking") {
        last.llm = jitter(350, 40);
        setHud((h) => ({ ...h, llm: last.llm }));
      }
      if (name === "speaking") {
        const tts = jitter(120, 20);
        setHud((h) => ({ ...h, tts, total: last.stt + last.llm + tts }));
      }
      idx = (idx + 1) % CYCLE.length;
      timer = setTimeout(runCycle, dur);
    };
    timer = setTimeout(runCycle, 1400);
    return () => clearTimeout(timer);
  }, [visible]);

  const ms = (v: number | null) => (v === null ? "— ms" : `${v} ms`);

  return (
    <div className="orb-stage" ref={stageRef}>
      <div
        className="orb-glow"
        style={{
          background: `radial-gradient(circle, ${GLOW_COLORS[orbState]}, transparent 70%)`,
        }}
      />
      <Orb state={orbState} active={visible} reduced={reduced} />
      <div className="orb-state">
        <span className="label" style={{ color: STATE_COLORS[orbState] }}>
          {orbState}
        </span>
      </div>
      <div className="hud" role="group" aria-label="Turn latency">
        <div key={`stt-${hud.stt}`} className={hud.stt === null ? "chip" : "chip flash"}>
          <span className="k">stt</span>
          <span className="v">{ms(hud.stt)}</span>
        </div>
        <div key={`llm-${hud.llm}`} className={hud.llm === null ? "chip" : "chip flash"}>
          <span className="k">llm</span>
          <span className="v">{ms(hud.llm)}</span>
        </div>
        <div key={`tts-${hud.tts}`} className={hud.tts === null ? "chip" : "chip flash"}>
          <span className="k">tts</span>
          <span className="v">{ms(hud.tts)}</span>
        </div>
        <div
          key={`total-${hud.total}`}
          className={hud.total === null ? "total" : "total flash"}
        >
          <span className="k">turn</span>
          <span className="v">{ms(hud.total)}</span>
        </div>
      </div>
    </div>
  );
}
