import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { KeyInformationSection } from "@/components/sections/KeyInformationSection";
import { MotorImageryStrip } from "@/components/sections/MotorImageryStrip";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { WorkflowSection } from "@/components/sections/WorkflowSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MotorImageryStrip />
      <FeaturesSection />
      <WorkflowSection />
      <KeyInformationSection />
      <ServicesSection />
      <FaqSection />
      <ComparisonSection />
      <CtaBand />
    </>
  );
}
