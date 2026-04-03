import { Code2, FileCode, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onTrySampleCode: () => void;
  onOpenEditor: () => void;
  isLoading?: boolean;
}

export function WelcomeScreen({ onTrySampleCode, onOpenEditor, isLoading = false }: WelcomeScreenProps) {
  return (
    <div className="h-full bg-[#020617] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#22c55e] to-[#3b82f6] rounded-2xl flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-[#e5e7eb] mb-4"
        >
          Welcome to ExplainMyCode
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-[#9ca3af] mb-8"
        >
          {isLoading
            ? "Preparing your workspace so you can start coding..."
            : "Create a file or load sample code to start getting explanations, bug checks, and live feedback."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <p className="text-sm text-[#6b7280] mb-3">Supported languages:</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {["Python", "JavaScript", "C++", "Java"].map((lang, index) => (
              <motion.div
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="px-4 py-2 bg-[#111827] border border-[#1f2937] rounded-lg text-sm text-[#e5e7eb]"
              >
                {lang}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTrySampleCode}
            disabled={isLoading}
            className="px-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#14532d] disabled:text-[#86efac] disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-[#22c55e]/30 transition-colors"
          >
            <FileCode className="w-5 h-5" />
            Try Sample Code
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenEditor}
            disabled={isLoading}
            className="px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1e3a8a] disabled:text-[#bfdbfe] disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-[#3b82f6]/30 transition-colors"
          >
            <Code2 className="w-5 h-5" />
            Open Editor
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
