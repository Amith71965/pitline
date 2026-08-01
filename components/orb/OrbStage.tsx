"use client";

import { useEffect, useRef, useState } from "react";
import { ORB_FRAG, ORB_VERT } from "./orbShader";
import { prefersReducedMotion } from "@/lib/reduced";

type OrbStateName = "idle" | "listening" | "thinking" | "speaking";

const ORB_STATES: Record<
  OrbStateName,
  { col: [number, number, number]; amp: number; scale: number }
> = {
  idle: { col: [0.42, 0.4, 0.38], amp: 0.1, scale: 1.0 },
  listening: { col: [0.3, 0.65, 1.0], amp: 0.55, scale: 1.03 },
  thinking: { col: [0.7, 0.55, 1.0], amp: 0.4, scale: 0.94 },
  speaking: { col: [1.0, 0.3, 0.0], amp: 0.8, scale: 1.02 },
};

const STATE_COLORS: Record<OrbStateName, string> = {
  idle: "var(--fg2)",
  listening: "var(--blue)",
  thinking: "var(--violet)",
  speaking: "var(--accent)",
};

/* Hero demo cycle so all four states and the HUD are shown. */
const CYCLE: [OrbStateName, number][] = [
  ["idle", 2600],
  ["listening", 2200],
  ["thinking", 1300],
  ["speaking", 2600],
];

const jitter = (base: number, spread: number) =>
  Math.round(base + (Math.random() * 2 - 1) * spread);

type HudValues = {
  stt: number | null;
  llm: number | null;
  tts: number | null;
  total: number | null;
};

export default function OrbStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const anim = useRef({
    cur: { col: [...ORB_STATES.idle.col], amp: ORB_STATES.idle.amp, scale: 1.0 },
    tgt: { col: [...ORB_STATES.idle.col], amp: ORB_STATES.idle.amp, scale: 1.0 },
  });
  const [orbState, setOrbState] = useState<OrbStateName>("idle");
  const [hud, setHud] = useState<HudValues>({ stt: null, llm: null, tts: null, total: null });

  /* Point the shader at the new state's targets. */
  useEffect(() => {
    const s = ORB_STATES[orbState];
    anim.current.tgt = { col: [...s.col], amp: s.amp, scale: s.scale };
  }, [orbState]);

  /* WebGL orb + CSS glow render loop. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas || !glow) return;
    const reduced = prefersReducedMotion();

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      });
    } catch {
      gl = null;
    }

    let prog: WebGLProgram | null = null;
    const uni: Record<string, WebGLUniformLocation | null> = {};

    const compile = (type: number, src: string) => {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    };

    let orbOK = false;
    if (gl) {
      const vs = compile(gl.VERTEX_SHADER, ORB_VERT);
      const fs = compile(gl.FRAGMENT_SHADER, ORB_FRAG);
      if (vs && fs) {
        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          gl.useProgram(prog);
          const buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
            gl.STATIC_DRAW,
          );
          const loc = gl.getAttribLocation(prog, "p");
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
          uni.res = gl.getUniformLocation(prog, "uRes");
          uni.t = gl.getUniformLocation(prog, "uT");
          uni.col = gl.getUniformLocation(prog, "uCol");
          uni.amp = gl.getUniformLocation(prog, "uAmp");
          uni.scale = gl.getUniformLocation(prog, "uScale");
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          orbOK = true;
        }
      }
    }

    const sizeOrb = () => {
      if (!gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || canvas.offsetWidth;
      const h = canvas.clientHeight || canvas.offsetHeight;
      canvas.width = Math.max(2, w * dpr);
      canvas.height = Math.max(2, h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    if (orbOK) {
      sizeOrb();
      window.addEventListener("resize", sizeOrb);
    }

    const start = performance.now();
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let raf = 0;
    let running = true;

    const renderOrb = (now: number) => {
      if (!running) return;
      const { cur, tgt } = anim.current;
      const t = (now - start) / 1000;
      const k = reduced ? 1 : 0.06;
      for (let i = 0; i < 3; i++) cur.col[i] = lerp(cur.col[i], tgt.col[i], k);
      cur.amp = lerp(cur.amp, tgt.amp, k);
      cur.scale = lerp(cur.scale, tgt.scale, k);
      const breath = reduced ? 0 : Math.sin(t * 0.9) * 0.5 + 0.5;
      const ampEff = cur.amp + breath * 0.05;
      const scaleEff = cur.scale * (1 + (reduced ? 0 : Math.sin(t * 0.9) * 0.02));
      if (orbOK && gl && prog) {
        gl.useProgram(prog);
        gl.uniform2f(uni.res, canvas.width, canvas.height);
        gl.uniform1f(uni.t, reduced ? 2.0 : t);
        gl.uniform3f(uni.col, cur.col[0], cur.col[1], cur.col[2]);
        gl.uniform1f(uni.amp, ampEff);
        gl.uniform1f(uni.scale, scaleEff);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      const c = anim.current.cur;
      glow.style.background = `radial-gradient(circle, rgba(${(c.col[0] * 255) | 0},${(c.col[1] * 255) | 0},${(c.col[2] * 255) | 0},${0.4 + ampEff * 0.5}), transparent 70%)`;
      if (!reduced) raf = requestAnimationFrame(renderOrb);
    };
    raf = requestAnimationFrame(renderOrb);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeOrb);
    };
  }, []);

  /* Demo state cycle driving the orb and HUD. */
  useEffect(() => {
    if (prefersReducedMotion()) {
      const t = setTimeout(() => setHud({ stt: 180, llm: 350, tts: 120, total: 650 }), 0);
      return () => clearTimeout(t);
    }
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
  }, []);

  const ms = (v: number | null) => (v === null ? "— ms" : `${v} ms`);

  return (
    <div className="orb-stage">
      <div className="orb-glow" ref={glowRef} />
      <canvas id="orb" ref={canvasRef} aria-hidden="true" />
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
