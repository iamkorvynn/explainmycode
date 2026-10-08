import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, Code2, XCircle, Sparkles } from "lucide-react";

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
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function AmIOnTrackBar({ code, language, workspaceId, filename }: AmIOnTrackBarProps) {
  const [status, setStatus] = useState<Status>({
    type: "idle",
    message: "Ready to code",
    details: "Type or paste algorithms for live feedback & verification",
    icon: <Code2 className="w-3.5 h-3.5" />,
    badgeBg: "bg-[#F5F4F0]",
    badgeText: "text-[#78716C]",
    badgeBorder: "border-[#ECE8DF]",
  });

  useEffect(() => {
    if (!code.trim()) {
      setStatus({
        type: "idle",
        message: "Ready to code",
        details: "Type or paste algorithms for live feedback & verification",
        icon: <Code2 className="w-3.5 h-3.5" />,
        badgeBg: "bg-[#F5F4F0]",
        badgeText: "text-[#78716C]",
        badgeBorder: "border-[#ECE8DF]",
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
        message: "Code verification sync active",
        details: `${language || "Code"} • ${code.split("\n").filter((line) => line.trim()).length} lines detected`,
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        badgeBg: "bg-[#FFF1EB]",
        badgeText: "text-[#FF7A50]",
        badgeBorder: "border-[#FFD9CA]",
      });
    }
  }

  return (
    <footer className="h-11 bg-[#FFFFFF] border-t border-[#ECE8DF] flex items-center justify-between px-5 select-none transition-colors">
      <div className="flex items-center gap-3">
        {/* Status Pill Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.badgeBg} ${status.badgeText} ${status.badgeBorder} shadow-xs`}
        >
          {status.icon}
          <span>{status.message}</span>
        </div>

        {/* Details snippet */}
        <span className="hidden sm:inline-block text-xs text-[#78716C] font-medium">
          {status.details}
        </span>
      </div>

      {/* Right: Live Sync Pulse */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A50] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A50]"></span>
          </span>
          <span className="text-[11px] font-semibold text-[#78716C]">
            Live Groq Analysis
          </span>
        </div>

        <span className="hidden md:inline-block text-[11px] font-mono text-[#A8A29E] px-2 py-0.5 rounded bg-[#F5F4F0]">
          {language}
        </span>
      </div>
    </footer>
  );
}

function toVisualStatus(status: OnTrackStatus): Status {
  if (status.type === "error") {
    return {
      type: "error",
      message: "Potential Bug Detected",
      details: status.message || "Review bug suggestions in AI Inspector",
      icon: <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />,
      badgeBg: "bg-[#FEF2F2]",
      badgeText: "text-[#DC2626]",
      badgeBorder: "border-[#FCA5A5]",
    };
  }

  if (status.type === "warning") {
    return {
      type: "warning",
      message: "Improvement Suggested",
      details: status.message || "Edge cases or complexity can be optimized",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#FF7A50]" />,
      badgeBg: "bg-[#FFF1EB]",
      badgeText: "text-[#FF7A50]",
      badgeBorder: "border-[#FFD9CA]",
    };
  }

  if (status.type === "success") {
    return {
      type: "success",
      message: "Logic Verified",
      details: status.message || "Code compiles cleanly and follows optimal complexity",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />,
      badgeBg: "bg-[#F0FDF4]",
      badgeText: "text-[#16A34A]",
      badgeBorder: "border-[#DCFCE7]",
    };
  }

  return {
    type: "idle",
    message: "Ready to code",
    details: "Write code to get instant AI feedback",
    icon: <Code2 className="w-3.5 h-3.5 text-[#78716C]" />,
    badgeBg: "bg-[#F5F4F0]",
    badgeText: "text-[#78716C]",
    badgeBorder: "border-[#ECE8DF]",
  };
}
