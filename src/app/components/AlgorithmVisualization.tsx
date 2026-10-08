import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  LogOut,
  Sparkles,
  Wand2,
  Library,
  Code2,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";

import {
  ApiError,
  generateVisualization,
  getCurrentCodeState,
  getVisualization,
  listVisualizations,
  type VisualizationDetail,
  type VisualizationSummary,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";

type SourceMode = "editor" | "scratch";
type VisualItem = { label?: string; value?: string; status?: string };
type VisualCollection = { label?: string; layout?: string; items?: VisualItem[] };
type VisualVariable = { name?: string; value?: string };
type VisualNode = { id?: string; label?: string; status?: string };
type VisualEdge = { from?: string; to?: string };

export function AlgorithmVisualization() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentCode = getCurrentCodeState();

  const [templates, setTemplates] = useState<VisualizationSummary[]>([]);
  const [detail, setDetail] = useState<VisualizationDetail | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>(
    currentCode.code.trim() ? "editor" : "scratch"
  );
  const [algorithmName, setAlgorithmName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentStep = useMemo(() => {
    if (!detail?.steps.length) return null;
    return detail.steps[Math.min(stepIndex, detail.steps.length - 1)];
  }, [detail, stepIndex]);

  useEffect(() => {
    void initializePage();
  }, []);

  useEffect(() => {
    if (!isPlaying || !detail?.steps.length) return;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (!detail?.steps.length) return current;
        if (current >= detail.steps.length - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 950);
    return () => window.clearInterval(timer);
  }, [detail?.steps.length, isPlaying]);

  async function initializePage() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const summaries = await listVisualizations();
      setTemplates(summaries);
      if (currentCode.code.trim()) {
        await handleGenerate("editor", true);
      } else if (summaries.length) {
        await loadTemplate(summaries[0].id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Unable to load the visualization workspace."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTemplate(templateId: string) {
    setIsLoading(true);
    setIsPlaying(false);
    setStepIndex(0);
    setErrorMessage("");
    try {
      const response = await getVisualization(templateId);
      setActiveTemplateId(templateId);
      setDetail(response);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Unable to load the selected template."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate(mode: SourceMode = sourceMode, keepTemplateSelection = false) {
    const trimmedAlgorithm = algorithmName.trim();
    const trimmedPrompt = prompt.trim();

    if (mode === "scratch" && !trimmedAlgorithm && !trimmedPrompt) {
      setErrorMessage("Please enter an algorithm name or description to generate a walkthrough.");
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);
    setStepIndex(0);
    setErrorMessage("");

    try {
      const response = await generateVisualization({
        source_mode: mode,
        algorithm_name: trimmedAlgorithm || undefined,
        prompt: trimmedPrompt || undefined,
        code: mode === "editor" ? currentCode.code : undefined,
        language: mode === "editor" ? currentCode.language : undefined,
      });

      if (!keepTemplateSelection) {
        setActiveTemplateId("");
      }
      setDetail(response);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Failed to generate visualization."
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
    <div className="h-screen w-screen bg-black text-white p-2 md:p-3 overflow-hidden flex flex-col relative font-sans select-none">
      {/* Background Watermark */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
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

      <div className="absolute top-1 right-6 text-white/20 text-2xl font-black font-mono select-none pointer-events-none tracking-widest">
        //
      </div>

      {/* Floating Studio Canvas */}
      <div className="relative z-10 h-full w-full bg-[#09090b] text-white rounded-[18px] md:rounded-[22px] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#000000] border-b border-white/10 flex items-center justify-between px-5 md:px-7 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ide")}
              className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Return to IDE"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/15 flex items-center justify-center text-[#eca8d6]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display text-lg text-white">
                    Algorithm Visualizer
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6]" />
                </div>
                <span className="text-[10px] text-white/40 font-mono tracking-wide">
                  Interactive State-Transition Studio
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-white shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[11px] font-bold">
                {user?.username ? user.username.charAt(0).toUpperCase() : "D"}
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
        <div className="flex-1 flex overflow-hidden">
          {/* Left Controls & Library Sidebar */}
          <aside className="w-[340px] bg-[#000000] border-r border-white/10 p-4 overflow-y-auto space-y-4 select-none">
            {/* Builder Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#eca8d6]" />
                <h2 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Build Visualization
                </h2>
              </div>

              {/* Segmented Mode Button */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/[0.04] rounded-lg border border-white/10">
                <ModeButton
                  active={sourceMode === "editor"}
                  label="Current Code"
                  icon={<Code2 className="w-3.5 h-3.5" />}
                  onClick={() => setSourceMode("editor")}
                />
                <ModeButton
                  active={sourceMode === "scratch"}
                  label="From Scratch"
                  icon={<Wand2 className="w-3.5 h-3.5" />}
                  onClick={() => setSourceMode("scratch")}
                />
              </div>

              {sourceMode === "editor" ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs space-y-1 font-mono">
                    <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                      Editor Snapshot
                    </div>
                    <div className="text-xs font-medium text-white">
                      {currentCode.code.trim()
                        ? "Active file loaded and ready."
                        : "No open code detected yet."}
                    </div>
                    <div className="text-[11px] text-white/50">
                      Language: {currentCode.language || "python"}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleGenerate("editor")}
                    className="w-full h-10 rounded-full bg-white hover:bg-white/90 active:bg-white/80 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Generate Walkthrough</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  <div>
                    <label className="block text-[11px] text-white/50 uppercase tracking-wider mb-1">
                      Algorithm Title
                    </label>
                    <input
                      value={algorithmName}
                      onChange={(event) => setAlgorithmName(event.target.value)}
                      placeholder="e.g. Dijkstra Shortest Path"
                      className="w-full h-9 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white placeholder-white/30 outline-none focus:border-[#eca8d6]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/50 uppercase tracking-wider mb-1">
                      Focus or Constraints
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Show priority queue updates and relaxation..."
                      rows={4}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-white/30 outline-none resize-none focus:border-[#eca8d6]/50 transition-colors"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleGenerate("scratch")}
                    className="w-full h-10 rounded-full bg-white hover:bg-white/90 active:bg-white/80 text-black font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Synthesize Algorithm</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Template Library Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-[#60a5fa]" />
                <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Template Library
                </h3>
              </div>

              <div className="space-y-2">
                {templates.map((template) => {
                  const isActive = activeTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => void loadTemplate(template.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
                        isActive
                          ? "border-[#eca8d6]/50 bg-[#eca8d6]/10 shadow-xs"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div
                          className={`font-semibold text-xs truncate ${
                            isActive ? "text-[#eca8d6]" : "text-white"
                          }`}
                        >
                          {template.title}
                        </div>
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/50 shrink-0">
                          {template.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                        {template.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Visualizer Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
            {/* Playback Control Bar */}
            <div className="h-14 bg-[#000000] border-b border-white/10 flex items-center justify-center gap-3 px-6 select-none shadow-xs">
              <ControlButton
                onClick={() => {
                  setStepIndex(0);
                  setIsPlaying(false);
                }}
                icon={<RotateCcw className="w-4 h-4" />}
                title="Restart"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying((value) => !value)}
                disabled={!detail?.steps.length}
                className="w-11 h-11 rounded-full bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md cursor-pointer text-black"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current text-black" />
                ) : (
                  <Play className="w-4 h-4 fill-current text-black ml-0.5" />
                )}
              </motion.button>

              <ControlButton
                onClick={() =>
                  detail?.steps.length &&
                  setStepIndex((current) => Math.min(current + 1, detail.steps.length - 1))
                }
                icon={<SkipForward className="w-4 h-4" />}
                disabled={!detail?.steps.length}
                title="Next Step"
              />
            </div>

            {/* Canvas Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <PanelMessage>Generating algorithm simulation...</PanelMessage>
              ) : errorMessage ? (
                <PanelMessage tone="error">{errorMessage}</PanelMessage>
              ) : detail && currentStep ? (
                <div className="max-w-6xl mx-auto space-y-6">
                  {/* Step Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/10 shadow-xs">
                    <div>
                      <h1 className="text-xl font-display text-white">
                        {detail.title}
                      </h1>
                      <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed font-mono">
                        {detail.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                      <Badge>{detail.visualization_type}</Badge>
                      <Badge>{detail.source}</Badge>
                      <Badge>{detail.steps.length} steps</Badge>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${detail.algorithm}-${currentStep.index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <VisualizationCanvas step={currentStep} />
                    </motion.div>
                  </AnimatePresence>

                  {/* Step Timeline Pills Card */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3 font-mono">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {currentStep.label}
                        </div>
                        <div className="text-[11px] text-white/40">
                          Step {currentStep.index + 1} of {detail.steps.length}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-[#eca8d6]">
                        {currentStep.narration || "Follow the state transition."}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {detail.steps.map((step) => {
                        const isCurrent = step.index === currentStep.index;
                        return (
                          <button
                            key={`${detail.algorithm}-${step.index}`}
                            onClick={() => {
                              setStepIndex(step.index);
                              setIsPlaying(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-white text-black font-semibold shadow-xs"
                                : "bg-white/[0.04] text-white/60 hover:text-white border border-white/10"
                            }`}
                          >
                            {step.index + 1}. {step.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <PanelMessage>Select a template or generate a visualization to begin.</PanelMessage>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function VisualizationCanvas({ step }: { step: VisualizationDetail["steps"][number] }) {
  const state = step.state as {
    variables?: VisualVariable[];
    collections?: VisualCollection[];
    call_stack?: string[];
    graph?: { nodes?: VisualNode[]; edges?: VisualEdge[] };
    focus?: string[];
    notes?: string[];
  };

  const variables = Array.isArray(state.variables) ? state.variables : [];
  const collections = Array.isArray(state.collections) ? state.collections : [];
  const callStack = Array.isArray(state.call_stack) ? state.call_stack : [];
  const graph = state.graph && typeof state.graph === "object" ? state.graph : undefined;
  const focus = Array.isArray(state.focus) ? state.focus : [];
  const notes = Array.isArray(state.notes) ? state.notes : [];

  return (
    <div className="grid xl:grid-cols-[minmax(0,2fr)_320px] gap-6">
      <div className="rounded-xl border border-white/10 bg-[#000000] p-5 min-h-[400px] space-y-5">
        {variables.length > 0 ? (
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2.5">
              Active Variables
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {variables.map((variable, index) => (
                <div
                  key={`${variable.name ?? "var"}-${index}`}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs"
                >
                  <div className="text-[10px] uppercase font-mono text-white/40 tracking-wider">
                    {variable.name ?? "value"}
                  </div>
                  <div className="text-sm font-bold text-white mt-1 font-mono">
                    {String(variable.value ?? "-")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {graph?.nodes?.length ? <GraphScene graph={graph} /> : null}
        {collections.length ? <CollectionScene collections={collections} /> : null}
        {callStack.length ? <CallStackScene frames={callStack} /> : null}
        {!graph?.nodes?.length && !collections.length && !callStack.length ? (
          <pre className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60 font-mono overflow-auto">
            {JSON.stringify(step.state, null, 2)}
          </pre>
        ) : null}
      </div>

      <aside className="rounded-xl border border-white/10 bg-[#000000] p-5 space-y-4">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
            Step Narration
          </div>
          <p className="text-xs leading-relaxed text-white/80 font-sans">
            {step.narration || "Follow the state transition for this step."}
          </p>
        </div>

        {focus.length ? (
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
              Focus Nodes
            </div>
            <div className="flex flex-wrap gap-1.5">
              {focus.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="px-2.5 py-1 rounded-full bg-[#eca8d6]/10 border border-[#eca8d6]/25 text-[#eca8d6] text-xs font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {notes.length ? (
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
              Mentor Notes
            </div>
            <div className="space-y-1.5 font-mono">
              {notes.map((note, index) => (
                <div
                  key={`${note}-${index}`}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white/60"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function CollectionScene({ collections }: { collections: VisualCollection[] }) {
  return (
    <div className="space-y-4">
      {collections.map((collection, collectionIndex) => {
        const items = Array.isArray(collection.items) ? collection.items : [];
        const isGrid = collection.layout === "grid";
        return (
          <div key={`${collection.label ?? "collection"}-${collectionIndex}`}>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
              {collection.label ?? "Collection"}
            </div>
            <div className={isGrid ? "grid grid-cols-2 lg:grid-cols-4 gap-2.5" : "flex flex-wrap gap-2.5"}>
              {items.map((item, itemIndex) => (
                <motion.div
                  key={`${item.label ?? "item"}-${itemIndex}`}
                  layout
                  className={`min-w-[70px] rounded-xl border px-3 py-2.5 text-center transition-all ${itemClassName(
                    item.status
                  )}`}
                >
                  <div className="text-[10px] uppercase font-mono opacity-70">
                    {item.label ?? itemIndex}
                  </div>
                  <div className="text-sm font-bold mt-0.5 font-mono">
                    {String(item.value ?? "")}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GraphScene({ graph }: { graph: { nodes?: VisualNode[]; edges?: VisualEdge[] } }) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
          Graph Topology
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {nodes.map((node, index) => (
            <div
              key={`${node.id ?? node.label ?? "node"}-${index}`}
              className={`rounded-xl border p-3.5 text-center ${itemClassName(node.status)}`}
            >
              <div className="text-lg font-bold font-mono">{node.label ?? node.id ?? "?"}</div>
              <div className="text-[10px] uppercase font-mono opacity-75 mt-1">
                {node.status ?? "default"}
              </div>
            </div>
          ))}
        </div>
      </div>
      {edges.length ? (
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
            Adjacency Links
          </div>
          <div className="flex flex-wrap gap-2 font-mono">
            {edges.map((edge, index) => (
              <span
                key={`${edge.from ?? "?"}-${edge.to ?? "?"}-${index}`}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-white"
              >
                {edge.from} → {edge.to}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CallStackScene({ frames }: { frames: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/40 mb-2">
        Call Stack Frames
      </div>
      <div className="space-y-2">
        {frames.map((frame, index) => (
          <div
            key={`${frame}-${index}`}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-mono text-white"
          >
            {frame}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-md flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
        active
          ? "bg-white text-black font-semibold shadow-xs"
          : "text-white/60 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ControlButton({
  onClick,
  icon,
  disabled,
  title,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
    >
      {icon}
    </motion.button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/60 font-mono text-[11px]">
      {children}
    </span>
  );
}

function PanelMessage({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`max-w-xl mx-auto rounded-xl border p-6 text-xs text-center font-mono ${
        tone === "error"
          ? "border-red-500/20 bg-red-500/10 text-red-400"
          : "border-white/10 bg-white/[0.02] text-white/60"
      }`}
    >
      {children}
    </div>
  );
}

function itemClassName(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "border-[#eca8d6] bg-[#eca8d6]/15 text-[#eca8d6]";
    case "sorted":
    case "done":
    case "visited":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "pivot":
    case "frontier":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "boundary":
    case "candidate":
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    case "dimmed":
      return "border-white/5 bg-white/[0.02] text-white/30";
    default:
      return "border-white/10 bg-white/[0.04] text-white";
  }
}
