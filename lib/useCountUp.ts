"use client";

import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/reduced";

function animateCount(el: HTMLElement, reduced: boolean) {
  const to = parseFloat(el.dataset.count ?? "0");
  const dec = el.dataset.decimals ? +el.dataset.decimals : 0;
  const suf = el.dataset.suffix ?? "";
  if (reduced) {
    el.textContent = to.toFixed(dec) + suf;
    return;
  }
  const dur = 1200;
  const t0 = performance.now();
  function step(now: number) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (to * e).toFixed(dec) + suf;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = to.toFixed(dec) + suf;
  }
  requestAnimationFrame(step);
}

/* Counts every [data-count] descendant up to its value when it scrolls
   into view. Reduced motion renders final values immediately. */
export function useCountUp(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = [...root.querySelectorAll<HTMLElement>("[data-count]")];
    if (prefersReducedMotion()) {
      targets.forEach((t) => animateCount(t, true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target as HTMLElement, false);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [ref]);
}
