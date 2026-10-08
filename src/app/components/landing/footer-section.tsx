"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const footerLinks = {
  Product: [
    { name: "Code Intelligence", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Infrastructure", href: "#infra" },
    { name: "Ecosystem", href: "#integrations" },
    { name: "Pricing", href: "#pricing" },
  ],
  Platform: [
    { name: "Code Studio", route: "/ide", badge: "Live" },
    { name: "Algorithm Visualizer", route: "/visualize" },
    { name: "Security Sandbox", href: "#security" },
    { name: "Developer API", href: "#developers" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "GitHub", href: "https://github.com", external: true },
    { name: "Documentation", href: "#developers" },
    { name: "Community Discord", href: "#" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Security Architecture", href: "#security" },
  ],
};

const socialLinks = [
  { name: "GitHub", href: "https://github.com" },
  { name: "Discord", href: "#" },
  { name: "Twitter", href: "#" },
];

export function FooterSection() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(236, 168, 214, 0.25)";
      ctx.lineWidth = 1;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const y =
            height * 0.5 +
            Math.sin(x * 0.01 + time + wave * 0.5) * 30 +
            Math.sin(x * 0.02 + time * 1.5 + wave) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <footer className="relative bg-black">
      {/* Panoramic banner image */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2810%29-UnDKstODkIENp5xqTYUEpt0Sm8tNOw.png"
          alt="Bioluminescent horizon landscape"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient fade to black at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        {/* Subtle dark vignette on sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Bioluminescent canvas wave overlay */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* Footer content - black background, white text */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 mb-6 cursor-pointer text-left"
              >
                <span className="text-2xl font-display text-white">EXPLAIN&apos;CODE</span>
                <span className="text-xs text-white/40 font-mono">TM</span>
              </button>

              <p className="text-white/50 leading-relaxed mb-8 max-w-xs text-sm">
                Autonomous code intelligence and sandboxed execution platform. Understand, debug, and optimize complex software with AI.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium text-white mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      {"route" in link && link.route ? (
                        <button
                          onClick={() => navigate(link.route!)}
                          className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                          {link.name}
                          {"badge" in link && link.badge && (
                            <span className="text-[10px] px-2 py-0.5 bg-[#eca8d6] text-black font-semibold rounded-full">
                              {link.badge}
                            </span>
                          )}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          target={"external" in link && link.external ? "_blank" : undefined}
                          rel={"external" in link && link.external ? "noreferrer" : undefined}
                          className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; 2026 EXPLAIN&apos;CODE. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-white/30">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#eca8d6]" />
              All sandbox nodes operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
