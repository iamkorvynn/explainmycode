import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, Code2, XCircle } from "lucide-react";

import { getOnTrack, type OnTrackStatus } from "../lib/api";

interface AmIOnTrackBarProps {
  code: string;
  language: string;
  workspaceId?: string | null;
  filename?: string | null;
}

type StatusType = "success" | "warning" | "error" | "idle";

interface Status {
  type: StatusType;
  message: string;
  details: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

export function AmIOnTrackBar({ code, language, workspaceId, filename }: AmIOnTrackBarProps) {
  const [status, setStatus] = useState<Status>({
    type: "idle",
    message: "Ready to code",
    details: "Write or paste code to get instant AI feedback",
    icon: <Code2 className="w-5 h-5" />,
    bgColor: "bg-[#111827]",
    borderColor: "border-[#1f2937]",
  });

  useEffect(() => {
    if (!code.trim()) {
      setStatus({
        type: "idle",
        message: "Ready to code",
        details: "Write or paste code to get instant AI feedback",
        icon: <Code2 className="w-5 h-5" />,
        bgColor: "bg-[#111827]",
        borderColor: "border-[#1f2937]",
      });
      return;
    }

    const timer = setTimeout(() => {
      void analyzeCode();
    }, 1200);

    return () => clearTimeout(timer);
  }, [code, language, workspaceId, filename]);

  async function analyzeCode() {
    try {
      const response = await getOnTrack({
        code,
        language,
        workspaceId,
        filename,
      });
      setStatus(toVisualStatus(response));
    } catch {
      setStatus({
        type: "warning",
        message: "Unable to fetch live AI feedback",
        details: `${language || "Code"} • ${code.split("\n").filter((line) => line.trim()).length} lines`,
        icon: <AlertTriangle className="w-5 h-5" />,
        bgColor: "bg-[#713f12]",
        borderColor: "border-[#f59e0b]",
      });
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status.type + status.message}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`h-12 ${status.bgColor} border-t-2 ${status.borderColor} transition-all duration-500 flex items-center px-6 gap-4`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`${
            status.type === "success"
              ? "text-[#22c55e]"
              : status.type === "warning"
                ? "text-[#f59e0b]"
                : status.type === "error"
                  ? "text-[#ef4444]"
                  : "text-[#3b82f6]"
          }`}
        >
          {status.icon}
        </motion.div>

        <div className="flex-1 flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-semibold"
          >
            {status.message}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-[#9ca3af]"
          >
            {status.details}
          </motion.span>
        </div>

        {status.type !== "idle" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-xs text-[#9ca3af]">Live Analysis</span>
          </motion.div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

function toVisualStatus(status: OnTrackStatus): Status {
  if (status.type === "error") {
    return {
      ...status,
      icon: <XCircle className="w-5 h-5" />,
      bgColor: "bg-[#7f1d1d]",
      borderColor: "border-[#dc2626]",
    };
  }
  if (status.type === "warning") {
    return {
      ...status,
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: "bg-[#713f12]",
      borderColor: "border-[#f59e0b]",
    };
  }
  if (status.type === "success") {
    return {
      ...status,
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgColor: "bg-[#14532d]",
      borderColor: "border-[#22c55e]",
    };
  }
  return {
    ...status,
    icon: <Code2 className="w-5 h-5" />,
    bgColor: "bg-[#111827]",
    borderColor: "border-[#1f2937]",
  };
}
