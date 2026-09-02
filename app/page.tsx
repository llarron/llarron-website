import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import HeroSection from "@/components/HeroSection";
import SignalStrip from "@/components/SignalStrip";
import GuidanceSection from "@/components/GuidanceSection";
import FamiliarSection from "@/components/FamiliarSection";
import ApproachSection from "@/components/ApproachSection";
import AboutSection from "@/components/AboutSection";
import FaqSection from "@/components/FaqSection";
import ConsultationSection from "@/components/ConsultationSection";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import { ConsultationModalProvider } from "@/context/ConsultationModalContext";

export default function Home() {
  return (
    <ConsultationModalProvider>
      <ScrollReveal />
      <Header />
      <main id="main">
        <HeroSection />
        <SignalStrip />
        <GuidanceSection />
        <FamiliarSection />
        <ApproachSection />
        <AboutSection />
        <FaqSection />
        <ConsultationSection />
      </main>
      <Footer />
      <ConsultationModal />
    </ConsultationModalProvider>
  );
}
