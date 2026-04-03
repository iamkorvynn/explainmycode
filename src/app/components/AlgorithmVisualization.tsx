import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import { ApiError, getVisualization, listVisualizations, type VisualizationDetail, type VisualizationSummary } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function AlgorithmVisualization() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [algorithms, setAlgorithms] = useState<VisualizationSummary[]>([]);
  const [activeAlgorithm, setActiveAlgorithm] = useState<string>("");
  const [detail, setDetail] = useState<VisualizationDetail | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentStep = useMemo(() => {
    if (!detail?.steps.length) return null;
    return detail.steps[Math.min(stepIndex, detail.steps.length - 1)];
  }, [detail, stepIndex]);

  useEffect(() => {
    void loadAlgorithms();
  }, []);

  useEffect(() => {
    if (!isPlaying || !detail?.steps.length) {
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % detail.steps.length);
    }, 800);
    return () => clearInterval(interval);
  }, [detail?.steps.length, isPlaying]);

  async function loadAlgorithms() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const summaries = await listVisualizations();
      setAlgorithms(summaries);
      if (summaries.length) {
        await loadVisualization(summaries[0].id);
      }
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load algorithm visualizations.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVisualization(algorithmId: string) {
    setIsLoading(true);
    setErrorMessage("");
    setIsPlaying(false);
    setStepIndex(0);
    try {
      const response = await getVisualization(algorithmId);
      setActiveAlgorithm(algorithmId);
      setDetail(response);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load the selected visualization.");
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
            <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}>
              Viz
            </motion.div>
          </div>
          <span className="font-semibold text-lg">Algorithm Visualization</span>
        </div>

        <button
          onClick={() => void handleLogout()}
          className="w-9 h-9 rounded-lg bg-[#1f2937] hover:bg-[#ef4444]/20 transition-all flex items-center justify-center group"
        >
          <LogOut className="w-4 h-4 text-[#9ca3af] group-hover:text-[#ef4444]" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 bg-[#111827] border-r border-[#1f2937] p-4">
          <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Select Algorithm</h3>
          <div className="space-y-2">
            {algorithms.map((algorithm) => (
              <button
                key={algorithm.id}
                onClick={() => void loadVisualization(algorithm.id)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  activeAlgorithm === algorithm.id
                    ? "bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e]"
                    : "bg-[#1f2937] border border-[#374151] text-[#e5e7eb] hover:bg-[#374151]"
                }`}
              >
                <div className="font-medium text-sm mb-1">{algorithm.title}</div>
                <div className="text-xs text-[#9ca3af]">{algorithm.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-[#111827] border-b border-[#1f2937] flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStepIndex(0);
                setIsPlaying(false);
              }}
              className="w-10 h-10 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying((value) => !value)}
              className="w-12 h-12 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] transition-colors flex items-center justify-center shadow-lg shadow-[#22c55e]/30"
              disabled={!detail?.steps.length}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!detail?.steps.length) return;
                setStepIndex((current) => Math.min(current + 1, detail.steps.length - 1));
              }}
              className="w-10 h-10 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-colors flex items-center justify-center"
              disabled={!detail?.steps.length}
            >
              <SkipForward className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex-1 p-8 overflow-auto">
            {isLoading ? (
              <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-8 text-sm text-[#9ca3af]">Loading visualization...</div>
            ) : errorMessage ? (
              <div className="rounded-lg border border-[#ef4444]/40 bg-[#7f1d1d]/30 p-6 text-sm text-[#fecaca]">{errorMessage}</div>
            ) : detail && currentStep ? (
              <AnimatePresence mode="wait">
                <motion.div key={`${detail.algorithm}-${currentStep.index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col gap-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{detail.title}</h2>
                      <p className="text-sm text-[#9ca3af]">{detail.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#22c55e]">{currentStep.label}</div>
                      <div className="text-xs text-[#6b7280]">
                        Step {currentStep.index + 1} of {detail.steps.length}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[420px] rounded-2xl border border-[#1f2937] bg-[#111827] p-8">
                    <VisualizationCanvas detail={detail} step={currentStep} />
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="rounded-lg border border-[#1f2937] bg-[#111827] p-8 text-sm text-[#9ca3af]">
                Select an algorithm to load the visualization.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualizationCanvas({ detail, step }: { detail: VisualizationDetail; step: VisualizationDetail["steps"][number] }) {
  switch (detail.algorithm) {
    case "bubble-sort":
      return <BubbleSortView state={step.state} />;
    case "binary-search":
      return <BinarySearchView state={step.state} />;
    case "fibonacci-recursion":
      return <FibonacciView state={step.state} />;
    case "graph-traversal":
      return <GraphView state={step.state} />;
    default:
      return <pre className="text-sm text-[#9ca3af]">{JSON.stringify(step.state, null, 2)}</pre>;
  }
}

function BubbleSortView({ state }: { state: Record<string, unknown> }) {
  const array = (state.array as number[] | undefined) ?? [];
  const active = (state.active as number[] | undefined) ?? [];
  return (
    <div className="h-full flex items-end justify-center gap-3">
      {array.map((value, index) => (
        <motion.div
          key={`${value}-${index}`}
          animate={{
            height: `${Math.max(18, (value / Math.max(...array, 1)) * 100)}%`,
            backgroundColor: active.includes(index) ? "#22c55e" : "#374151",
          }}
          className="w-14 rounded-t-lg relative"
        >
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#9ca3af]">{value}</span>
        </motion.div>
      ))}
    </div>
  );
}

function BinarySearchView({ state }: { state: Record<string, unknown> }) {
  const array = (state.array as number[] | undefined) ?? [];
  const left = Number(state.left ?? -1);
  const mid = Number(state.mid ?? -1);
  const right = Number(state.right ?? -1);
  const target = state.target;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-sm text-[#9ca3af]">Target value</div>
        <div className="text-2xl font-bold text-[#22c55e]">{String(target)}</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {array.map((value, index) => {
          const isActive = index === mid;
          const isBoundary = index === left || index === right;
          return (
            <motion.div
              key={`${value}-${index}`}
              animate={{
                scale: isActive ? 1.12 : 1,
                backgroundColor: isActive ? "#22c55e" : isBoundary ? "#3b82f6" : "#374151",
              }}
              className="w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white"
            >
              <span>{value}</span>
              <span className="text-[10px] font-normal uppercase opacity-80">
                {index === left ? "L" : index === mid ? "M" : index === right ? "R" : ""}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FibonacciView({ state }: { state: Record<string, unknown> }) {
  const node = String(state.node ?? "fib(?)");
  const children = (state.children as string[] | undefined) ?? [];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-8">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#22c55e] to-[#3b82f6] flex items-center justify-center text-white font-bold text-lg">
        {node}
      </div>
      <div className="flex items-center gap-6 flex-wrap justify-center">
        {children.map((child) => (
          <div key={child} className="w-24 h-24 rounded-full border border-[#3b82f6]/40 bg-[#1f2937] flex items-center justify-center text-sm text-[#e5e7eb]">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphView({ state }: { state: Record<string, unknown> }) {
  const visited = ((state.visited as number[] | undefined) ?? []).map((item) => Number(item));
  const frontier = ((state.frontier as number[] | undefined) ?? []).map((item) => Number(item));
  const nodes = [1, 2, 3, 4, 5];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-8">
      <div className="flex gap-6 flex-wrap justify-center">
        {nodes.map((node) => (
          <motion.div
            key={node}
            animate={{
              scale: frontier.includes(node) ? 1.08 : 1,
              backgroundColor: visited.includes(node) ? "#22c55e" : frontier.includes(node) ? "#3b82f6" : "#374151",
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold"
          >
            {node}
          </motion.div>
        ))}
      </div>
      <div className="text-sm text-[#9ca3af] text-center">
        <div>Visited: {visited.join(", ") || "None"}</div>
        <div>Frontier: {frontier.join(", ") || "None"}</div>
      </div>
    </div>
  );
}
