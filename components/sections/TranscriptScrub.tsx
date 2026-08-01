"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/reduced";
import { useReveal } from "@/lib/useReveal";

const CONVO = [
  { r: "caller", t: "Yeah, hi — is there an open recall on my 2019 Accord?" },
  { r: "agent", t: "Let me check that for you right now. One second." },
  { r: "caller", t: "Sure." },
  {
    r: "agent",
    t: "Yes — there's one open recall, fuel pump. I can book the fix and a diagnostic together.",
  },
  { r: "caller", t: "How soon can you get me in?" },
  { r: "agent", t: "Bay four, Thursday at 9:40 AM. Want me to lock it?" },
  { r: "caller", t: "Do it." },
  { r: "agent", t: "Booked. You'll get a text confirmation in a moment. Anything else?" },
] as const;

const ANNOS = [
  { ts: "00:03", act: "detects intent: recall check", sub: "routes to NHTSA lookup tool" },
  { ts: "00:05", act: "calls NHTSA API", sub: "vehicle: 2019 Honda Accord" },
  { ts: "00:09", act: "1 open recall found", sub: "fuel pump — 20V-XXX" },
  { ts: "00:14", act: "books bay #4, Thursday 9:40 AM", sub: "writes to DMS scheduler" },
  { ts: "00:16", act: "sends SMS confirmation", sub: "twilio · caller handset" },
] as const;

export default function TranscriptScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const msgs = [...section.querySelectorAll<HTMLElement>(".msg")];
    const annos = [...section.querySelectorAll<HTMLElement>(".anno")];

    const paint = (p: number) => {
      const shownMsg = Math.floor(p * (msgs.length + 0.4));
      msgs.forEach((m, i) => m.classList.toggle("show", i < shownMsg));
      const shownAnno = Math.floor(p * (annos.length + 0.4));
      annos.forEach((a, i) => a.classList.toggle("show", i < shownAnno));
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
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add("show");
          });
        },
        { threshold: 0.2 },
      );
      [...msgs, ...annos].forEach((el) => io.observe(el));
      return () => io.disconnect();
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="transcript" ref={sectionRef}>
      <div className="pin-h">
        <div className="wrap">
          <div className="anat-head">
            <span className="label reveal">live transcript</span>
            <h2 className="reveal" style={{ marginTop: 14 }}>
              Scroll the call.
            </h2>
          </div>
          <div className="tr-grid">
            <div
              className="iphone"
              role="img"
              aria-label="iPhone 16 Pro Max showing a live pitline call transcript"
            >
              <span className="side b-action" />
              <span className="side b-vup" />
              <span className="side b-vdn" />
              <span className="side b-power" />
              <div className="ip-screen">
                <div className="ip-island">
                  <span className="cam" />
                </div>
                <div className="ip-status">
                  <span className="ip-time">9:41</span>
                  <span className="r">
                    <svg viewBox="0 0 20 12" aria-hidden="true">
                      <rect x="0" y="7" width="3" height="5" rx="1" fill="#F2F2F0" />
                      <rect x="5" y="5" width="3" height="7" rx="1" fill="#F2F2F0" />
                      <rect x="10" y="3" width="3" height="9" rx="1" fill="#F2F2F0" />
                      <rect x="15" y="1" width="3" height="11" rx="1" fill="#F2F2F0" />
                    </svg>
                    <svg viewBox="0 0 16 12" aria-hidden="true">
                      <path
                        d="M8 2.4c2.3 0 4.4.9 6 2.4l-1.4 1.5A6.6 6.6 0 0 0 8 4.5 6.6 6.6 0 0 0 3.4 6.3L2 4.8A9.6 9.6 0 0 1 8 2.4Zm0 3.5c1.4 0 2.6.5 3.5 1.4l-1.4 1.5A2.9 2.9 0 0 0 8 8a2.9 2.9 0 0 0-2.1.8L4.5 7.3A5 5 0 0 1 8 5.9Zm0 3.4 1.4 1.4L8 11.7 6.6 10.3 8 9.3Z"
                        fill="#F2F2F0"
                      />
                    </svg>
                    <svg viewBox="0 0 28 12" aria-hidden="true">
                      <rect
                        x="1"
                        y="1"
                        width="22"
                        height="10"
                        rx="3"
                        fill="none"
                        stroke="#F2F2F0"
                        strokeOpacity=".5"
                      />
                      <rect x="3" y="3" width="15" height="6" rx="1.5" fill="#3ECF8E" />
                      <rect
                        x="24.5"
                        y="4"
                        width="2"
                        height="4"
                        rx="1"
                        fill="#F2F2F0"
                        fillOpacity=".5"
                      />
                    </svg>
                  </span>
                </div>
                <div className="callhdr">
                  <span className="mini" />
                  <span className="who">pitline · bay desk</span>
                  <span className="st">● 00:14</span>
                </div>
                <div className="thread">
                  {CONVO.map((m, i) => (
                    <div className={`msg ${m.r}`} key={i}>
                      <span className="role">{m.r === "caller" ? "caller" : "pitline"}</span>
                      {m.t}
                    </div>
                  ))}
                </div>
                <div className="ip-home" />
              </div>
            </div>
            <div className="annos">
              {ANNOS.map((a) => (
                <div className="anno" key={a.ts}>
                  <span className="ts">{a.ts}</span>
                  <div className="body">
                    <div className="act">{a.act}</div>
                    <div className="sub">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
