import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, LogOut, Sparkles, Wand2, Library, Code2 } from "lucide-react";
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
  const { logout } = useAuth();
  const currentCode = getCurrentCodeState();

  const [templates, setTemplates] = useState<VisualizationSummary[]>([]);
  const [detail, setDetail] = useState<VisualizationDetail | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>(currentCode.code.trim() ? "editor" : "scratch");
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
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load the visualization workspace.");
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
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to load the selected template.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate(mode: SourceMode = sourceMode, keepTemplateSelection = false) {
    const trimmedAlgorithm = algorithmName.trim();
    const trimmedPrompt = prompt.trim();
    const usesEditor = mode === "editor";

    if (usesEditor && !currentCode.code.trim()) {
      setErrorMessage("Open a file in the IDE first so the visualizer can build from your current code.");
      return;
    }

    if (!usesEditor && !trimmedAlgorithm && !trimmedPrompt) {
      setErrorMessage("Describe the algorithm or give it a name so the visualizer has something to build.");
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);
    setStepIndex(0);
    setErrorMessage("");
    try {
      const response = await generateVisualization({
        code: usesEditor ? currentCode.code : undefined,
        language: currentCode.language || "python",
        algorithmName: trimmedAlgorithm || undefined,
        prompt: trimmedPrompt || undefined,
      });
      if (!keepTemplateSelection) {
        setActiveTemplateId("");
      }
      setDetail(response);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to generate the visualization right now.");
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
        <button onClick={() => navigate("/ide")} className="w-9 h-9 rounded-lg bg-[#1f2937] hover:bg-[#374151] transition-colors flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#3b82f6] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-lg">Algorithm Visualizer</div>
            <div className="text-xs text-[#94a3b8]">Generate walkthroughs from editor code or from scratch.</div>
          </div>
        </div>
        <button onClick={() => void handleLogout()} className="w-9 h-9 rounded-lg bg-[#1f2937] hover:bg-[#ef4444]/20 transition-all flex items-center justify-center group">
          <LogOut className="w-4 h-4 text-[#9ca3af] group-hover:text-[#ef4444]" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[340px] bg-[#111827] border-r border-[#1f2937] p-4 overflow-auto">
          <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-4 h-4 text-[#22c55e]" />
              <h2 className="font-semibold">Build A Visualization</h2>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <ModeButton active={sourceMode === "editor"} label="Current Code" icon={<Code2 className="w-4 h-4" />} onClick={() => setSourceMode("editor")} />
              <ModeButton active={sourceMode === "scratch"} label="From Scratch" icon={<Wand2 className="w-4 h-4" />} onClick={() => setSourceMode("scratch")} />
            </div>

            {sourceMode === "editor" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Editor Snapshot</div>
                  <div className="text-sm text-[#e5e7eb]">{currentCode.code.trim() ? "Current file is ready to visualize." : "No open code detected yet."}</div>
                  <div className="text-xs text-[#94a3b8] mt-2">Language: {currentCode.language || "python"}</div>
                </div>
                <button onClick={() => void handleGenerate("editor")} className="w-full h-11 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] transition-colors font-medium text-white">
                  Generate From Current Code
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Algorithm Name</label>
                  <input
                    value={algorithmName}
                    onChange={(event) => setAlgorithmName(event.target.value)}
                    placeholder="Dijkstra shortest path"
                    className="w-full h-11 rounded-xl border border-[#1f2937] bg-[#111827] px-3 text-sm outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Show the main phases, data structures, and how the state changes over time."
                    rows={5}
                    className="w-full rounded-xl border border-[#1f2937] bg-[#111827] px-3 py-3 text-sm outline-none resize-none focus:border-[#3b82f6]"
                  />
                </div>
                <button onClick={() => void handleGenerate("scratch")} className="w-full h-11 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] transition-colors font-medium text-white">
                  Create From Scratch
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Library className="w-4 h-4 text-[#3b82f6]" />
              <h3 className="font-semibold">Template Library</h3>
            </div>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => void loadTemplate(template.id)}
                  className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${
                    activeTemplateId === template.id
                      ? "border-[#22c55e] bg-[#22c55e]/10"
                      : "border-[#1f2937] bg-[#111827] hover:border-[#374151] hover:bg-[#182235]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="font-medium text-sm">{template.title}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#64748b]">{template.category}</span>
                  </div>
                  <div className="text-xs text-[#94a3b8]">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 bg-[#111827] border-b border-[#1f2937] flex items-center justify-center gap-4 px-6">
            <ControlButton onClick={() => { setStepIndex(0); setIsPlaying(false); }} icon={<RotateCcw className="w-4 h-4" />} />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsPlaying((value) => !value)}
              disabled={!detail?.steps.length}
              className="w-12 h-12 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg shadow-[#22c55e]/20"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </motion.button>
            <ControlButton
              onClick={() => detail?.steps.length && setStepIndex((current) => Math.min(current + 1, detail.steps.length - 1))}
              icon={<SkipForward className="w-4 h-4" />}
              disabled={!detail?.steps.length}
            />
          </div>

          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <PanelMessage>Generating the visualization workspace...</PanelMessage>
            ) : errorMessage ? (
              <PanelMessage tone="error">{errorMessage}</PanelMessage>
            ) : detail && currentStep ? (
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold">{detail.title}</h1>
                    <p className="text-sm text-[#94a3b8] mt-1 max-w-3xl">{detail.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge>{detail.visualization_type}</Badge>
                    <Badge>{detail.source}</Badge>
                    <Badge>{detail.provider}</Badge>
                    <Badge>{detail.steps.length} steps</Badge>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={`${detail.algorithm}-${currentStep.index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <VisualizationCanvas step={currentStep} />
                  </motion.div>
                </AnimatePresence>

                <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="text-sm font-semibold">{currentStep.label}</div>
                      <div className="text-xs text-[#94a3b8]">Step {currentStep.index + 1} of {detail.steps.length}</div>
                    </div>
                    <div className="text-sm text-[#22c55e]">{currentStep.narration || "Follow the state transition."}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {detail.steps.map((step) => (
                      <button
                        key={`${detail.algorithm}-${step.index}`}
                        onClick={() => { setStepIndex(step.index); setIsPlaying(false); }}
                        className={`px-3 py-2 rounded-xl text-sm transition-all ${
                          step.index === currentStep.index
                            ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/50"
                            : "bg-[#0f172a] text-[#cbd5e1] border border-[#1f2937] hover:border-[#334155]"
                        }`}
                      >
                        {step.index + 1}. {step.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <PanelMessage>Select a template or generate a visualization to get started.</PanelMessage>
            )}
          </div>
        </main>
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
      <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 min-h-[430px] space-y-5">
        {variables.length > 0 ? (
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Variables</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {variables.map((variable, index) => (
                <div key={`${variable.name ?? "var"}-${index}`} className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-[#64748b]">{variable.name ?? "value"}</div>
                  <div className="text-sm font-medium mt-1">{String(variable.value ?? "-")}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {graph?.nodes?.length ? <GraphScene graph={graph} /> : null}
        {collections.length ? <CollectionScene collections={collections} /> : null}
        {callStack.length ? <CallStackScene frames={callStack} /> : null}
        {!graph?.nodes?.length && !collections.length && !callStack.length ? (
          <pre className="rounded-xl border border-[#1f2937] bg-[#0f172a] p-4 text-xs text-[#94a3b8] overflow-auto">
            {JSON.stringify(step.state, null, 2)}
          </pre>
        ) : null}
      </div>

      <aside className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 space-y-5">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Narration</div>
          <p className="text-sm leading-6 text-[#e5e7eb]">{step.narration || "Follow the state transition for this step."}</p>
        </div>

        {focus.length ? (
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Focus</div>
            <div className="flex flex-wrap gap-2">
              {focus.map((item, index) => (
                <span key={`${item}-${index}`} className="px-3 py-2 rounded-xl bg-[#22c55e]/10 text-[#86efac] text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {notes.length ? (
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Notes</div>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={`${note}-${index}`} className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-3 text-sm text-[#cbd5e1]">
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
    <div className="space-y-5">
      {collections.map((collection, collectionIndex) => {
        const items = Array.isArray(collection.items) ? collection.items : [];
        const isGrid = collection.layout === "grid";
        return (
          <div key={`${collection.label ?? "collection"}-${collectionIndex}`}>
            <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">{collection.label ?? "Collection"}</div>
            <div className={isGrid ? "grid grid-cols-2 lg:grid-cols-4 gap-3" : "flex flex-wrap gap-3"}>
              {items.map((item, itemIndex) => (
                <motion.div
                  key={`${item.label ?? "item"}-${itemIndex}`}
                  layout
                  className={`min-w-[72px] rounded-2xl border px-3 py-3 text-center ${itemClassName(item.status)}`}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">{item.label ?? itemIndex}</div>
                  <div className="text-sm font-semibold mt-1">{String(item.value ?? "")}</div>
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
        <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Graph State</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nodes.map((node, index) => (
            <div key={`${node.id ?? node.label ?? "node"}-${index}`} className={`rounded-2xl border p-4 text-center ${itemClassName(node.status)}`}>
              <div className="text-xl font-semibold">{node.label ?? node.id ?? "?"}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mt-2">{node.status ?? "default"}</div>
            </div>
          ))}
        </div>
      </div>
      {edges.length ? (
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Connections</div>
          <div className="flex flex-wrap gap-2">
            {edges.map((edge, index) => (
              <span key={`${edge.from ?? "?"}-${edge.to ?? "?"}-${index}`} className="px-3 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] text-xs text-[#cbd5e1]">
                {edge.from} -&gt; {edge.to}
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
      <div className="text-xs uppercase tracking-[0.2em] text-[#64748b] mb-2">Call Stack</div>
      <div className="space-y-2">
        {frames.map((frame, index) => (
          <div key={`${frame}-${index}`} className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-3 text-sm text-[#e5e7eb]">
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
      className={`h-11 rounded-xl border flex items-center justify-center gap-2 text-sm transition-all ${
        active ? "border-[#22c55e] bg-[#22c55e]/10 text-[#86efac]" : "border-[#1f2937] bg-[#111827] text-[#cbd5e1] hover:border-[#334155]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ControlButton({ onClick, icon, disabled }: { onClick: () => void; icon: React.ReactNode; disabled?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className="w-10 h-10 rounded-xl bg-[#1f2937] hover:bg-[#374151] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
    >
      {icon}
    </motion.button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1 rounded-full bg-[#111827] border border-[#1f2937] text-[#cbd5e1]">{children}</span>;
}

function PanelMessage({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "error" }) {
  return (
    <div className={`max-w-5xl mx-auto rounded-2xl border p-6 text-sm ${tone === "error" ? "border-[#ef4444]/40 bg-[#7f1d1d]/20 text-[#fecaca]" : "border-[#1f2937] bg-[#111827] text-[#94a3b8]"}`}>
      {children}
    </div>
  );
}

function itemClassName(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "border-[#22c55e]/50 bg-[#22c55e]/10 text-[#86efac]";
    case "sorted":
    case "done":
    case "visited":
      return "border-[#3b82f6]/50 bg-[#3b82f6]/10 text-[#bfdbfe]";
    case "pivot":
    case "frontier":
      return "border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#fde68a]";
    case "boundary":
    case "candidate":
      return "border-[#a855f7]/40 bg-[#a855f7]/10 text-[#e9d5ff]";
    case "dimmed":
      return "border-[#1f2937] bg-[#020617] text-[#64748b]";
    default:
      return "border-[#1f2937] bg-[#0f172a] text-[#e5e7eb]";
  }
}
