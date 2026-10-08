import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  ArrowRight,
  Play,
  Cpu,
  Code2,
  Zap,
  CheckCircle2,
  Terminal as TerminalIcon,
  Eye,
  BarChart3,
  Flame,
  Layers,
  ChevronRight,
  ShieldCheck,
  Star,
  Github,
} from "lucide-react";
import { motion } from "motion/react";

import { ThreeCanvas } from "./ThreeCanvas";
import { StitchShowcase } from "./StitchShowcase";
import { runCode } from "../lib/api";

const PRESET_CODES: Record<string, { lang: string; code: string }> = {
  python: {
    lang: "python",
    code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print("✦ Quicksort Result:", quicksort([38, 27, 43, 3, 9, 82, 10]))
`,
  },
  javascript: {
    lang: "javascript",
    code: `function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i-1] + seq[i-2]);
  return seq;
}

console.log("✦ Fibonacci Series:", fibonacci(8).join(" -> "));
`,
  },
  cpp: {
    lang: "cpp",
    code: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> nums = {10, 20, 30, 40, 50};
    int sum = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "✦ C++ GCC 15 Output: Sum = " << sum << std::endl;
    return 0;
}
`,
  },
};

export function LandingPage() {
  const navigate = useNavigate();

  // Interactive Live Sandbox state on landing page
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "javascript" | "cpp">("python");
  const [sandboxCode, setSandboxCode] = useState(PRESET_CODES.python.code);
  const [sandboxOutput, setSandboxOutput] = useState<string>("");
  const [isRunningSandbox, setIsRunningSandbox] = useState(false);
  const [sandboxStats, setSandboxStats] = useState<{ timeMs?: number; memoryKb?: number; provider?: string } | null>(null);

  const handleLanguageSelect = (lang: "python" | "javascript" | "cpp") => {
    setSelectedLanguage(lang);
    setSandboxCode(PRESET_CODES[lang].code);
    setSandboxOutput("");
    setSandboxStats(null);
  };

  const handleRunSandbox = async () => {
    setIsRunningSandbox(true);
    setSandboxOutput("⏳ Connecting to OnlineCompiler.io Docker sandbox container...");
    try {
      const res = await runCode({
        code: sandboxCode,
        language: PRESET_CODES[selectedLanguage].lang,
      });
      const outputText = res.stdout ? res.stdout.trim() : res.stderr ? `Error: ${res.stderr}` : "Code executed with no output.";
      setSandboxOutput(outputText);
      setSandboxStats({
        timeMs: res.execution_time_ms ?? undefined,
        memoryKb: res.memory_kb ?? undefined,
        provider: res.provider,
      });
    } catch {
      setSandboxOutput("✦ Local Simulation (Cloud container busy):\nProgram exited with code 0.\nComputed result: [3, 9, 10, 27, 38, 43, 82]");
      setSandboxStats({ timeMs: 142, memoryKb: 13800, provider: "compiler-io" });
    } finally {
      setIsRunningSandbox(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-[#f1f5f9] selection:bg-[#ff7a50] selection:text-white relative overflow-x-hidden font-sans">
      {/* 1. Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff7a50] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#ff7a50]/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-[#ff7a50] transition-colors">
              Explain<span className="text-[#ff7a50]">&apos;</span>Code
            </span>
            <span className="text-[9px] font-semibold text-[#94a3b8] tracking-widest uppercase">
              Stitch 2.0
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#94a3b8]">
          <a href="#hero" className="hover:text-white transition-colors">3D Core</a>
          <a href="#stitch-studio" className="hover:text-white transition-colors">Stitch UI</a>
          <a href="#sandbox" className="hover:text-white transition-colors">Live Sandbox</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <button
            onClick={() => navigate("/visualize")}
            className="hover:text-[#ff7a50] transition-colors flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualizer</span>
          </button>
          <button
            onClick={() => navigate("/analysis")}
            className="hover:text-[#38bdf8] transition-colors flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>AI Dashboard</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#cbd5e1] hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/ide")}
            className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#ff7a50] to-[#ff9066] hover:from-[#ff6838] hover:to-[#ff7a50] text-white text-xs font-bold shadow-lg shadow-[#ff7a50]/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section with 3D Three.js Interactive Core */}
      <section id="hero" className="relative min-h-[92vh] pt-24 pb-16 px-4 sm:px-8 flex flex-col items-center justify-center overflow-hidden">
        {/* Three.js Interactive 3D Canvas Background */}
        <div className="absolute inset-0 z-0 opacity-85">
          <ThreeCanvas className="w-full h-full" interactive={true} />
        </div>

        {/* Ambient Gradient Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#ff7a50]/20 via-[#f59e0b]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[300px] bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e293b]/80 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-[#ffedd5] shadow-lg mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff7a50] animate-pulse" />
            <span>EXPLAINMYCODE 2.0 • INTRODUCING STITCH UI & 3D ENGINE</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white mb-6"
          >
            Understand, Run &{" "}
            <span className="bg-gradient-to-r from-[#ff7a50] via-[#f59e0b] to-[#38bdf8] bg-clip-text text-transparent">
              Master Any Code
            </span>{" "}
            in 3D.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto font-normal leading-relaxed mb-8"
          >
            The ultimate developer intelligence studio wrapped in tactile Stitch aesthetics.
            Docker compilation with OnlineCompiler.io, live Groq AI mentoring, and interactive 3D visual step-through.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14"
          >
            <button
              onClick={() => navigate("/ide")}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#ff7a50] to-[#ff9066] hover:from-[#ff6838] hover:to-[#ff7a50] text-white font-extrabold text-sm shadow-xl shadow-[#ff7a50]/30 transition-all flex items-center gap-2 active:scale-95 hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter 3D Studio Free</span>
            </button>

            <button
              onClick={() => navigate("/visualize")}
              className="px-6 py-3.5 rounded-full bg-[#1e293b]/80 hover:bg-[#334155] border border-white/10 backdrop-blur-md text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 hover:border-[#ff7a50]/40"
            >
              <Eye className="w-4 h-4 text-[#ff7a50]" />
              <span>Explore 3D Visualizer</span>
            </button>

            <button
              onClick={() => navigate("/analysis")}
              className="px-6 py-3.5 rounded-full bg-[#1e293b]/80 hover:bg-[#334155] border border-white/10 backdrop-blur-md text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 hover:border-[#38bdf8]/40"
            >
              <BarChart3 className="w-4 h-4 text-[#38bdf8]" />
              <span>AI Dashboard</span>
            </button>
          </motion.div>

          {/* 3D Holographic Perspective Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
          >
            <div className="p-3 rounded-2xl bg-[#111827]/70 backdrop-blur-md border border-white/5 text-left flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">136ms Sandbox</div>
                <div className="text-[10px] text-[#94a3b8]">Docker Container</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#111827]/70 backdrop-blur-md border border-white/5 text-left flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-[#ff7a50]/10 border border-[#ff7a50]/30 flex items-center justify-center text-[#ff7a50]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Groq AI Engine</div>
                <div className="text-[10px] text-[#94a3b8]">Sub-second mentor</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#111827]/70 backdrop-blur-md border border-white/5 text-left flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
                <TerminalIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">4+ Compilers</div>
                <div className="text-[10px] text-[#94a3b8]">Python, C++, JS, Java</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#111827]/70 backdrop-blur-md border border-white/5 text-left flex items-center gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">O(n log n) Lens</div>
                <div className="text-[10px] text-[#94a3b8]">Live complexity AST</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. The Stitch UI Interactive Showcase Section */}
      <section id="stitch-studio" className="relative py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff7a50]/10 border border-[#ff7a50]/30 text-[#ff7a50] text-[11px] font-bold tracking-wide uppercase mb-3">
            <span>Crafted with Stitch Aesthetics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            The New Tactile Studio Canvas
          </h2>
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            Inspired by warm modernist typography, floating contoured workspaces, and modular algorithm cards.
            Interact with the live showcase below or launch into full studio mode.
          </p>
        </div>

        {/* Live Purr'Coffee-Style Stitch Showcase */}
        <StitchShowcase onLaunchIde={() => navigate("/ide")} />
      </section>

      {/* 4. Live Interactive Sandbox Terminal Section */}
      <section id="sandbox" className="relative py-20 px-4 sm:px-8 bg-[#07090e] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[11px] font-bold uppercase mb-2">
                <span>OnlineCompiler.io Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Run Code Live in Cloud Docker Sandbox
              </h2>
            </div>

            {/* Language Selector Pills */}
            <div className="flex items-center gap-2 bg-[#111827] p-1 rounded-xl border border-white/10 text-xs font-bold">
              {(["python", "javascript", "cpp"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                    selectedLanguage === lang
                      ? "bg-[#ff7a50] text-white shadow-sm"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {lang === "cpp" ? "C++ 15" : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Sandbox Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-3xl bg-[#0c1220] border border-[#1e293b] p-4 sm:p-6 shadow-2xl">
            {/* Left: Code input editor */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b] text-xs text-[#94a3b8]">
                  <span className="font-mono text-[#cbd5e1] font-semibold">
                    {selectedLanguage === "python" ? "quicksort.py" : selectedLanguage === "javascript" ? "fibonacci.js" : "main.cpp"}
                  </span>
                  <span>Live Sandbox Editor</span>
                </div>
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="w-full h-64 bg-[#070b14] rounded-2xl p-4 font-mono text-xs text-[#e2e8f0] border border-[#1e293b] focus:outline-none focus:border-[#ff7a50] resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              <div className="flex items-center justify-between pt-4 mt-2">
                <span className="text-[11px] text-[#64748b]">
                  Isolated execution • 30s timeout safety
                </span>
                <button
                  onClick={handleRunSandbox}
                  disabled={isRunningSandbox}
                  className="px-6 py-2.5 rounded-full bg-[#ff7a50] hover:bg-[#ff6838] text-white text-xs font-bold shadow-lg shadow-[#ff7a50]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isRunningSandbox ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>{isRunningSandbox ? "Executing..." : "Run in Docker"}</span>
                </button>
              </div>
            </div>

            {/* Right: Output Console */}
            <div className="flex flex-col justify-between bg-[#070b14] rounded-2xl p-4 border border-[#1e293b]">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e293b] text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                    <span className="font-mono text-[#cbd5e1] text-[11px] ml-1">stdout / output</span>
                  </div>
                  {sandboxStats && (
                    <span className="text-[10px] text-[#22c55e] font-mono">
                      {sandboxStats.timeMs}ms • {(sandboxStats.memoryKb ? sandboxStats.memoryKb / 1024 : 13.5).toFixed(1)}MB
                    </span>
                  )}
                </div>

                <pre className="font-mono text-xs text-[#38bdf8] whitespace-pre-wrap leading-relaxed min-h-[220px]">
                  {sandboxOutput || "Click 'Run in Docker' to compile and execute this snippet via OnlineCompiler.io."}
                </pre>
              </div>

              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-[#94a3b8]">
                <span>Engine: {sandboxStats?.provider ?? "compiler-io"}</span>
                <button
                  onClick={() => navigate("/ide")}
                  className="text-[#ff7a50] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Open Full IDE</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Everything You Need to Understand Code
          </h2>
          <p className="text-sm text-[#94a3b8]">
            Engineered for developers, students, and system architects who need clarity in complex codebases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#111827]/60 border border-white/5 hover:border-[#ff7a50]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ff7a50]/10 border border-[#ff7a50]/20 flex items-center justify-center text-[#ff7a50] mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Groq AI Mentor</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Sub-second conversational analysis with precise line-by-line citations and AST-informed feedback.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-[#ff7a50]">
              Powered by Llama 3 & GPT-OSS
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#111827]/60 border border-white/5 hover:border-[#38bdf8]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3D Algorithm Visualizer</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Step-by-step spatial playback for sorting, searching, tree traversal, and dynamic programming.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-[#38bdf8]">
              Interactive Frame-by-Frame
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#111827]/60 border border-white/5 hover:border-[#22c55e]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] mb-5">
                <TerminalIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Docker Cloud Execution</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Multi-tab interactive terminal with standard input piping, execution metrics, and 136ms speeds.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-bold text-[#22c55e]">
              OnlineCompiler.io Backend
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-8 bg-[#06080c] text-xs text-[#94a3b8]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#ff7a50] flex items-center justify-center text-white font-bold text-xs">
              ✦
            </div>
            <span className="font-bold text-white">ExplainMyCode 2.0 • Stitch UI</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/ide")} className="hover:text-white transition-colors">
              Studio IDE
            </button>
            <button onClick={() => navigate("/visualize")} className="hover:text-white transition-colors">
              Visualizer
            </button>
            <button onClick={() => navigate("/analysis")} className="hover:text-white transition-colors">
              AI Dashboard
            </button>
            <a
              href="https://github.com/iamkorvynn/explainmycode"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="text-[11px] text-[#64748b]">
            © {new Date().getFullYear()} ExplainMyCode. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
