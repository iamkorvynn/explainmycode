import { Code2, FileCode, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onTrySampleCode: () => void;
  onOpenEditor: () => void;
  isLoading?: boolean;
}

export function WelcomeScreen({ onTrySampleCode, onOpenEditor, isLoading = false }: WelcomeScreenProps) {
  return (
    <div className="h-full bg-[#FAF9F7] flex items-center justify-center p-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl text-center p-8 md:p-10 rounded-[28px] bg-white border border-[#ECE8DF] shadow-md shadow-[#FF7A50]/5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
          className="w-16 h-16 mx-auto mb-5 bg-gradient-to-tr from-[#FF7A50] to-[#FF9E79] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF7A50]/25"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-2xl md:text-3xl font-extrabold text-[#1E1E24] mb-2 tracking-tight"
        >
          Explain&apos;Code Studio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-xs md:text-sm text-[#78716C] mb-6 max-w-md mx-auto leading-relaxed"
        >
          {isLoading
            ? "Preparing your cloud workspace sandbox..."
            : "Select a file from the explorer, create a new one, or load an algorithm template to experience real-time AI code explanation."}
        </motion.p>

        {/* Supported Languages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <p className="text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2.5">
            Supported Container Environments
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["Python 3.14", "JavaScript ESNext", "C++ 20", "Java 21"].map((lang, index) => (
              <motion.div
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className="px-3 py-1 bg-[#F5F4F0] border border-[#ECE8DF] rounded-full text-xs font-semibold text-[#1E1E24]"
              >
                {lang}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTrySampleCode}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#FF7A50] hover:bg-[#FF6633] active:bg-[#E65F35] disabled:opacity-60 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FF7A50]/30 transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Try Sample Algorithm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenEditor}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#F5F4F0] hover:bg-[#EBE8E0] active:bg-[#E0DDD5] disabled:opacity-60 text-[#1E1E24] border border-[#ECE8DF] rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-[#78716C]" />
            <span>Open Blank File</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
