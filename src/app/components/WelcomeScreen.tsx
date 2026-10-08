import { Code2, FileCode, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onTrySampleCode: () => void;
  onOpenEditor: () => void;
  isLoading?: boolean;
}

export function WelcomeScreen({ onTrySampleCode, onOpenEditor, isLoading = false }: WelcomeScreenProps) {
  return (
    <div className="h-full bg-[#000000] flex items-center justify-center p-8 select-none text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl text-center p-8 md:p-10 rounded-[24px] bg-[#09090b] border border-white/10 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
          className="w-14 h-14 mx-auto mb-5 bg-white/[0.05] border border-white/15 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-7 h-7 text-[#eca8d6]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-3xl md:text-4xl font-display text-white mb-2 tracking-tight"
        >
          Explain&apos;Code Studio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-xs md:text-sm text-white/50 mb-6 max-w-md mx-auto leading-relaxed font-mono"
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
          <p className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-widest mb-2.5">
            Supported Container Environments
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap font-mono">
            {["Python 3.14", "JavaScript ESNext", "C++ 20", "Java 21"].map((lang, index) => (
              <motion.div
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className="px-3 py-1 bg-white/[0.04] border border-white/10 rounded-full text-xs text-white/80"
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
            className="px-5 py-2.5 bg-white hover:bg-white/90 active:bg-white/80 disabled:opacity-60 text-black rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-black" />
            <span>Try Sample Algorithm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenEditor}
            disabled={isLoading}
            className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] disabled:opacity-60 text-white border border-white/15 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer font-mono"
          >
            <Code2 className="w-4 h-4 text-white/60" />
            <span>Open Blank File</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
