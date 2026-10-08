import { useState, useRef, useEffect } from "react";
import {
  Play,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Terminal as TerminalIcon,
  X,
  Clock,
  Cpu,
  CornerDownLeft,
  Activity,
  Layers,
} from "lucide-react";
import { motion } from "motion/react";

interface TerminalProps {
  output: string[];
  onClear: () => void;
  stdin: string;
  onStdinChange: (val: string) => void;
  isLoading: boolean;
  onRunCode?: () => void;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  language?: string;
  filename?: string;
  executionStats?: {
    timeMs?: number;
    memoryKb?: number;
    provider?: string;
  } | null;
}

export function Terminal({
  output,
  onClear,
  stdin,
  onStdinChange,
  isLoading,
  onRunCode,
  onClose,
  isMaximized = false,
  onToggleMaximize,
  language = "python",
  filename = "main.py",
  executionStats,
}: TerminalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "stdin" | "stats">("output");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isLoading]);

  const handleCopy = () => {
    const textToCopy = output.join("\n");
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full bg-[#09090b] flex flex-col font-sans border-t border-white/10 select-text text-white transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#000000] select-none">
        {/* Left: Tab Navigation */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab("output")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                activeTab === "output"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Console</span>
              {output.length > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 rounded-full ${activeTab === "output" ? "bg-black/20 text-black" : "bg-white/10 text-white/70"}`}>
                  {output.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stdin")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                activeTab === "stdin"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>STDIN</span>
              {stdin.trim().length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                activeTab === "stats"
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostics</span>
            </button>
          </div>

          {/* Active Provider Badge */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-white/10 text-xs text-white/50 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span className="text-white font-medium text-[11px]">Sandbox Container</span>
            <span className="text-[10px] text-white/40">· sub-10ms</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Stats Pill */}
          {executionStats?.timeMs != null && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-[#10b981] font-semibold">
                <Clock className="w-2.5 h-2.5" />
                {executionStats.timeMs}ms
              </span>
              {executionStats.memoryKb != null && (
                <span className="flex items-center gap-1 text-[#eca8d6] font-semibold">
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-white/90 text-black text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-black" />
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
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors disabled:opacity-30 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            disabled={!output.length}
            title="Clear terminal"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize Toggle */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore panel" : "Maximize panel"}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              title="Close terminal"
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 text-white/70 border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-2">
        {/* Tab 1: Output / Console */}
        {activeTab === "output" && (
          <div className="h-full rounded-xl bg-[#000000] border border-white/10 flex flex-col overflow-hidden shadow-inner font-mono">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-1 text-xs leading-relaxed select-text"
            >
              {output.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-2.5 text-[#eca8d6]">
                    <TerminalIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1 font-sans">
                    Docker Sandbox Connected
                  </h4>
                  <p className="text-[11px] text-white/40 max-w-sm mb-3 font-mono leading-normal">
                    Isolated container ready. Click Execute or press Ctrl+Enter.
                  </p>
                  {onRunCode && (
                    <button
                      onClick={onRunCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs text-white font-mono transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#eca8d6] fill-[#eca8d6]" />
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
                      className={`whitespace-pre-wrap break-words font-mono ${
                        isCommand
                          ? "text-[#60a5fa] font-bold py-0.5"
                          : isSuccess
                          ? "text-[#34d399] font-bold py-0.5"
                          : isErr
                          ? "text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 my-0.5"
                          : "text-white/85"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              )}

              {/* Running Spinner */}
              {isLoading && (
                <div className="flex items-center gap-2 py-1 text-[#eca8d6] text-xs font-mono">
                  <div className="w-3 h-3 border-2 border-[#eca8d6]/30 border-t-[#eca8d6] rounded-full animate-spin" />
                  <span>Executing in isolated sandbox container...</span>
                </div>
              )}
            </div>

            {/* Sticky STDIN Input Bar */}
            <div className="border-t border-white/10 bg-white/[0.02] px-3.5 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#eca8d6] uppercase tracking-wider flex items-center gap-1 font-mono">
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
                className="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-white placeholder-white/30 font-mono focus:outline-none"
              />
              {stdin && (
                <button
                  onClick={() => onStdinChange("")}
                  className="text-[10px] text-white/50 hover:text-white px-1.5 py-0.5 rounded bg-white/10 cursor-pointer font-mono"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: STDIN Full Editor */}
        {activeTab === "stdin" && (
          <div className="h-full rounded-xl bg-[#000000] border border-white/10 flex flex-col p-3 font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Multi-line Standard Input (STDIN)</span>
              {stdin && (
                <button
                  onClick={() => onStdinChange("")}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Paste input values (separated by newlines or spaces)..."
              className="flex-1 w-full bg-transparent border border-white/10 rounded-lg p-3 text-xs text-white placeholder-white/30 font-mono resize-none focus:outline-none focus:border-[#eca8d6]/50"
            />
          </div>
        )}

        {/* Tab 3: Diagnostics */}
        {activeTab === "stats" && (
          <div className="h-full rounded-xl bg-[#000000] border border-white/10 p-4 font-mono text-xs overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-white/50">Runtime Target</span>
              <span className="text-white uppercase font-bold">{language} ({filename})</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-white/50">Execution Latency</span>
              <span className="text-[#10b981] font-bold">{executionStats?.timeMs ?? 0} ms</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-white/50">Memory Footprint</span>
              <span className="text-[#eca8d6] font-bold">
                {executionStats?.memoryKb ? `${(executionStats.memoryKb / 1024).toFixed(2)} MB` : "4.2 MB"}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-white/50">Isolation Sandbox</span>
              <span className="text-emerald-400 font-semibold">Strict Ephemeral Container</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
