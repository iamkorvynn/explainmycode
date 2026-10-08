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
  Layers,
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
    <div className="h-screen w-screen bg-gradient-to-br from-[#F8D0B5] via-[#F5C29F] to-[#F3B58C] p-2 md:p-3.5 overflow-hidden flex flex-col relative font-sans">
      {/* Organic Contour Curves Watermark */}
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-[16px] text-[#1E1E24]">
                    Algorithm Visualizer
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#FF7A50]" />
                </div>
                <span className="text-[10px] text-[#A8A29E] font-medium tracking-wide">
                  Interactive State-Transition Studio
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
        <div className="flex-1 flex overflow-hidden">
          {/* Left Controls & Library Sidebar */}
          <aside className="w-[340px] bg-[#FBFBFA] border-r border-[#ECE8DF] p-4 overflow-y-auto space-y-4 select-none">
            {/* Builder Card */}
            <div className="rounded-2xl border border-[#ECE8DF] bg-white p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#FF7A50]" />
                <h2 className="text-xs font-extrabold text-[#1E1E24] uppercase tracking-wider">
                  Build Visualization
                </h2>
              </div>

              {/* Segmented Mode Button */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F5F4F0] rounded-xl border border-[#ECE8DF]">
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
                  <div className="rounded-xl border border-[#ECE8DF] bg-[#FBFBFA] p-3 text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#A8A29E] tracking-wider">
                      Editor Snapshot
                    </div>
                    <div className="text-xs font-semibold text-[#1E1E24]">
                      {currentCode.code.trim()
                        ? "Active file loaded and ready."
                        : "No open code detected yet."}
                    </div>
                    <div className="text-[11px] text-[#78716C]">
                      Language: {currentCode.language || "python"}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleGenerate("editor")}
                    className="w-full h-10 rounded-xl bg-[#FF7A50] hover:bg-[#FF6633] active:bg-[#E65F35] text-white font-bold text-xs shadow-md shadow-[#FF7A50]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Walkthrough</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">
                      Algorithm Title
                    </label>
                    <input
                      value={algorithmName}
                      onChange={(event) => setAlgorithmName(event.target.value)}
                      placeholder="e.g. Dijkstra Shortest Path"
                      className="w-full h-9 rounded-xl border border-[#ECE8DF] bg-[#F7F6F2] focus:bg-white px-3 text-xs text-[#1E1E24] placeholder-[#A8A29E] outline-none focus:border-[#FF7A50] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">
                      Focus or Constraints
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Show priority queue updates and relaxation..."
                      rows={4}
                      className="w-full rounded-xl border border-[#ECE8DF] bg-[#F7F6F2] focus:bg-white p-3 text-xs text-[#1E1E24] placeholder-[#A8A29E] outline-none resize-none focus:border-[#FF7A50] transition-colors"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void handleGenerate("scratch")}
                    className="w-full h-10 rounded-xl bg-[#FF7A50] hover:bg-[#FF6633] active:bg-[#E65F35] text-white font-bold text-xs shadow-md shadow-[#FF7A50]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesize Algorithm</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Template Library Card */}
            <div className="rounded-2xl border border-[#ECE8DF] bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-xs font-extrabold text-[#1E1E24] uppercase tracking-wider">
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
                      className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${
                        isActive
                          ? "border-[#FF7A50] bg-[#FFF1EB] shadow-xs"
                          : "border-[#ECE8DF] bg-[#FBFBFA] hover:bg-[#F5F4F0] hover:border-[#DDD8CD]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div
                          className={`font-bold text-xs truncate ${
                            isActive ? "text-[#FF7A50]" : "text-[#1E1E24]"
                          }`}
                        >
                          {template.title}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#ECE8DF] text-[#78716C] shrink-0">
                          {template.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#78716C] line-clamp-2 leading-relaxed">
                        {template.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Visualizer Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#FAF9F7]">
            {/* Playback Control Bar */}
            <div className="h-14 bg-white border-b border-[#ECE8DF] flex items-center justify-center gap-3 px-6 select-none shadow-xs">
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
                className="w-11 h-11 rounded-full bg-[#FF7A50] hover:bg-[#FF6633] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md shadow-[#FF7A50]/30 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
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
                  <div className="flex flex-wrap items-start justify-between gap-4 p-5 rounded-2xl bg-white border border-[#ECE8DF] shadow-xs">
                    <div>
                      <h1 className="text-xl font-extrabold text-[#1E1E24]">
                        {detail.title}
                      </h1>
                      <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
                        {detail.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
                  <div className="rounded-2xl border border-[#ECE8DF] bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-[#1E1E24]">
                          {currentStep.label}
                        </div>
                        <div className="text-[11px] text-[#A8A29E]">
                          Step {currentStep.index + 1} of {detail.steps.length}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-[#FF7A50]">
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-[#FF7A50] text-white shadow-xs"
                                : "bg-[#F5F4F0] text-[#78716C] hover:bg-[#EBE8E0] hover:text-[#1E1E24] border border-[#ECE8DF]"
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
      <div className="rounded-2xl border border-[#ECE8DF] bg-white p-5 min-h-[400px] space-y-5 shadow-xs">
        {variables.length > 0 ? (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2.5">
              Active Variables
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {variables.map((variable, index) => (
                <div
                  key={`${variable.name ?? "var"}-${index}`}
                  className="rounded-xl border border-[#ECE8DF] bg-[#FBFBFA] p-3 text-xs shadow-xs"
                >
                  <div className="text-[10px] uppercase font-bold text-[#A8A29E] tracking-wider">
                    {variable.name ?? "value"}
                  </div>
                  <div className="text-sm font-extrabold text-[#1E1E24] mt-1 font-mono">
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
          <pre className="rounded-xl border border-[#ECE8DF] bg-[#F7F6F2] p-4 text-xs text-[#78716C] font-mono overflow-auto">
            {JSON.stringify(step.state, null, 2)}
          </pre>
        ) : null}
      </div>

      <aside className="rounded-2xl border border-[#ECE8DF] bg-white p-5 space-y-4 shadow-xs">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
            Step Narration
          </div>
          <p className="text-xs leading-relaxed text-[#1E1E24] font-medium">
            {step.narration || "Follow the state transition for this step."}
          </p>
        </div>

        {focus.length ? (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
              Focus Nodes
            </div>
            <div className="flex flex-wrap gap-1.5">
              {focus.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="px-2.5 py-1 rounded-full bg-[#FFF1EB] border border-[#FFD9CA] text-[#FF7A50] text-xs font-bold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {notes.length ? (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
              Mentor Notes
            </div>
            <div className="space-y-1.5">
              {notes.map((note, index) => (
                <div
                  key={`${note}-${index}`}
                  className="rounded-xl border border-[#ECE8DF] bg-[#FBFBFA] p-2.5 text-xs text-[#78716C]"
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
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
              {collection.label ?? "Collection"}
            </div>
            <div className={isGrid ? "grid grid-cols-2 lg:grid-cols-4 gap-2.5" : "flex flex-wrap gap-2.5"}>
              {items.map((item, itemIndex) => (
                <motion.div
                  key={`${item.label ?? "item"}-${itemIndex}`}
                  layout
                  className={`min-w-[70px] rounded-2xl border px-3 py-2.5 text-center shadow-xs transition-all ${itemClassName(
                    item.status
                  )}`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                    {item.label ?? itemIndex}
                  </div>
                  <div className="text-sm font-extrabold mt-0.5 font-mono">
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
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
          Graph Topology
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {nodes.map((node, index) => (
            <div
              key={`${node.id ?? node.label ?? "node"}-${index}`}
              className={`rounded-2xl border p-3.5 text-center shadow-xs ${itemClassName(node.status)}`}
            >
              <div className="text-lg font-extrabold">{node.label ?? node.id ?? "?"}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75 mt-1">
                {node.status ?? "default"}
              </div>
            </div>
          ))}
        </div>
      </div>
      {edges.length ? (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
            Adjacency Links
          </div>
          <div className="flex flex-wrap gap-2">
            {edges.map((edge, index) => (
              <span
                key={`${edge.from ?? "?"}-${edge.to ?? "?"}-${index}`}
                className="px-2.5 py-1 rounded-xl bg-[#F5F4F0] border border-[#ECE8DF] text-xs font-mono font-bold text-[#1E1E24]"
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
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8A29E] mb-2">
        Call Stack Frames
      </div>
      <div className="space-y-2">
        {frames.map((frame, index) => (
          <div
            key={`${frame}-${index}`}
            className="rounded-xl border border-[#ECE8DF] bg-[#FBFBFA] px-3 py-2 text-xs font-mono font-semibold text-[#1E1E24]"
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
      className={`h-9 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
        active
          ? "bg-[#FF7A50] text-white shadow-xs"
          : "text-[#78716C] hover:text-[#1E1E24]"
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
      className="w-9 h-9 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E0] text-[#78716C] hover:text-[#1E1E24] border border-[#ECE8DF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
    >
      {icon}
    </motion.button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-[#F5F4F0] border border-[#ECE8DF] text-[#78716C] font-semibold text-[11px]">
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
      className={`max-w-xl mx-auto rounded-2xl border p-6 text-xs text-center font-medium ${
        tone === "error"
          ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]"
          : "border-[#ECE8DF] bg-white text-[#78716C] shadow-xs"
      }`}
    >
      {children}
    </div>
  );
}

function itemClassName(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "border-[#FF7A50] bg-[#FFF1EB] text-[#FF7A50]";
    case "sorted":
    case "done":
    case "visited":
      return "border-[#10B981] bg-[#F0FDF4] text-[#16A34A]";
    case "pivot":
    case "frontier":
      return "border-[#F59E0B] bg-[#FFFBEB] text-[#D97706]";
    case "boundary":
    case "candidate":
      return "border-[#8B5CF6] bg-[#F5F3FF] text-[#7C3AED]";
    case "dimmed":
      return "border-[#ECE8DF] bg-[#F5F4F0] text-[#A8A29E]";
    default:
      return "border-[#ECE8DF] bg-[#FFFFFF] text-[#1E1E24]";
  }
}
