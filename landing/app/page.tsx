import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import QuickInstall from "@/components/quick-install";
import StartPracticing from "@/components/start-practicing";
import Problem from "@/components/problem";
import HowItWorks from "@/components/how-it-works";
import Tracks from "@/components/tracks";
import Comparison from "@/components/comparison";
import Preview from "@/components/preview";
import OpenSource from "@/components/open-source";
import Community from "@/components/community";
import CTA from "@/components/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickInstall />
        <StartPracticing />
        <Problem />
        <HowItWorks />
        <Tracks />
        <Comparison />
        <Preview />
        <OpenSource />
        <Community />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
