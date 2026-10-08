import { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  Trash2,
  Copy,
  Check,
  Play,
  CornerDownLeft,
  Maximize2,
  Minimize2,
  X,
  Activity,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

export interface ExecutionStats {
  timeMs?: number | null;
  memoryKb?: number | null;
  exitStatus?: string;
  provider?: string;
  timestamp?: string;
}

interface TerminalProps {
  output: string[];
  onClear: () => void;
  stdin: string;
  onStdinChange: (value: string) => void;
  isLoading?: boolean;
  onRunCode?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  language?: string;
  filename?: string;
  executionStats?: ExecutionStats | null;
}

type TerminalTab = "output" | "stdin" | "stats";

export function Terminal({
  output,
  onClear,
  stdin,
  onStdinChange,
  isLoading = false,
  onRunCode,
  onClose,
  isMaximized = false,
  onToggleMaximize,
  language = "python",
  filename = "main.py",
  executionStats,
}: TerminalProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>("output");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === "output") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, activeTab]);

  const handleCopy = async () => {
    if (!output.length) return;
    try {
      await navigator.clipboard.writeText(output.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (onRunCode && !isLoading) {
          onRunCode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRunCode, isLoading]);

  const hasError = output.some(
    (line) =>
      line.toLowerCase().includes("error") ||
      line.toLowerCase().includes("traceback") ||
      line.toLowerCase().includes("exception") ||
      line.toLowerCase().includes("fail")
  );

  return (
    <div className="h-full bg-[#FAF9F7] flex flex-col font-sans border-t border-[#ECE8DF] select-text transition-colors">
      {/* Stitch Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#ECE8DF] bg-[#FFFFFF] select-none">
        {/* Left: Tab Navigation */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 p-0.5 bg-[#F5F4F0] rounded-xl border border-[#ECE8DF]">
            <button
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "output"
                  ? "bg-[#FF7A50] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1E1E24]"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Console</span>
              {output.length > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 rounded-full ${activeTab === "output" ? "bg-white/20 text-white" : "bg-[#ECE8DF] text-[#78716C]"}`}>
                  {output.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stdin")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "stdin"
                  ? "bg-[#FF7A50] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1E1E24]"
              }`}
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>STDIN</span>
              {stdin.trim().length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "stats"
                  ? "bg-[#FF7A50] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1E1E24]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostics</span>
            </button>
          </div>

          {/* Active Provider Badge */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-[#ECE8DF] text-xs text-[#78716C]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[#1E1E24] font-semibold text-[11px]">OnlineCompiler.io</span>
            <span className="text-[10px] text-[#A8A29E]">· Docker Sandbox</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Stats Pill */}
          {executionStats?.timeMs != null && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5F4F0] border border-[#ECE8DF] text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                <Clock className="w-2.5 h-2.5" />
                {executionStats.timeMs}ms
              </span>
              {executionStats.memoryKb != null && (
                <span className="flex items-center gap-1 text-[#3B82F6] font-semibold">
                  <Cpu className="w-2.5 h-2.5" />
                  {(executionStats.memoryKb / 1024).toFixed(1)}MB
                </span>
              )}
            </div>
          )}

          {/* Run Code Button */}
          {onRunCode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRunCode}
              disabled={isLoading}
              title="Run code (Ctrl+Enter)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A50] hover:bg-[#FF6633] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Execute</span>
                </>
              )}
            </motion.button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!output.length}
            title="Copy output"
            className="p-1.5 rounded-lg bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] transition-colors disabled:opacity-40 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            disabled={!output.length}
            title="Clear terminal"
            className="p-1.5 rounded-lg bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize Toggle */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore panel" : "Maximize panel"}
              className="p-1.5 rounded-lg bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] transition-colors cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              title="Close terminal"
              className="p-1.5 rounded-lg bg-[#F5F4F0] hover:bg-[#FEE2E2] hover:text-[#EF4444] text-[#78716C] border border-[#ECE8DF] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: High-contrast sleek code container */}
      <div className="flex-1 overflow-hidden p-2">
        {/* Tab 1: Output / Console */}
        {activeTab === "output" && (
          <div className="h-full rounded-2xl bg-[#0F141C] border border-[#1E2530] flex flex-col overflow-hidden shadow-inner font-mono">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-1 text-xs leading-relaxed select-text"
            >
              {output.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748B]">
                  <div className="w-10 h-10 rounded-2xl bg-[#17202E] border border-[#232E42] flex items-center justify-center mb-2.5 text-[#FF7A50]">
                    <TerminalIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-[#E2E8F0] mb-1 font-sans">
                    Docker Sandbox Connected
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] max-w-sm mb-3 font-sans leading-normal">
                    Real-time execution ready via OnlineCompiler.io. Click Execute or press Ctrl+Enter.
                  </p>
                  {onRunCode && (
                    <button
                      onClick={onRunCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E2530] hover:bg-[#2A3445] border border-[#2A3445] text-xs text-[#E2E8F0] font-sans font-semibold transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#FF7A50] fill-[#FF7A50]" />
                      <span>Execute Program (Ctrl+Enter)</span>
                    </button>
                  )}
                </div>
              ) : (
                output.map((line, idx) => {
                  const isCommand = line.startsWith(">");
                  const isSuccess = line.startsWith("✓");
                  const isErr =
                    line.toLowerCase().includes("error") ||
                    line.toLowerCase().includes("traceback") ||
                    line.toLowerCase().includes("exception") ||
                    line.toLowerCase().includes("failed");

                  return (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap break-words ${
                        isCommand
                          ? "text-[#38BDF8] font-bold py-0.5"
                          : isSuccess
                          ? "text-[#34D399] font-bold py-0.5"
                          : isErr
                          ? "text-[#F87171] bg-[#F87171]/10 px-2 py-0.5 rounded border border-[#F87171]/20 my-0.5"
                          : "text-[#E2E8F0]"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              )}

              {/* Running Spinner */}
              {isLoading && (
                <div className="flex items-center gap-2 py-1 text-[#FF7A50] text-xs font-sans">
                  <div className="w-3 h-3 border-2 border-[#FF7A50]/30 border-t-[#FF7A50] rounded-full animate-spin" />
                  <span>Executing in isolated sandbox container...</span>
                </div>
              )}
            </div>

            {/* Sticky STDIN Input Bar */}
            <div className="border-t border-[#1E2530] bg-[#141A24] px-3.5 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#FF7A50] uppercase tracking-wider flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                STDIN
              </span>
              <input
                type="text"
                value={stdin}
                onChange={(e) => onStdinChange(e.target.value)}
                placeholder="Send input for input(), cin, or scanf..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onRunCode && !isLoading) {
                    onRunCode();
                  }
                }}
                className="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none"
              />
              {stdin && (
                <button
                  onClick={() => onStdinChange("")}
                  className="text-[10px] text-[#94A3B8] hover:text-white px-1.5 py-0.5 rounded bg-[#1E2530] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: STDIN Full Editor */}
        {activeTab === "stdin" && (
          <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#ECE8DF] p-4 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <div className="flex items-center gap-1.5 font-bold text-[#1E1E24]">
                <CornerDownLeft className="w-4 h-4 text-[#FF7A50]" />
                <span>Standard Input (STDIN)</span>
              </div>
              <span className="text-[11px] text-[#A8A29E]">
                Streamed directly to program stdin during execution
              </span>
            </div>

            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Paste or type multi-line test inputs here...&#10;Line 1&#10;Line 2&#10;Line 3"
              className="flex-1 w-full bg-[#F7F6F2] border border-[#ECE8DF] focus:border-[#FF7A50]/50 rounded-xl p-3 text-xs text-[#1E1E24] placeholder-[#A8A29E] font-mono focus:outline-none resize-none transition-all shadow-inner"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#A8A29E]">
                {stdin.length} characters · {stdin.split("\n").length} line(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStdinChange("")}
                  className="px-3 py-1 rounded-lg bg-[#F5F4F0] hover:bg-[#EBE8E0] text-xs font-semibold text-[#78716C] transition-colors cursor-pointer"
                >
                  Clear Input
                </button>
                {onRunCode && (
                  <button
                    onClick={() => {
                      setActiveTab("output");
                      onRunCode();
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#FF7A50] hover:bg-[#FF6633] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run With Input</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Execution Stats */}
        {activeTab === "stats" && (
          <div className="h-full rounded-2xl bg-[#FFFFFF] border border-[#ECE8DF] p-4 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#ECE8DF]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF7A50]" />
                  <h4 className="text-sm font-bold text-[#1E1E24]">
                    Sandbox Metrics & Performance
                  </h4>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF1EB] text-[#FF7A50] border border-[#FFD9CA] font-bold">
                  OnlineCompiler.io Engine
                </span>
              </div>

              {executionStats ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#ECE8DF]">
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Execution Time</span>
                    </div>
                    <div className="text-lg font-bold text-[#1E1E24]">
                      {executionStats.timeMs != null ? `${executionStats.timeMs} ms` : "N/A"}
                    </div>
                    <span className="text-[10px] text-[#A8A29E]">Real elapsed container time</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#ECE8DF]">
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] mb-1">
                      <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Memory Used</span>
                    </div>
                    <div className="text-lg font-bold text-[#1E1E24]">
                      {executionStats.memoryKb != null
                        ? `${(executionStats.memoryKb / 1024).toFixed(1)} MB`
                        : "N/A"}
                    </div>
                    <span className="text-[10px] text-[#A8A29E]">Max resident memory</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#ECE8DF]">
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] mb-1">
                      {hasError ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      )}
                      <span>Exit Status</span>
                    </div>
                    <div className="text-lg font-bold text-[#1E1E24]">
                      {executionStats.exitStatus ?? "Success"}
                    </div>
                    <span className="text-[10px] text-[#A8A29E]">Container exit code</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#ECE8DF]">
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C] mb-1">
                      <FileCode className="w-3.5 h-3.5 text-[#FF7A50]" />
                      <span>Runtime Environment</span>
                    </div>
                    <div className="text-sm font-bold text-[#1E1E24]">
                      {executionStats.provider ?? "compiler-io"}
                    </div>
                    <span className="text-[10px] text-[#A8A29E]">Dedicated Docker sandbox</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#A8A29E] text-xs">
                  Execute your code to display container timing and memory benchmarks.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
