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
      { name: "Quality", value: data?.metrics.quality_score ?? 0, fill: "#FF7A50" },
      { name: "Background", value: 100, fill: "#F5F4F0" },
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
    <div className="h-screen w-screen bg-gradient-to-br from-[#F8D0B5] via-[#F5C29F] to-[#F3B58C] p-2 md:p-3.5 overflow-hidden flex flex-col relative font-sans">
      {/* Organic Contour Curves Watermark (Stitch Purr'Coffee aesthetic) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 200 C 300 100, 600 400, 1000 250 C 1300 120, 1500 350, 1600 450"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />
        <path
          d="M-50 450 C 250 300, 650 600, 1100 400 C 1400 280, 1550 500, 1650 600"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M-80 700 C 350 550, 750 850, 1200 650 C 1450 520, 1580 750, 1680 800"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
      </svg>

      <div className="absolute top-1 right-6 text-white/30 text-2xl font-black font-mono select-none pointer-events-none tracking-widest">
        //
      </div>

      {/* Floating Studio Canvas */}
      <div className="relative z-10 h-full w-full bg-[#FFFFFF] rounded-[22px] md:rounded-[30px] border border-[#F0EDE6] shadow-[0_25px_80px_rgba(180,80,30,0.18)] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#ECE8DF] flex items-center justify-between px-5 md:px-7 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ide")}
              className="w-9 h-9 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] flex items-center justify-center transition-colors cursor-pointer"
              title="Return to IDE"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7A50] to-[#FF9E79] flex items-center justify-center text-white shadow-sm shadow-[#FF7A50]/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-[16px] text-[#1E1E24]">
                    AI Analysis Dashboard
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#FF7A50]" />
                </div>
                <span className="text-[10px] text-[#A8A29E] font-medium tracking-wide">
                  Static & Runtime Complexity Intelligence
                </span>
              </div>
            </div>

            {data?.provider && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1EB] text-[#FF7A50] text-[11px] font-bold border border-[#FFD9CA] ml-2">
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
              className="w-9 h-9 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] flex items-center justify-center transition-colors cursor-pointer"
              title="Reload Dashboard"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FBFBFA] border border-[#ECE8DF] text-xs font-bold text-[#1E1E24] shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF7A50] to-[#FFB088] flex items-center justify-center text-white text-[11px] font-bold">
                {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
              </div>
              <span>{user?.username || "Albert Flores"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />
            </motion.div>

            <button
              onClick={() => void handleLogout()}
              title="Sign Out"
              className="w-9 h-9 rounded-full bg-[#F5F4F0] hover:bg-[#FEE2E2] text-[#78716C] hover:text-[#EF4444] border border-[#ECE8DF] flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF9F7]">
          <div className="max-w-6xl mx-auto space-y-6">
            {isLoading ? (
              <div className="rounded-2xl border border-[#ECE8DF] bg-white p-8 text-xs text-[#78716C] flex items-center justify-center gap-3 shadow-xs">
                <div className="w-4 h-4 border-2 border-[#FF7A50]/30 border-t-[#FF7A50] rounded-full animate-spin" />
                <span className="font-semibold">Synthesizing intelligence metrics from your code...</span>
              </div>
            ) : errorMessage ? (
              <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-xs text-[#DC2626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <div>
                    <p className="font-bold">Analysis Notice</p>
                    <p className="text-[#B91C1C] mt-0.5">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => void loadDashboard()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#FCA5A5] text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition-all cursor-pointer shrink-0"
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
                    icon={<Code2 className="w-5 h-5" />}
                    title="Total Lines"
                    value={String(data.metrics.total_lines)}
                    change={data.summary.primary_language}
                    positive
                  />
                  <MetricCard
                    icon={<Cpu className="w-5 h-5" />}
                    title="Functions"
                    value={String(data.metrics.functions)}
                    change="Detected"
                    positive
                  />
                  <MetricCard
                    icon={<Zap className="w-5 h-5" />}
                    title="Algorithms"
                    value={String(data.metrics.algorithms)}
                    change={data.detected_algorithms.length ? "Matched" : "None"}
                    positive={data.metrics.algorithms > 0}
                  />
                  <MetricCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
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
                        <div className="text-xs text-[#A8A29E] italic py-4 text-center">
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
                          <span className="text-[#78716C] font-semibold">Time Complexity</span>
                          <span className="font-mono font-bold text-[#FF7A50]">
                            {data.complexity.time}
                          </span>
                        </div>
                        <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(90, 20 + data.metrics.algorithms * 12)}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-[#FF7A50] rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="text-[#78716C] font-semibold">Space Complexity</span>
                          <span className="font-mono font-bold text-[#3B82F6]">
                            {data.complexity.space}
                          </span>
                        </div>
                        <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(85, 15 + data.complexity.metrics[3]?.value * 15)}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full bg-[#3B82F6] rounded-full"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#ECE8DF]">
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart
                            data={data.complexity.metrics}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <XAxis
                              dataKey="name"
                              stroke="#A8A29E"
                              fontSize={11}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#A8A29E"
                              fontSize={11}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #ECE8DF",
                                borderRadius: "12px",
                                color: "#1E1E24",
                                fontSize: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                              }}
                              cursor={false}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                              {data.complexity.metrics.map((entry, index) => (
                                <Cell
                                  key={`${entry.name}-${index}`}
                                  fill={index % 2 === 0 ? "#FF7A50" : "#3B82F6"}
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
                        <div className="text-3xl font-extrabold text-[#1E1E24]">
                          {data.metrics.quality_score}%
                        </div>
                        <div className="text-xs font-bold text-[#FF7A50] mt-0.5">
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
                      <div className="text-xs text-[#A8A29E] italic py-4 text-center">
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
      className="bg-white border border-[#ECE8DF] rounded-2xl p-4 hover:border-[#FF7A50]/50 transition-all shadow-xs"
    >
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#FF7A50]">
          {icon}
        </div>
        <span className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-2xl font-extrabold text-[#1E1E24]">{value}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            positive
              ? "bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]"
              : "bg-[#FFF1EB] text-[#FF7A50] border border-[#FFD9CA]"
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
      className="bg-white border border-[#ECE8DF] rounded-2xl p-5 shadow-xs"
    >
      <h3 className="text-sm font-extrabold text-[#1E1E24] uppercase tracking-wider mb-4">
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
    <div className="flex items-center justify-between p-3 bg-[#FBFBFA] border border-[#ECE8DF] rounded-xl gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#ECE8DF] text-[#78716C]">
          {icon}
        </span>
        <span className="text-xs font-semibold text-[#78716C]">{label}</span>
      </div>
      <span
        className={`text-xs font-bold text-right ${
          warning ? "text-[#FF7A50]" : "text-[#1E1E24]"
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
    <div className="flex items-center justify-between p-3 bg-[#FBFBFA] border border-[#ECE8DF] rounded-xl hover:border-[#FF7A50]/40 transition-colors">
      <div>
        <div className="font-bold text-xs text-[#1E1E24] mb-0.5">{name}</div>
        <div className="text-[10px] text-[#A8A29E] uppercase tracking-wide">{type}</div>
      </div>
      <div className="px-2.5 py-1 bg-[#FFF1EB] border border-[#FFD9CA] rounded-full">
        <span className="text-xs font-mono font-bold text-[#FF7A50]">{complexity}</span>
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
    high: "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]",
    medium: "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]",
    low: "bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]",
  };

  const typeLabels: Record<string, string> = {
    performance: "PERF",
    readability: "READ",
    "best-practice": "BEST",
    security: "SEC",
  };

  return (
    <div className="flex gap-3.5 p-3.5 bg-[#FBFBFA] border border-[#ECE8DF] rounded-xl hover:border-[#FF7A50]/40 transition-colors">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-white border border-[#ECE8DF] flex items-center justify-center text-[10px] font-mono font-bold text-[#78716C]">
        {typeLabels[type] ?? "TIP"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-xs text-[#1E1E24]">{title}</span>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityStyles[priority]}`}
          >
            {priority}
          </span>
        </div>
        <p className="text-xs text-[#78716C] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
