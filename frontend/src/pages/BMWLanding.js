import { LeadProvider } from "@/lib/leadContext";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Triggers from "@/components/landing/Triggers";
import Comparison from "@/components/landing/Comparison";
import Calculator from "@/components/landing/Calculator";
import Team from "@/components/landing/Team";
import Cases from "@/components/landing/Cases";
import Process from "@/components/landing/Process";
import FinalCTA from "@/components/landing/FinalCTA";
import Control from "@/components/landing/Control";
import PhotoCTA from "@/components/landing/PhotoCTA";
import Guarantee from "@/components/landing/Guarantee";
import BMWMarquee from "@/components/landing/BMWMarquee";
import ReelsGallery from "@/components/landing/ReelsGallery";
import FAQSection from "@/components/landing/FAQSection";
import SeoText from "@/components/landing/SeoText";
import Footer from "@/components/landing/Footer";
import LeadDialog from "@/components/landing/LeadDialog";
import ExitIntent from "@/components/landing/ExitIntent";
import MobileCTA from "@/components/landing/MobileCTA";
import FloatingTGCalc from "@/components/landing/FloatingTGCalc";

export default function BMWLanding() {
  return (
    <LeadProvider>
      <main className="bg-[#050505] text-white" data-testid="bmw-landing">
        {/* H1 for SEO — visually included in Hero */}
        <h1 className="sr-only">Защита BMW премиальной полиуретановой плёнкой в Москве — Detail Inspector</h1>
        <Header />
        <Hero />
        <BMWMarquee />
        <Triggers />
        <Comparison />
        <Calculator />
        <Team />
        <Cases />
        <Process />
        <FinalCTA />
        <Control />
        <PhotoCTA />
        <Guarantee />
        <ReelsGallery />
        <FAQSection />
        <SeoText />
        <Footer />

        <LeadDialog />
        <ExitIntent />
        <MobileCTA />
        <FloatingTGCalc />
      </main>
    </LeadProvider>
  );
}
