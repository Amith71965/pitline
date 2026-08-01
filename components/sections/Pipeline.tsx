"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/reduced";
import { useReveal } from "@/lib/useReveal";
import { cardOn, fillWidthPct, nodeLit, packetLeftPct, turnTotalMs } from "@/lib/pipeline";

const NODES = [
  { nm: "Caller", tag: "inbound" },
  { nm: "Deepgram", tag: "STT" },
  { nm: "LLM", tag: "reason" },
  { nm: "Aura", tag: "TTS" },
  { nm: "Caller", tag: "hears reply" },
];

const STAGES = [
  {
    st: "stage 01 · deepgram",
    h: "Speech to text",
    p: "Streaming transcription. Words land as the caller speaks — no wait for a full sentence.",
    lat: "~180 ms",
  },
  {
    st: "stage 02 · reasoning",
    h: "Intent + action",
    p: "Reads intent, checks the schedule, decides the next move. Tools fire in the same breath.",
    lat: "~350 ms",
  },
  {
    st: "stage 03 · aura",
    h: "Text to speech",
    p: "Natural voice, first audio byte streaming before the sentence finishes generating.",
    lat: "~120 ms",
  },
];

export default function Pipeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  useReveal(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    const packet = packetRef.current;
    const fill = fillRef.current;
    const total = totalRef.current;
    if (!section || !packet || !fill || !total) return;

    const nodes = [...section.querySelectorAll<HTMLElement>(".node")];
    const cards = [...section.querySelectorAll<HTMLElement>(".stage-card")];

    const paint = (p: number) => {
      packet.style.left = `${packetLeftPct(p)}%`;
      fill.style.width = `${fillWidthPct(p)}%`;
      nodes.forEach((n, i) => n.classList.toggle("lit", nodeLit(i, p)));
      cards.forEach((c, i) => c.classList.toggle("on", cardOn(i, p)));
      total.textContent = `~${turnTotalMs(p)} ms`;
    };

    if (prefersReducedMotion()) {
      paint(1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      paint(0);
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=2600",
        pin: section.querySelector(".pin-h"),
        scrub: true,
        onUpdate: (self) => paint(self.progress),
      });
      return () => st.kill();
    });
    mm.add("(max-width: 900px)", () => {
      paint(1);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="anatomy" ref={sectionRef}>
      <div className="pin-h">
        <div className="wrap">
          <div className="anat-head">
            <span className="label reveal">anatomy of a call</span>
            <h2 className="reveal" style={{ marginTop: 14 }}>
              One lap of the pipeline.
            </h2>
          </div>

          <div className="pipe">
            <div className="pipe-track" />
            <div className="pipe-fill" ref={fillRef} />
            <div className="packet" ref={packetRef} />
            <div className="nodes">
              {NODES.map((n, i) => (
                <div className="node" key={`${n.nm}-${i}`}>
                  <span className="dot" />
                  <span className="nm">{n.nm}</span>
                  <span className="tag">{n.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cards">
            {STAGES.map((s) => (
              <div className="stage-card" key={s.st}>
                <span className="st">{s.st}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
                <div className="lat">{s.lat}</div>
              </div>
            ))}
          </div>

          <div className="runtot">
            <span className="k">turn latency</span>
            <span className="v">
              <span className="mono">0</span> →{" "}
              <span className="cur mono" ref={totalRef}>
                ~650 ms
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
