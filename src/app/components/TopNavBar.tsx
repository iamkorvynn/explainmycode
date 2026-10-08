import {
  Play,
  Sparkles,
  Settings,
  BarChart3,
  Eye,
  LogOut,
  ChevronDown,
  Terminal as TerminalIcon,
  Search,
  Cpu,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface TopNavBarProps {
  onRunCode: () => void;
  onToggleTerminal?: () => void;
  showTerminal?: boolean;
  isTerminalRunning?: boolean;
}

export function TopNavBar({
  onRunCode,
  onToggleTerminal,
  showTerminal = false,
  isTerminalRunning = false,
}: TopNavBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-[#000000] border-b border-white/10 flex items-center justify-between px-5 md:px-7 select-none text-white transition-colors">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => navigate("/ide")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-[#eca8d6] transition-colors">
            <Sparkles className="w-4 h-4 text-[#eca8d6]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display text-lg tracking-tight text-white">
                EXPLAIN&apos;CODE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6]" />
            </div>
            <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase mt-0.5">
              Code Intelligence Studio
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-white/80 text-[11px] font-mono border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6] animate-pulse" />
            AI AST Engine
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] text-white/70 text-[11px] font-mono border border-white/10">
            <Cpu className="w-3 h-3 text-[#10b981]" />
            Docker Sandbox · 29 Regions
          </span>
        </div>
      </div>

      {/* Center: Search Bar with Execute Pill */}
      <div className="flex items-center gap-3 flex-1 max-w-xl mx-4">
        <div className="relative w-full flex items-center">
          <div className="w-full flex items-center bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-black border border-white/10 focus-within:border-[#eca8d6]/50 focus-within:ring-1 focus-within:ring-[#eca8d6]/30 rounded-full pl-3.5 pr-1.5 py-1 transition-all">
            <Search className="w-3.5 h-3.5 text-white/40 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbols, functions, or jump to line..."
              className="w-full bg-transparent text-xs text-white placeholder:text-white/35 font-mono outline-none"
            />
            {/* The Execute Action Pill inside Search */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRunCode}
              disabled={isTerminalRunning}
              className="shrink-0 ml-2 px-4 py-1.5 rounded-full bg-white hover:bg-white/90 active:bg-white/80 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isTerminalRunning ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-black" />
                  <span>Run Code</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Interior Navigation Pills */}
        <div className="hidden xl:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10">
          {onToggleTerminal && (
            <button
              onClick={onToggleTerminal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                showTerminal
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "text-white/60 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>
          )}

          <button
            onClick={() => navigate("/visualize")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#eca8d6]" />
            <span>Visualizer</span>
          </button>

          <button
            onClick={() => navigate("/analysis")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span>Analysis</span>
          </button>
        </div>
      </div>

      {/* Right: Profile Chip & Actions */}
      <div className="flex items-center gap-2.5">
        {/* User Profile Pill Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/25 transition-all cursor-pointer shadow-xs"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
            {user?.username ? user.username.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-white leading-tight">
              {user?.username || "Developer"}
            </span>
            <span className="text-[10px] text-white/40 font-mono leading-tight">
              {user?.email || "sandbox@explainmycode.dev"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-0.5" />
        </motion.div>

        {/* Settings button */}
        <button
          title="Studio Settings"
          className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30 flex items-center justify-center transition-colors cursor-pointer group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-105 transition-transform" />
        </button>
      </div>
    </header>
  );
}
