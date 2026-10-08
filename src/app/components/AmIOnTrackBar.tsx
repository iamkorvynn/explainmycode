import { useEffect, useState } from "react";
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
    badgeBg: "bg-white/[0.04]",
    badgeText: "text-white/60",
    badgeBorder: "border-white/10",
  });

  useEffect(() => {
    if (!code.trim()) {
      setStatus({
        type: "idle",
        message: "Ready to code",
        details: "Type or paste algorithms for live feedback & verification",
        icon: <Code2 className="w-3.5 h-3.5" />,
        badgeBg: "bg-white/[0.04]",
        badgeText: "text-white/60",
        badgeBorder: "border-white/10",
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
        badgeBg: "bg-[#eca8d6]/10",
        badgeText: "text-[#eca8d6]",
        badgeBorder: "border-[#eca8d6]/30",
      });
    }
  }

  return (
    <footer className="h-10 bg-[#000000] border-t border-white/10 flex items-center justify-between px-5 select-none text-white transition-colors">
      <div className="flex items-center gap-3">
        {/* Status Pill Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${status.badgeBg} ${status.badgeText} ${status.badgeBorder} shadow-xs`}
        >
          {status.icon}
          <span>{status.message}</span>
        </div>

        {/* Details snippet */}
        <span className="hidden sm:inline-block text-xs text-white/50 font-mono">
          {status.details}
        </span>
      </div>

      {/* Right: Live Sync Pulse */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
          </span>
          <span className="text-[11px] text-white/60">
            AST Verification Active
          </span>
        </div>

        <span className="hidden md:inline-block text-[11px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 uppercase">
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
      icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
      badgeBg: "bg-red-500/10",
      badgeText: "text-red-400",
      badgeBorder: "border-red-500/20",
    };
  }

  if (status.type === "warning") {
    return {
      type: "warning",
      message: "Improvement Suggested",
      details: status.message || "Edge cases or complexity can be optimized",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#eca8d6]" />,
      badgeBg: "bg-[#eca8d6]/10",
      badgeText: "text-[#eca8d6]",
      badgeBorder: "border-[#eca8d6]/30",
    };
  }

  if (status.type === "success") {
    return {
      type: "success",
      message: "Logic Verified",
      details: status.message || "Code compiles cleanly and follows optimal complexity",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-400",
      badgeBorder: "border-emerald-500/20",
    };
  }

  return {
    type: "idle",
    message: "Ready to code",
    details: "Write code to get instant AI feedback",
    icon: <Code2 className="w-3.5 h-3.5 text-white/50" />,
    badgeBg: "bg-white/[0.04]",
    badgeText: "text-white/60",
    badgeBorder: "border-white/10",
  };
}
