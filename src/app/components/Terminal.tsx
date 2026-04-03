import { Trash2, Terminal as TerminalIcon } from "lucide-react";
import { motion } from "motion/react";

interface TerminalProps {
  output: string[];
  onClear: () => void;
}

export function Terminal({ output, onClear }: TerminalProps) {
  return (
    <div className="h-full bg-[#111827] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f2937]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-[#22c55e]" />
          <span className="text-sm font-semibold text-[#e5e7eb]">Terminal</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="px-3 py-1 rounded bg-[#1f2937] hover:bg-[#374151] transition-colors text-xs text-[#9ca3af] flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </motion.button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {output.length === 0 ? (
          <div className="text-[#6b7280] italic">Terminal output will appear here...</div>
        ) : (
          output.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`mb-1 ${
                line.startsWith(">")
                  ? "text-[#22c55e]"
                  : line.toLowerCase().includes("error")
                  ? "text-[#ef4444]"
                  : "text-[#e5e7eb]"
              }`}
            >
              {line}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
