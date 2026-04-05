import { useEffect, useRef } from "react";
import { Trash2, Terminal as TerminalIcon, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TerminalProps {
  output: string[];
  onClear: () => void;
  stdin: string;
  onStdinChange: (value: string) => void;
  isLoading?: boolean;
}

export function Terminal({ output, onClear, stdin, onStdinChange, isLoading }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full bg-[#0b0f19] flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f2937] bg-[#111827]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#22c55e]" />
          <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Terminal Output</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="px-2 py-1 rounded bg-[#1f2937] hover:bg-[#374151] transition-colors text-[10px] text-[#9ca3af] flex items-center gap-1.5 border border-[#374151]"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </motion.button>
      </div>

      {/* Output Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-[#1f2937] scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {output.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#4b5563] italic text-xs"
            >
              Terminal is empty. Run your code to see results...
            </motion.div>
          ) : (
            output.map((line, index) => (
              <motion.div
                key={`${index}-${line.slice(0, 10)}`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`text-sm leading-relaxed break-words ${
                  line.startsWith(">")
                    ? "text-[#22c55e] font-bold"
                    : line.toLowerCase().includes("error") || line.toLowerCase().includes("fail")
                    ? "text-[#f87171]"
                    : "text-[#e5e7eb]"
                }`}
              >
                {line}
              </motion.div>
            ))
          )}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[#22c55e] text-sm"
          >
            ● ● ●
          </motion.div>
        )}
      </div>

      {/* Stdin Input Area */}
      <div className="border-t border-[#1f2937] bg-[#111827] px-4 py-2">
        <div className="flex items-center gap-3 group bg-[#0b0f19] rounded border border-[#1f2937] px-3 py-1.5 focus-within:border-[#22c55e] transition-colors">
          <div className="flex items-center gap-1.5 text-[#22c55e]">
            <span className="text-xs font-bold font-mono">STDIN</span>
            <CornerDownLeft className="w-3 h-3 opacity-50" />
          </div>
          <input
            type="text"
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Type input for your program..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#e5e7eb] placeholder-[#4b5563]"
          />
        </div>
        <p className="mt-1 text-[10px] text-[#4b5563] ml-1">
          This value will be sent to the process when you click 'Run'
        </p>
      </div>
    </div>
  );
}
