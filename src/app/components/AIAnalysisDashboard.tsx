import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, TrendingUp, Cpu, Zap, CheckCircle2, AlertTriangle, Code2, LogOut, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Bar, BarChart, Cell, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ApiError, getCurrentCodeState, getDashboard, type DashboardPayload } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function AIAnalysisDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentCode = getCurrentCodeState();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const qualityData = useMemo(
    () => [
      { name: "Quality", value: data?.metrics.quality_score ?? 0, fill: "#22c55e" },
      { name: "Background", value: 100, fill: "#1f2937" },
    ],
    [data],
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
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load the analysis dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="h-screen w-screen bg-[#020617] text-[#e5e7eb] flex flex-col overflow-hidden">
      <div className="h-14 bg-[#111827] border-b border-[#1f2937] flex items-center px-4 gap-4">
        <button
          onClick={() => navigate("/ide")}
          className="w-9 h-9 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-[#22c55e] to-[#3b82f6] rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">AI Analysis Dashboard</span>
        </div>

        <button
          onClick={() => void loadDashboard()}
          className="w-9 h-9 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-all flex items-center justify-center"
        >
          <RefreshCcw className="w-4 h-4 text-[#9ca3af]" />
        </button>
        <button
          onClick={() => void handleLogout()}
          className="w-9 h-9 rounded-lg bg-[#1f2937] hover:bg-[#ef4444]/20 transition-all flex items-center justify-center group"
        >
          <LogOut className="w-4 h-4 text-[#9ca3af] group-hover:text-[#ef4444]" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-8 text-sm text-[#9ca3af]">
              Building the dashboard from your current code...
            </div>
          ) : errorMessage ? (
            <div className="rounded-lg border border-[#ef4444]/40 bg-[#7f1d1d]/30 p-6 text-sm text-[#fecaca]">
              {errorMessage}
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard icon={<Code2 className="w-5 h-5" />} title="Total Lines" value={String(data.metrics.total_lines)} change={data.summary.primary_language} positive />
                <MetricCard icon={<Cpu className="w-5 h-5" />} title="Functions" value={String(data.metrics.functions)} change="Detected" positive />
                <MetricCard icon={<Zap className="w-5 h-5" />} title="Algorithms" value={String(data.metrics.algorithms)} change={data.detected_algorithms.length ? "Matched" : "None"} positive={data.metrics.algorithms > 0} />
                <MetricCard icon={<CheckCircle2 className="w-5 h-5" />} title="Code Quality" value={`${data.metrics.quality_score}%`} change={qualityLabel(data.metrics.quality_score)} positive={data.metrics.quality_score >= 70} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <AnalysisCard title="Code Summary">
                  <div className="space-y-4">
                    <SummaryItem label="Primary Language" value={data.summary.primary_language} icon="PY" />
                    <SummaryItem label="Code Style" value={data.summary.code_style} icon="OK" />
                    <SummaryItem
                      label="Documentation"
                      value={data.summary.documentation_status}
                      icon="DOC"
                      warning={data.summary.documentation_status !== "Documented"}
                    />
                  </div>
                </AnalysisCard>

                <AnalysisCard title="Detected Algorithms">
                  <div className="space-y-3">
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
                      <div className="text-sm text-[#9ca3af]">No clear algorithm signature was detected for the current file.</div>
                    )}
                  </div>
                </AnalysisCard>

                <AnalysisCard title="Complexity Analysis">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#9ca3af]">Time Complexity</span>
                        <span className="text-sm font-semibold text-[#22c55e]">{data.complexity.time}</span>
                      </div>
                      <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(90, 20 + data.metrics.algorithms * 12)}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-[#22c55e]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#9ca3af]">Space Complexity</span>
                        <span className="text-sm font-semibold text-[#3b82f6]">{data.complexity.space}</span>
                      </div>
                      <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(85, 15 + data.complexity.metrics[3]?.value * 15)}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="h-full bg-[#3b82f6]"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#1f2937]">
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={data.complexity.metrics} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} axisLine={false} tickLine={false} />
                          <YAxis stroke="#6b7280" fontSize={12} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#e5e7eb",
                            }}
                            cursor={false}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                            {data.complexity.metrics.map((entry, index) => (
                              <Cell key={`${entry.name}-${index}`} fill={index % 2 === 0 ? "#22c55e" : "#3b82f6"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </AnalysisCard>

                <AnalysisCard title="Code Quality Score">
                  <div className="flex items-center justify-center h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        data={qualityData}
                        startAngle={90}
                        endAngle={-270}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                      >
                        <RadialBar background dataKey="value" cornerRadius={10} isAnimationActive={false} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-4xl font-bold text-[#22c55e]">{data.metrics.quality_score}%</div>
                      <div className="text-sm text-[#9ca3af]">{qualityLabel(data.metrics.quality_score)}</div>
                    </div>
                  </div>
                </AnalysisCard>
              </div>

              <AnalysisCard title="Optimization Suggestions">
                <div className="space-y-3">
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
                    <div className="text-sm text-[#9ca3af]">No extra suggestions right now. The code already looks reasonably tidy.</div>
                  )}
                </div>
              </AnalysisCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function qualityLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Solid";
  if (score >= 50) return "Needs Work";
  return "Risky";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] border border-[#1f2937] rounded-lg p-4 hover:border-[#22c55e] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">{icon}</div>
        <span className="text-sm text-[#9ca3af]">{title}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-2xl font-bold text-[#e5e7eb]">{value}</span>
        <span className={`text-xs ${positive ? "text-[#22c55e]" : "text-[#f59e0b]"}`}>{change}</span>
      </div>
    </motion.div>
  );
}

function AnalysisCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827] border border-[#1f2937] rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-[#e5e7eb] mb-4">{title}</h3>
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
    <div className="flex items-center justify-between p-3 bg-[#1f2937] rounded-lg gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold tracking-wider text-[#9ca3af]">{icon}</span>
        <span className="text-sm text-[#9ca3af]">{label}</span>
      </div>
      <span className={`text-sm font-medium text-right ${warning ? "text-[#f59e0b]" : "text-[#e5e7eb]"}`}>{value}</span>
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
    <div className="flex items-center justify-between p-3 bg-[#1f2937] rounded-lg hover:bg-[#374151] transition-colors">
      <div>
        <div className="font-medium text-sm text-[#e5e7eb] mb-1">{name}</div>
        <div className="text-xs text-[#6b7280]">{type}</div>
      </div>
      <div className="px-3 py-1 bg-[#22c55e]/10 rounded-full">
        <span className="text-xs font-mono text-[#22c55e]">{complexity}</span>
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
  const priorityColors = {
    high: "text-[#ef4444]",
    medium: "text-[#f59e0b]",
    low: "text-[#3b82f6]",
  };

  const typeLabels: Record<string, string> = {
    performance: "PERF",
    readability: "READ",
    "best-practice": "BEST",
    security: "SAFE",
  };

  return (
    <div className="flex gap-4 p-4 bg-[#1f2937] rounded-lg hover:bg-[#374151] transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center text-[10px] tracking-wider text-[#9ca3af]">
        {typeLabels[type] ?? "TIP"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-[#e5e7eb]">{title}</span>
          <span className={`text-xs uppercase font-semibold ${priorityColors[priority]}`}>{priority}</span>
        </div>
        <p className="text-xs text-[#9ca3af]">{description}</p>
      </div>
      <AlertTriangle className={`w-4 h-4 ${priorityColors[priority]}`} />
    </div>
  );
}
