import { Navigation } from "./landing/navigation";
import { HeroSection } from "./landing/hero-section";
import { FeaturesSection } from "./landing/features-section";
import { HowItWorksSection } from "./landing/how-it-works-section";
import { InfrastructureSection } from "./landing/infrastructure-section";
import { MetricsSection } from "./landing/metrics-section";
import { IntegrationsSection } from "./landing/integrations-section";
import { SecuritySection } from "./landing/security-section";
import { DevelopersSection } from "./landing/developers-section";
import { TestimonialsSection } from "./landing/testimonials-section";
import { PricingSection } from "./landing/pricing-section";
import { CtaSection } from "./landing/cta-section";
import { FooterSection } from "./landing/footer-section";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
