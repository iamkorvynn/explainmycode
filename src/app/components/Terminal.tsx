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
import { motion, AnimatePresence } from "motion/react";

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

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (scrollRef.current && activeTab === "output") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, activeTab]);

  // Copy output to clipboard
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

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to run code
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
    <div className="h-full bg-[#070b14] flex flex-col font-mono border-t border-[#1e293b] text-[#e2e8f0] select-text">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e293b] bg-[#0c1220] select-none">
        {/* Left: Tab Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "output"
                ? "bg-[#1e293b] text-[#22c55e] border border-[#22c55e]/30 shadow-sm"
                : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#131d31]"
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Output</span>
            {output.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#1e293b] text-[#94a3b8]">
                {output.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stdin")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "stdin"
                ? "bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/30 shadow-sm"
                : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#131d31]"
            }`}
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>STDIN</span>
            {stdin.trim().length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "stats"
                ? "bg-[#1e293b] text-[#a855f7] border border-[#a855f7]/30 shadow-sm"
                : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#131d31]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>

          {/* Active Provider Badge */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-[#1e293b] text-[11px] text-[#64748b]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
            </span>
            <span className="text-[#94a3b8] font-medium">OnlineCompiler.io</span>
            <span className="text-[10px] text-[#475569]">· Sandboxed Docker</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Stats Pill */}
          {executionStats?.timeMs != null && (
            <div className="hidden md:flex items-center gap-2 px-2 py-0.5 rounded bg-[#131d31] border border-[#1e293b] text-[10px] text-[#94a3b8]">
              <span className="flex items-center gap-1 text-[#22c55e]">
                <Clock className="w-2.5 h-2.5" />
                {executionStats.timeMs}ms
              </span>
              {executionStats.memoryKb != null && (
                <span className="flex items-center gap-1 text-[#38bdf8]">
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-[#16a34a] to-[#22c55e] hover:from-[#15803d] hover:to-[#16a34a] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Run</span>
                </>
              )}
            </motion.button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!output.length}
            title="Copy output"
            className="p-1.5 rounded hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            disabled={!output.length}
            title="Clear terminal"
            className="p-1.5 rounded hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize Toggle */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore panel" : "Maximize panel"}
              className="p-1.5 rounded hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              title="Close terminal"
              className="p-1.5 rounded hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-[#94a3b8] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Tab 1: Output / Console */}
        {activeTab === "output" && (
          <div className="h-full flex flex-col">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs leading-relaxed select-text scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent"
            >
              {output.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748b]">
                  <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center mb-3 text-[#22c55e]/80">
                    <TerminalIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#cbd5e1] mb-1">
                    Terminal Ready
                  </h4>
                  <p className="text-xs text-[#64748b] max-w-sm mb-4 leading-normal">
                    Execution powered by <span className="text-[#38bdf8]">OnlineCompiler.io</span>.
                    Supports Python, TypeScript, C++, and Java in sandboxed containers.
                  </p>
                  {onRunCode && (
                    <button
                      onClick={onRunCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs text-[#e2e8f0] font-medium transition-all"
                    >
                      <Play className="w-3 h-3 text-[#22c55e] fill-[#22c55e]" />
                      <span>Run Code (Ctrl+Enter)</span>
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
                      className={`whitespace-pre-wrap break-words font-mono ${
                        isCommand
                          ? "text-[#38bdf8] font-semibold py-0.5"
                          : isSuccess
                          ? "text-[#22c55e] font-semibold py-0.5 border-t border-[#1e293b]/60 mt-1 pt-1"
                          : isErr
                          ? "text-[#f87171] bg-[#f87171]/10 px-1.5 py-0.5 rounded border border-[#f87171]/20 my-0.5"
                          : "text-[#f1f5f9]"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              )}

              {/* Running Spinner */}
              {isLoading && (
                <div className="flex items-center gap-2 py-1 text-[#38bdf8] text-xs">
                  <div className="w-3 h-3 border-2 border-[#38bdf8]/30 border-t-[#38bdf8] rounded-full animate-spin" />
                  <span>Executing in sandboxed container...</span>
                </div>
              )}
            </div>

            {/* Sticky Quick-Stdin Input at Bottom of Output */}
            <div className="border-t border-[#1e293b] bg-[#0c1220] px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                STDIN
              </span>
              <input
                type="text"
                value={stdin}
                onChange={(e) => onStdinChange(e.target.value)}
                placeholder="Type input for programs using input(), cin, or scanf... (press Enter or Run)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onRunCode && !isLoading) {
                    onRunCode();
                  }
                }}
                className="flex-1 bg-[#070b14] border border-[#1e293b] rounded px-2.5 py-1 text-xs text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#38bdf8] transition-colors"
              />
              {stdin && (
                <button
                  onClick={() => onStdinChange("")}
                  className="text-[10px] text-[#64748b] hover:text-[#94a3b8] px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: STDIN Full Editor */}
        {activeTab === "stdin" && (
          <div className="h-full p-4 flex flex-col bg-[#070b14] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#94a3b8]">
              <div className="flex items-center gap-1.5 font-medium">
                <CornerDownLeft className="w-4 h-4 text-[#38bdf8]" />
                <span>Standard Input (STDIN)</span>
              </div>
              <span className="text-[11px] text-[#64748b]">
                Passed directly to the process standard input stream
              </span>
            </div>

            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Paste or type multi-line test input here...&#10;Line 1&#10;Line 2&#10;Line 3"
              className="flex-1 w-full bg-[#0c1220] border border-[#1e293b] rounded-lg p-3 text-xs text-[#f1f5f9] placeholder-[#475569] font-mono focus:outline-none focus:border-[#38bdf8] transition-colors resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#64748b]">
                {stdin.length} characters · {stdin.split("\n").length} line(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStdinChange("")}
                  className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-xs text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
                >
                  Clear STDIN
                </button>
                {onRunCode && (
                  <button
                    onClick={() => {
                      setActiveTab("output");
                      onRunCode();
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium transition-colors"
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
          <div className="h-full p-4 overflow-y-auto bg-[#070b14]">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#a855f7]" />
                  <h4 className="text-sm font-semibold text-[#f1f5f9]">
                    Execution Performance & Diagnostics
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 font-medium">
                  OnlineCompiler.io Active
                </span>
              </div>

              {executionStats ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span>Execution Time</span>
                    </div>
                    <div className="text-lg font-bold text-[#f1f5f9]">
                      {executionStats.timeMs != null ? `${executionStats.timeMs} ms` : "N/A"}
                    </div>
                    <span className="text-[10px] text-[#64748b]">Real elapsed time in container</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-1">
                      <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Memory Used</span>
                    </div>
                    <div className="text-lg font-bold text-[#f1f5f9]">
                      {executionStats.memoryKb != null
                        ? `${(executionStats.memoryKb / 1024).toFixed(1)} MB`
                        : "N/A"}
                    </div>
                    <span className="text-[10px] text-[#64748b]">Max resident memory set</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-1">
                      {hasError ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#f87171]" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                      )}
                      <span>Exit Status</span>
                    </div>
                    <div className="text-lg font-bold text-[#f1f5f9]">
                      {executionStats.exitStatus ?? "Success"}
                    </div>
                    <span className="text-[10px] text-[#64748b]">Process return code</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0c1220] border border-[#1e293b]">
                    <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-1">
                      <FileCode className="w-3.5 h-3.5 text-[#a855f7]" />
                      <span>Engine & Environment</span>
                    </div>
                    <div className="text-sm font-bold text-[#f1f5f9]">
                      {executionStats.provider ?? "compiler-io"}
                    </div>
                    <span className="text-[10px] text-[#64748b]">Isolated container execution</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[#64748b] text-xs">
                  Run your code to capture execution timing and memory metrics.
                </div>
              )}

              {/* Supported Languages Info */}
              <div className="p-3 rounded-lg bg-[#0c1220]/60 border border-[#1e293b] text-xs space-y-1.5">
                <div className="font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Compiler Configuration</span>
                </div>
                <p className="text-[11px] text-[#94a3b8]">
                  • <strong className="text-[#f1f5f9]">Python:</strong> Python 3.14 (CPython runtime)<br />
                  • <strong className="text-[#f1f5f9]">JavaScript / TypeScript:</strong> TypeScript / Deno runtime<br />
                  • <strong className="text-[#f1f5f9]">C / C++:</strong> GCC 15 / G++ 15 compiler<br />
                  • <strong className="text-[#f1f5f9]">Java:</strong> OpenJDK 25 runtime
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
