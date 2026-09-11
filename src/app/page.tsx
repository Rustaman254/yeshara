import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { TokenExplainer } from "@/components/landing/TokenExplainer";
import { IncomeCalculator } from "@/components/landing/IncomeCalculator";
import { RaiseCalculator } from "@/components/landing/RaiseCalculator";
import { NoCustody } from "@/components/landing/NoCustody";
import { FeeTable } from "@/components/landing/FeeTable";
import { MarketplacePreview } from "@/components/landing/MarketplacePreview";
import { FAQSection } from "@/components/landing/FAQSection";
import { Perimeter } from "@/components/landing/Perimeter";
import { BlogSection } from "@/components/landing/BlogSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="dark">
      <Header />
      <Hero />
      <TrustBar />
      <TokenExplainer />
      <IncomeCalculator />
      <RaiseCalculator />
      <NoCustody />
      <FeeTable />
      <MarketplacePreview />
      <FAQSection />
      <Perimeter />
      <BlogSection />
      <AboutSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
