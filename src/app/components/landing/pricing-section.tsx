"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";
import { useNavigate } from "react-router";

const plans = [
  {
    name: "Explorer",
    description: "For students, self-taught coders, and tinkering",
    price: { monthly: 0, annual: 0 },
    features: [
      "Unlimited basic code executions",
      "AI code explanations (50/day)",
      "Standard Docker sandbox containers",
      "Algorithm state visualizer",
      "Community Discord support",
    ],
    cta: "Start free",
    highlight: false,
    route: "/ide",
  },
  {
    name: "Developer",
    description: "For power developers and technical interview prep",
    price: { monthly: 29, annual: 24 },
    features: [
      "Unlimited AI code explanations",
      "Sub-10ms priority cloud sandbox",
      "Interactive step-through memory visualizer",
      "AST-level complexity profiler",
      "Multi-file project workspaces",
      "Export to VS Code & GitHub",
    ],
    cta: "Start 14-day trial",
    highlight: true,
    route: "/signup",
  },
  {
    name: "Enterprise",
    description: "For engineering teams and universities",
    price: { monthly: null, annual: null },
    features: [
      "Unlimited team members",
      "Dedicated private compute clusters",
      "Custom LLM fine-tuning & routing",
      "SOC 2 & enterprise audit trails",
      "99.99% SLA guarantee",
      "Dedicated developer success manager",
    ],
    cta: "Contact sales",
    highlight: false,
    route: "/signup",
  },
];

export function PricingSection() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
              <span className="w-12 h-px bg-foreground/30" />
              Transparent Pricing
            </span>
            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Pay for
              <br />
              <span className="text-stroke">results.</span>
            </h2>

            {/* Toggle Billing */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 border border-foreground/15 rounded-full bg-foreground/[0.02]">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
                  !isAnnual ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  isAnnual ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#eca8d6] text-black font-sans font-semibold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <img
                src="/images/whale.png"
                alt="Organic visual composition"
                className="w-full h-full object-contain object-center"
              />
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-0">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-background border transition-all duration-700 ${
                  plan.highlight 
                    ? "border-foreground lg:-mx-2 lg:z-10 lg:scale-105 shadow-2xl" 
                    : "border-foreground/10 lg:first:-mr-2 lg:last:-ml-2"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-[#eca8d6]" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* Plan header */}
                  <div className="mb-8 pb-8 border-b border-foreground/10">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-6xl font-display">
                          ${isAnnual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-display">Custom</span>
                    )}
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {isAnnual ? "billed annually" : "billed monthly"}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-[#eca8d6] mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(plan.route)}
                    className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group cursor-pointer ${
                      plan.highlight
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note with icons */}
        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Isolated sandbox containers
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Zero code retention
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Multi-model reasoning
            </span>
          </div>
          <button 
            onClick={() => navigate("/ide")} 
            className="text-sm underline underline-offset-4 hover:text-foreground transition-colors cursor-pointer"
          >
            Open Live Sandbox Free
          </button>
        </div>
      </div>
    </section>
  );
}
