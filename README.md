# pitline

An AI service advisor for car dealerships that answers in under a second.

Pitline is a live voice agent — caller audio streams through Deepgram (STT), an LLM via OpenRouter with tool calling, and Deepgram Aura (TTS) — wrapped in a scrollytelling landing page where every number on screen is measured, not staged: real turn latency, real transcripts, real NHTSA recall data.

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- React Three Fiber (audio-reactive agent orb)
- GSAP ScrollTrigger + Lenis (scroll choreography)
- Deepgram streaming STT / Aura TTS · OpenRouter
- Vitest + Testing Library

## Develop

```bash
npm install
npm run dev
```

```bash
npm test
npm run lint
```

## Status

Early build — landing shell and design system first, voice pipeline next.
