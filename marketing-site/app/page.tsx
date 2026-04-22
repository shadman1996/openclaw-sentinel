import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ZeroBreakage from "@/components/ZeroBreakage";
import SOCBacking from "@/components/SOCBacking";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ZeroBreakage />
      <SOCBacking />
      <PricingSection />
      <Footer />
    </main>
  );
}
