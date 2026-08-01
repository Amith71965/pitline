import Hero from "@/components/sections/Hero";
import ProblemTicker from "@/components/sections/ProblemTicker";
import Pipeline from "@/components/sections/Pipeline";
import Tachometer from "@/components/sections/Tachometer";
import TranscriptScrub from "@/components/sections/TranscriptScrub";
import RecallLookup from "@/components/sections/RecallLookup";
import EvalStrip from "@/components/sections/EvalStrip";
import FooterCta from "@/components/sections/FooterCta";

export default function Home() {
  return (
    <>
      <span id="top" />
      <main id="main">
        <Hero />
        <ProblemTicker />
        <Pipeline />
        <div className="wrap">
          <div className="full-hair" />
        </div>
        <Tachometer />
        <TranscriptScrub />
        <div className="wrap">
          <div className="full-hair" />
        </div>
        <RecallLookup />
        <EvalStrip />
      </main>
      <FooterCta />
    </>
  );
}
