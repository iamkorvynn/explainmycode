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
  CheckCircle2,
  Cpu,
  Layers,
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
    <header className="h-16 bg-[#FFFFFF] border-b border-[#ECE8DF] flex items-center justify-between px-5 md:px-7 select-none transition-colors">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => navigate("/ide")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7A50] to-[#FF9E79] flex items-center justify-center shadow-sm shadow-[#FF7A50]/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-[17px] text-[#1E1E24] tracking-tight">
                Explain&apos;Code
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF7A50]" />
            </div>
            <span className="text-[10px] text-[#A8A29E] font-medium tracking-wide uppercase mt-0.5">
              AI Code Studio
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-[#ECE8DF]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF1EB] text-[#FF7A50] text-[11px] font-semibold border border-[#FFD9CA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A50] animate-pulse" />
            Stitch Studio
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F4F0] text-[#78716C] text-[11px] font-medium border border-[#ECE8DF]">
            <Cpu className="w-3 h-3 text-[#10B981]" />
            OnlineCompiler.io Docker
          </span>
        </div>
      </div>

      {/* Center: Purr'Coffee-Style Search Bar with Solid Coral Action Pill */}
      <div className="flex items-center gap-3 flex-1 max-w-xl mx-4">
        <div className="relative w-full flex items-center">
          <div className="w-full flex items-center bg-[#F7F6F2] hover:bg-[#F2F0EB] focus-within:bg-[#FFFFFF] border border-[#ECE8DF] focus-within:border-[#FF7A50]/50 focus-within:ring-2 focus-within:ring-[#FF7A50]/15 rounded-full pl-3.5 pr-1.5 py-1 transition-all shadow-inner">
            <Search className="w-4 h-4 text-[#A8A29E] shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbols, functions, or run command..."
              className="w-full bg-transparent text-xs text-[#1E1E24] placeholder:text-[#A8A29E] font-medium outline-none"
            />
            {/* The Coral Action Pill inside Search */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRunCode}
              disabled={isTerminalRunning}
              className="shrink-0 ml-2 px-4 py-1.5 rounded-full bg-[#FF7A50] hover:bg-[#FF6633] active:bg-[#E65F35] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#FF7A50]/30 transition-all cursor-pointer disabled:opacity-75"
            >
              {isTerminalRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Code</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Interior Navigation Pills */}
        <div className="hidden xl:flex items-center gap-1 bg-[#F5F4F0] p-1 rounded-full border border-[#ECE8DF]">
          {onToggleTerminal && (
            <button
              onClick={onToggleTerminal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                showTerminal
                  ? "bg-[#1E1E24] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1E1E24] hover:bg-white/60"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>
          )}

          <button
            onClick={() => navigate("/visualize")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#78716C] hover:text-[#1E1E24] hover:bg-white/60 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-[#FF7A50]" />
            <span>Visualizer</span>
          </button>

          <button
            onClick={() => navigate("/analysis")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#78716C] hover:text-[#1E1E24] hover:bg-white/60 transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Analysis</span>
          </button>
        </div>
      </div>

      {/* Right: Purr'Coffee-Style Profile Chip & Actions */}
      <div className="flex items-center gap-2.5">
        {/* User Profile Pill Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[#FBFBFA] hover:bg-[#F5F4F0] border border-[#ECE8DF] hover:border-[#FF7A50]/40 transition-all cursor-pointer shadow-xs"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7A50] to-[#FFB088] flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-[#1E1E24] leading-tight">
              {user?.username || "Albert Flores"}
            </span>
            <span className="text-[10px] text-[#A8A29E] leading-tight">
              {user?.email || "developer@explainmycode.dev"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E] ml-0.5" />
        </motion.div>

        {/* Settings button */}
        <button
          title="Studio Settings"
          className="w-9 h-9 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] flex items-center justify-center transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-9 h-9 rounded-full bg-[#F5F4F0] hover:bg-[#FEE2E2] text-[#78716C] hover:text-[#EF4444] border border-[#ECE8DF] hover:border-[#FCA5A5] flex items-center justify-center transition-colors cursor-pointer group"
        >
          <LogOut className="w-4 h-4 group-hover:scale-105 transition-transform" />
        </button>
      </div>
    </header>
  );
}
