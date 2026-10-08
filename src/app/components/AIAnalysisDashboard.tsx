import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Code2,
  LogOut,
  RefreshCcw,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ApiError, getCurrentCodeState, getDashboard, type DashboardPayload } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function AIAnalysisDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentCode = getCurrentCodeState();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const qualityData = useMemo(
    () => [
      { name: "Quality", value: data?.metrics.quality_score ?? 0, fill: "#eca8d6" },
      { name: "Background", value: 100, fill: "#18181b" },
    ],
    [data]
  );

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    if (!currentCode.code.trim()) {
      setErrorMessage("Open a file in the IDE first so the dashboard has code to analyze.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getDashboard({
        code: currentCode.code,
        language: currentCode.language,
      });
      setData(response);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Unable to load the analysis dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="h-screen w-screen bg-black p-2 md:p-3.5 overflow-hidden flex flex-col relative font-sans text-white">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#eca8d6]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Studio Canvas */}
      <div className="relative z-10 h-full w-full bg-[#09090b] rounded-[22px] md:rounded-[30px] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#09090b] border-b border-white/10 flex items-center justify-between px-5 md:px-7 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ide")}
              className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Return to IDE"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#eca8d6] shadow-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 leading-none">
                  <span className="font-serif text-[18px] text-white tracking-wide">
                    AI Analysis Dashboard
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6] animate-pulse" />
                </div>
                <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase">
                  Static & Runtime Intelligence
                </span>
              </div>
            </div>

            {data?.provider && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eca8d6]/10 text-[#eca8d6] text-[11px] font-mono font-medium border border-[#eca8d6]/20 ml-2">
                <Sparkles className="w-3 h-3" />
                {data.provider === "groq"
                  ? "Powered by Groq AI"
                  : data.provider === "claude"
                  ? "Powered by Claude AI"
                  : "Static Analysis Engine"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => void loadDashboard()}
              className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Reload Dashboard"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-medium text-white shadow-xs"
            >
              <div className="w-5 h-5 rounded-full bg-[#eca8d6] text-black flex items-center justify-center text-[10px] font-bold">
                {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
              </div>
              <span>{user?.username || "Developer"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </motion.div>

            <button
              onClick={() => void handleLogout()}
              title="Sign Out"
              className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000]">
          <div className="max-w-6xl mx-auto space-y-6">
            {isLoading ? (
              <div className="rounded-2xl border border-white/10 bg-[#09090b] p-10 text-xs text-white/60 flex items-center justify-center gap-3 shadow-xs">
                <div className="w-4 h-4 border-2 border-[#eca8d6]/30 border-t-[#eca8d6] rounded-full animate-spin" />
                <span className="font-mono text-white/70">Synthesizing intelligence metrics from your code...</span>
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-xs text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Analysis Notice</p>
                    <p className="text-red-300/80 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => void loadDashboard()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-red-500/40 text-xs font-semibold text-red-200 hover:bg-white/15 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            ) : data ? (
              <>
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    icon={<Code2 className="w-4 h-4" />}
                    title="Total Lines"
                    value={String(data.metrics.total_lines)}
                    change={data.summary.primary_language}
                    positive
                  />
                  <MetricCard
                    icon={<Cpu className="w-4 h-4" />}
                    title="Functions"
                    value={String(data.metrics.functions)}
                    change="Detected"
                    positive
                  />
                  <MetricCard
                    icon={<Zap className="w-4 h-4" />}
                    title="Algorithms"
                    value={String(data.metrics.algorithms)}
                    change={data.detected_algorithms.length ? "Matched" : "None"}
                    positive={data.metrics.algorithms > 0}
                  />
                  <MetricCard
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    title="Code Quality"
                    value={`${data.metrics.quality_score}%`}
                    change={qualityLabel(data.metrics.quality_score)}
                    positive={data.metrics.quality_score >= 70}
                  />
                </div>

                {/* Main 2-column Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary Card */}
                  <AnalysisCard title="Code Summary">
                    <div className="space-y-3">
                      <SummaryItem
                        label="Primary Language"
                        value={data.summary.primary_language}
                        icon="LANG"
                      />
                      <SummaryItem
                        label="Code Style"
                        value={data.summary.code_style}
                        icon="STYLE"
                      />
                      <SummaryItem
                        label="Documentation"
                        value={data.summary.documentation_status}
                        icon="DOCS"
                        warning={data.summary.documentation_status !== "Documented"}
                      />
                    </div>
                  </AnalysisCard>

                  {/* Detected Algorithms Card */}
                  <AnalysisCard title="Detected Algorithms">
                    <div className="space-y-2.5">
                      {data.detected_algorithms.length ? (
                        data.detected_algorithms.map((algorithm) => (
                          <AlgorithmItem
                            key={algorithm.name}
                            name={algorithm.name}
                            complexity={algorithm.complexity}
                            type={algorithm.type}
                          />
                        ))
                      ) : (
                        <div className="text-xs text-white/40 font-mono italic py-6 text-center">
                          No distinct named algorithm signature detected in current file.
                        </div>
                      )}
                    </div>
                  </AnalysisCard>

                  {/* Complexity Analysis Card */}
                  <AnalysisCard title="Complexity Bounds">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="text-white/60 font-medium">Time Complexity</span>
                          <span className="font-mono font-bold text-[#eca8d6]">
                            {data.complexity.time}
                          </span>
                        </div>
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(90, 20 + data.metrics.algorithms * 12)}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-[#eca8d6] rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="text-white/60 font-medium">Space Complexity</span>
                          <span className="font-mono font-bold text-[#38bdf8]">
                            {data.complexity.space}
                          </span>
                        </div>
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(85, 15 + data.complexity.metrics[3]?.value * 15)}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full bg-[#38bdf8] rounded-full"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart
                            data={data.complexity.metrics}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <XAxis
                              dataKey="name"
                              stroke="#71717a"
                              fontSize={11}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#71717a"
                              fontSize={11}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#09090b",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "10px",
                                color: "#ffffff",
                                fontSize: "12px",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
                              }}
                              cursor={false}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                              {data.complexity.metrics.map((entry, index) => (
                                <Cell
                                  key={`${entry.name}-${index}`}
                                  fill={index % 2 === 0 ? "#eca8d6" : "#38bdf8"}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </AnalysisCard>

                  {/* Radial Quality Score Card */}
                  <AnalysisCard title="Code Quality Index">
                    <div className="flex items-center justify-center h-60 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="65%"
                          outerRadius="95%"
                          data={qualityData}
                          startAngle={90}
                          endAngle={-270}
                          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        >
                          <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={12}
                            isAnimationActive={false}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-3xl font-serif font-bold text-white">
                          {data.metrics.quality_score}%
                        </div>
                        <div className="text-xs font-mono font-bold text-[#eca8d6] mt-0.5">
                          {qualityLabel(data.metrics.quality_score)}
                        </div>
                      </div>
                    </div>
                  </AnalysisCard>
                </div>

                {/* Optimization Suggestions Card */}
                <AnalysisCard title="Optimization & Architecture Insights">
                  <div className="space-y-2.5">
                    {data.suggestions.length ? (
                      data.suggestions.map((suggestion) => (
                        <OptimizationItem
                          key={`${suggestion.type}-${suggestion.title}`}
                          type={suggestion.type}
                          title={suggestion.title}
                          description={suggestion.description}
                          priority={suggestion.priority}
                        />
                      ))
                    ) : (
                      <div className="text-xs text-white/40 font-mono italic py-6 text-center">
                        Code follows optimal conventions. No critical refactoring needed!
                      </div>
                    )}
                  </div>
                </AnalysisCard>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function qualityLabel(score: number) {
  if (score >= 85) return "Optimal";
  if (score >= 70) return "Healthy";
  if (score >= 50) return "Needs Refactor";
  return "High Risk";
}

function MetricCard({
  icon,
  title,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#09090b] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all shadow-xs"
    >
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#eca8d6]">
          {icon}
        </div>
        <span className="text-[11px] font-mono font-medium text-white/40 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-2xl font-serif font-bold text-white">{value}</span>
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
            positive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-[#eca8d6]/10 text-[#eca8d6] border border-[#eca8d6]/20"
          }`}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}

function AnalysisCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#09090b] border border-white/10 rounded-2xl p-5 shadow-xs"
    >
      <h3 className="text-xs font-mono font-semibold text-white/50 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function SummaryItem({
  label,
  value,
  icon,
  warning,
}: {
  label: string;
  value: string;
  icon: string;
  warning?: boolean;
  }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl gap-3 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/40">
          {icon}
        </span>
        <span className="text-xs font-medium text-white/60">{label}</span>
      </div>
      <span
        className={`text-xs font-mono font-bold text-right ${
          warning ? "text-[#eca8d6]" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function AlgorithmItem({
  name,
  complexity,
  type,
}: {
  name: string;
  complexity: string;
  type: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 transition-colors">
      <div>
        <div className="font-semibold text-xs text-white mb-0.5">{name}</div>
        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wide">{type}</div>
      </div>
      <div className="px-2.5 py-1 bg-[#eca8d6]/10 border border-[#eca8d6]/20 rounded-full">
        <span className="text-xs font-mono font-bold text-[#eca8d6]">{complexity}</span>
      </div>
    </div>
  );
}

function OptimizationItem({
  type,
  title,
  description,
  priority,
}: {
  type: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}) {
  const priorityStyles = {
    high: "bg-red-500/10 border-red-500/20 text-red-400",
    medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    low: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  };

  const typeLabels: Record<string, string> = {
    performance: "PERF",
    readability: "READ",
    "best-practice": "BEST",
    security: "SEC",
  };

  return (
    <div className="flex gap-3.5 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/15 transition-colors">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white/40">
        {typeLabels[type] ?? "TIP"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-xs text-white">{title}</span>
          <span
            className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${priorityStyles[priority]}`}
          >
            {priority}
          </span>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
