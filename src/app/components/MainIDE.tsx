import { useEffect, useMemo, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { AIMentorPanel } from "./AIMentorPanel";
import { AmIOnTrackBar } from "./AmIOnTrackBar";
import { CodeEditor } from "./CodeEditor";
import { FileExplorer } from "./FileExplorer";
import { Terminal, ExecutionStats } from "./Terminal";
import { TopNavBar } from "./TopNavBar";
import { WelcomeScreen } from "./WelcomeScreen";
import {
  ApiError,
  createWorkspace,
  createWorkspaceNode,
  getAssumptions,
  getBugs,
  getCurrentCodeState,
  getCurrentWorkspaceState,
  getExplanation,
  getLineExplanation,
  getLiveComments,
  getSummary,
  getWorkspaceTree,
  listWorkspaces,
  runCode,
  sendMentorChat,
  setCurrentCodeState,
  setCurrentWorkspaceState,
  updateWorkspaceNode,
  type LiveComment,
  type Workspace,
  type WorkspaceNode,
} from "../lib/api";

const SAMPLE_CODE = `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

numbers = [1, 3, 5, 7, 9, 11, 13, 15]
print(binary_search(numbers, 7))
`;

type AITab = "Comments" | "Summary" | "Explanation" | "Bugs" | "Assumptions" | "Chat";
type ExplanationMode = "section" | "line";
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
  citations?: Array<Record<string, unknown>>;
};

export function MainIDE() {
  const rememberedWorkspace = getCurrentWorkspaceState();
  const rememberedCode = getCurrentCodeState();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tree, setTree] = useState<WorkspaceNode[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(rememberedWorkspace.fileId);
  const [code, setCode] = useState(rememberedCode.code);
  const [persistedCode, setPersistedCode] = useState(rememberedCode.code);
  const [language, setLanguage] = useState(rememberedCode.language);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [activeAITab, setActiveAITab] = useState<AITab>("Comments");
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>("section");
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [mentorResponse, setMentorResponse] = useState("");
  const [mentorComments, setMentorComments] = useState<LiveComment[]>([]);
  const [mentorError, setMentorError] = useState("");
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [stdin, setStdin] = useState("");
  const [lastExecutionStats, setLastExecutionStats] = useState<ExecutionStats | null>(null);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);

  const selectedFile = useMemo(() => findNodeById(tree, selectedFileId), [tree, selectedFileId]);

  useEffect(() => {
    void initializeWorkspace();
  }, []);

  useEffect(() => {
    setCurrentCodeState(code, language);
  }, [code, language]);

  useEffect(() => {
    if (!workspace?.id || !selectedFileId || code === persistedCode) {
      return;
    }

    const timer = setTimeout(() => {
      void saveCurrentFile();
    }, 900);

    return () => clearTimeout(timer);
  }, [code, language, persistedCode, selectedFileId, workspace?.id]);

  useEffect(() => {
    if (activeAITab === "Chat") {
      return;
    }

    if (!workspace?.id || !selectedFileId || !code.trim()) {
      setMentorComments([]);
      if (!code.trim()) {
        setMentorResponse("");
        setMentorError("");
      }
      return;
    }

    const delay = activeAITab === "Comments" ? 1200 : 250;
    const timer = setTimeout(() => {
      void refreshMentorPanel();
    }, delay);

    return () => clearTimeout(timer);
  }, [activeAITab, code, explanationMode, language, selectedFileId, selectedLine, workspace?.id]);

  async function initializeWorkspace() {
    setIsWorkspaceLoading(true);
    try {
      const nextWorkspace = await ensureWorkspaceExists();
      if (!nextWorkspace) {
        return null;
      }
      setWorkspace(nextWorkspace);
      setCurrentWorkspaceState(nextWorkspace.id, rememberedWorkspace.fileId);
      await loadTree(nextWorkspace, rememberedWorkspace.fileId ?? undefined);
      return nextWorkspace;
    } catch (error) {
      pushTerminalLines([
        "> Failed to load workspace",
        error instanceof ApiError ? error.message : "Unexpected error while loading your files.",
      ]);
      return null;
    } finally {
      setIsWorkspaceLoading(false);
    }
  }

  async function ensureWorkspaceExists() {
    if (workspace) {
      return workspace;
    }

    const workspaces = await listWorkspaces();
    let nextWorkspace = workspaces.find((item) => item.id === rememberedWorkspace.workspaceId) ?? workspaces[0];

    if (!nextWorkspace) {
      nextWorkspace = await createWorkspace({
        name: "My Workspace",
        description: "Default workspace created by ExplainMyCode",
      });
    }

    setWorkspace(nextWorkspace);
    setCurrentWorkspaceState(nextWorkspace.id, rememberedWorkspace.fileId);
    return nextWorkspace;
  }

  async function loadTree(targetWorkspace: Workspace, preferredFileId?: string) {
    const response = await getWorkspaceTree(targetWorkspace.id);
    setTree(response.nodes);

    const fileToSelect =
      (preferredFileId ? findNodeById(response.nodes, preferredFileId) : null) ?? findFirstFile(response.nodes);

    if (fileToSelect && fileToSelect.type === "file") {
      selectFile(fileToSelect, targetWorkspace.id);
      return;
    }

    setSelectedFileId(null);
    setCode("");
    setPersistedCode("");
    setLanguage("python");
    setCurrentWorkspaceState(targetWorkspace.id, null);
    setCurrentCodeState("", "python");
  }

  function selectFile(node: WorkspaceNode, workspaceIdOverride?: string) {
    const nextLanguage = inferLanguage(node);
    const nextCode = node.content ?? "";
    setSelectedFileId(node.id);
    setSelectedLine(null);
    setExplanationMode("section");
    setActiveAITab((current) => (current === "Chat" ? "Chat" : "Comments"));
    setCode(nextCode);
    setPersistedCode(nextCode);
    setLanguage(nextLanguage);
    setMentorResponse("");
    setMentorComments([]);
    setMentorError("");
    setCurrentWorkspaceState(workspaceIdOverride ?? workspace?.id ?? node.workspace_id, node.id);
    setCurrentCodeState(nextCode, nextLanguage);
  }

  async function saveCurrentFile() {
    if (!workspace?.id || !selectedFileId) {
      return;
    }

    try {
      const updated = await updateWorkspaceNode(workspace.id, selectedFileId, {
        content: code,
        language,
      });
      setPersistedCode(code);
      setTree((currentTree) => updateNode(currentTree, updated));
    } catch (error) {
      pushTerminalLines([
        "> Autosave failed",
        error instanceof ApiError ? error.message : "Unable to save the current file.",
      ]);
    }
  }

  async function createAndSelectFile(name: string, content: string, fileLanguage: string) {
    const targetWorkspace = await ensureWorkspaceExists();
    if (!targetWorkspace) {
      pushTerminalLines(["> Workspace is still loading. Please try again in a moment."]);
      return;
    }

    const parent = findPreferredParent(tree);
    const created = await createWorkspaceNode(targetWorkspace.id, {
      parentId: parent?.id ?? null,
      name,
      type: "file",
      language: fileLanguage,
      content,
    });
    setTree((currentTree) => insertNode(currentTree, created, parent?.id ?? null));
    selectFile(created, targetWorkspace.id);
  }

  async function handleCreateFile() {
    const suggestedName = uniqueFileName("main.py", flattenFiles(tree).map((node) => node.name));
    const name = window.prompt("Enter a file name", suggestedName)?.trim();
    if (!name) {
      return;
    }

    try {
      const targetWorkspace = await ensureWorkspaceExists();
      if (!targetWorkspace) {
        pushTerminalLines(["> Workspace is still loading. Please try again in a moment."]);
        return;
      }

      const preferredParent = findPreferredParent(tree);
      const created = await createWorkspaceNode(targetWorkspace.id, {
        parentId: preferredParent?.id ?? null,
        name,
        type: "file",
        language: inferLanguageFromName(name),
        content: "",
      });
      setTree((currentTree) => insertNode(currentTree, created, preferredParent?.id ?? null));
      selectFile(created, targetWorkspace.id);
    } catch (error) {
      pushTerminalLines([
        "> File creation failed",
        error instanceof ApiError ? error.message : "Unable to create the requested file.",
      ]);
    }
  }

  async function handleTrySampleCode() {
    const name = uniqueFileName("binary_search.py", flattenFiles(tree).map((node) => node.name));
    try {
      await createAndSelectFile(name, SAMPLE_CODE, "python");
    } catch (error) {
      pushTerminalLines([
        "> Unable to create sample file",
        error instanceof ApiError ? error.message : "Unexpected error while creating the sample file.",
      ]);
    }
  }

  async function handleOpenEditor() {
    const name = uniqueFileName("main.py", flattenFiles(tree).map((node) => node.name));
    try {
      await createAndSelectFile(name, "", "python");
    } catch (error) {
      pushTerminalLines([
        "> Unable to create blank file",
        error instanceof ApiError ? error.message : "Unexpected error while opening the editor.",
      ]);
    }
  }

  async function handleRunCode() {
    const defaultExt =
      language === "python" ? "py" :
      language === "javascript" ? "js" :
      language === "typescript" ? "ts" :
      language === "cpp" ? "cpp" :
      language === "java" ? "java" : "txt";
    const activeFilename = selectedFile?.name ?? `main.${defaultExt}`;

    try {
      setShowTerminal(true);
      setIsTerminalRunning(true);
      pushTerminalLines([`> Running ${activeFilename} via OnlineCompiler.io...`]);
      const result = await runCode({
        sourceCode: code || "",
        language: language || "python",
        stdin,
        workspaceId: workspace?.id ?? undefined,
        filename: activeFilename,
      });

      setLastExecutionStats({
        timeMs: result.execution_time_ms,
        memoryKb: result.memory_kb,
        exitStatus: result.exit_status,
        provider: result.provider ?? "compiler-io",
        timestamp: new Date().toLocaleTimeString(),
      });

      const nextLines: string[] = [];
      if (result.stdout) {
        nextLines.push(...result.stdout.split("\n").filter((l, i, arr) => i < arr.length - 1 || l.trim() !== ""));
      }
      if (result.stderr) {
        nextLines.push(...result.stderr.split("\n").filter((l, i, arr) => i < arr.length - 1 || l.trim() !== ""));
      }
      if (result.compile_output) {
        nextLines.push(...result.compile_output.split("\n").filter((l, i, arr) => i < arr.length - 1 || l.trim() !== ""));
      }
      const timeStr = result.execution_time_ms != null ? ` (${result.execution_time_ms}ms)` : "";
      const memStr = result.memory_kb != null ? ` [${(result.memory_kb / 1024).toFixed(1)}MB]` : "";
      nextLines.push(`✓ Process finished with status ${result.exit_status}${timeStr}${memStr}`);
      pushTerminalLines(nextLines);
    } catch (error) {
      pushTerminalLines([
        "> Execution failed",
        error instanceof ApiError ? error.message : "Unable to execute code.",
      ]);
    } finally {
      setIsTerminalRunning(false);
    }
  }

  function handleTabChange(tab: string) {
    const nextTab = tab as AITab;
    if (nextTab === "Explanation") {
      setExplanationMode("section");
    } else {
      setSelectedLine(null);
    }
    setMentorError("");
    setActiveAITab(nextTab);
  }

  function handleLineClick(lineNumber: number) {
    setSelectedLine(lineNumber);
    setExplanationMode("line");
    setActiveAITab("Explanation");
    setMentorError("");
  }

  async function refreshMentorPanel() {
    if (!workspace?.id || !selectedFile) {
      return;
    }

    setIsMentorLoading(true);
    setMentorError("");
    try {
      if (activeAITab === "Comments") {
        const response = await getLiveComments({
          code,
          language,
          filename: selectedFile.name,
          workspaceId: workspace.id,
        });
        setMentorComments(response.comments);
        setMentorResponse("");
      } else if (activeAITab === "Summary") {
        const response = await getSummary({
          code,
          language,
          filename: selectedFile.name,
          workspaceId: workspace.id,
        });
        setMentorResponse(`# Summary\n\n${response.summary}`);
      } else if (activeAITab === "Explanation") {
        if (explanationMode === "line" && selectedLine) {
          const response = await getLineExplanation({
            code,
            language,
            lineNumber: selectedLine,
            filename: selectedFile.name,
            workspaceId: workspace.id,
          });
          setMentorResponse(formatLineExplanation(response));
        } else {
          const response = await getExplanation({
            code,
            language,
            filename: selectedFile.name,
            workspaceId: workspace.id,
          });
          setMentorResponse(formatExplanation(response));
        }
      } else if (activeAITab === "Bugs") {
        const response = await getBugs({
          code,
          language,
          filename: selectedFile.name,
          workspaceId: workspace.id,
        });
        setMentorResponse(formatBugs(response.bugs));
      } else if (activeAITab === "Assumptions") {
        const response = await getAssumptions({
          code,
          language,
          filename: selectedFile.name,
          workspaceId: workspace.id,
        });
        setMentorResponse(formatAssumptions(response.assumptions));
      }
    } catch (error) {
      setMentorError(error instanceof ApiError ? error.message : "Unable to fetch AI analysis.");
    } finally {
      setIsMentorLoading(false);
    }
  }

  async function handleSendMentorMessage(message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const nextHistory = [...chatMessages, { role: "user" as const, content: trimmedMessage }];
    setChatMessages(nextHistory);
    setExplanationMode("section");
    setSelectedLine(null);
    setActiveAITab("Chat");
    setIsMentorLoading(true);
    setMentorError("");
    try {
      const response = await sendMentorChat({
        code: code || "",
        language: language || "python",
        message: trimmedMessage,
        filename: selectedFile?.name ?? "scratchpad.py",
        workspaceId: workspace?.id ?? undefined,
        history: nextHistory.map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
      });
      setChatMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: response.answer || "No response received.",
          followUps: response.follow_ups || [],
          citations: response.citations || [],
        },
      ]);
    } catch (error) {
      setMentorError(error instanceof ApiError ? error.message : "Unable to send your question.");
    } finally {
      setIsMentorLoading(false);
    }
  }

  function pushTerminalLines(lines: string[]) {
    setTerminalOutput((current) => [...current, ...lines]);
  }

  return (
    <div className="h-screen w-screen bg-black text-white p-2 md:p-3 overflow-hidden flex flex-col relative font-sans select-none">
      {/* Organic Contour Curves Watermark */}
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

      {/* Decorative // Badge Watermark in background */}
      <div className="absolute top-1 right-6 text-white/20 text-2xl font-black font-mono select-none pointer-events-none tracking-widest">
        //
      </div>

      {/* Floating Studio Canvas Container */}
      <div className="relative z-10 h-full w-full bg-[#09090b] text-white rounded-[18px] md:rounded-[22px] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        <TopNavBar
          onRunCode={handleRunCode}
          onToggleTerminal={() => setShowTerminal((prev) => !prev)}
          showTerminal={showTerminal}
          isTerminalRunning={isTerminalRunning}
        />

        <div className="flex-1 flex overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={18} minSize={12} maxSize={28}>
              <FileExplorer
                workspaceName={workspace?.name}
                nodes={tree}
                selectedFileId={selectedFileId}
                isLoading={isWorkspaceLoading}
                onCreateFile={() => void handleCreateFile()}
                onSelectFile={selectFile}
              />
            </Panel>

            <PanelResizeHandle className="w-[1px] bg-white/10 hover:bg-[#eca8d6] transition-colors cursor-col-resize" />

            <Panel defaultSize={52} minSize={30}>
              {showTerminal ? (
                <PanelGroup direction="vertical">
                  <Panel defaultSize={isTerminalMaximized ? 25 : 68} minSize={20}>
                    {selectedFile ? (
                      <CodeEditor
                        code={code}
                        language={language}
                        onChange={setCode}
                        selectedLine={selectedLine}
                        onLineClick={handleLineClick}
                        filename={selectedFile?.name ?? "main.py"}
                      />
                    ) : (
                      <WelcomeScreen
                        onTrySampleCode={() => void handleTrySampleCode()}
                        onOpenEditor={() => void handleOpenEditor()}
                        isLoading={isWorkspaceLoading && !workspace}
                      />
                    )}
                  </Panel>

                  <PanelResizeHandle className="h-[1px] bg-white/10 hover:bg-[#eca8d6] transition-colors cursor-row-resize" />

                  <Panel defaultSize={isTerminalMaximized ? 75 : 32} minSize={15}>
                    <Terminal
                      output={terminalOutput}
                      onClear={() => setTerminalOutput([])}
                      stdin={stdin}
                      onStdinChange={setStdin}
                      isLoading={isTerminalRunning}
                      onRunCode={handleRunCode}
                      onClose={() => setShowTerminal(false)}
                      isMaximized={isTerminalMaximized}
                      onToggleMaximize={() => setIsTerminalMaximized(!isTerminalMaximized)}
                      language={language}
                      filename={selectedFile?.name ?? "main.py"}
                      executionStats={lastExecutionStats}
                    />
                  </Panel>
                </PanelGroup>
              ) : (
                <div className="h-full">
                  {selectedFile ? (
                    <CodeEditor
                      code={code}
                      language={language}
                      onChange={setCode}
                      selectedLine={selectedLine}
                      onLineClick={handleLineClick}
                      filename={selectedFile?.name ?? "main.py"}
                    />
                  ) : (
                    <WelcomeScreen
                      onTrySampleCode={() => void handleTrySampleCode()}
                      onOpenEditor={() => void handleOpenEditor()}
                      isLoading={isWorkspaceLoading && !workspace}
                    />
                  )}
                </div>
              )}
            </Panel>

            <PanelResizeHandle className="w-[1px] bg-white/10 hover:bg-[#eca8d6] transition-colors cursor-col-resize" />

            <Panel defaultSize={30} minSize={22} maxSize={42}>
              <AIMentorPanel
                activeTab={activeAITab}
                onTabChange={handleTabChange}
                response={mentorResponse}
                comments={mentorComments}
                chatMessages={chatMessages}
                isLoading={isMentorLoading}
                code={code}
                errorMessage={mentorError}
                onSendMessage={handleSendMentorMessage}
                canChat={true}
              />
            </Panel>
          </PanelGroup>
        </div>

        <AmIOnTrackBar code={code} language={language} workspaceId={workspace?.id} filename={selectedFile?.name} />
      </div>
    </div>
  );
}

function flattenFiles(nodes: WorkspaceNode[]): WorkspaceNode[] {
  return nodes.flatMap((node) => (node.type === "file" ? [node] : flattenFiles(node.children ?? [])));
}

function findNodeById(nodes: WorkspaceNode[], nodeId: string | null | undefined): WorkspaceNode | null {
  if (!nodeId) {
    return null;
  }
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children?.length) {
      const match = findNodeById(node.children, nodeId);
      if (match) {
        return match;
      }
    }
  }
  return null;
}

function findFirstFile(nodes: WorkspaceNode[]): WorkspaceNode | null {
  for (const node of nodes) {
    if (node.type === "file") {
      return node;
    }
    if (node.children?.length) {
      const child = findFirstFile(node.children);
      if (child) {
        return child;
      }
    }
  }
  return null;
}

function findPreferredParent(nodes: WorkspaceNode[]): WorkspaceNode | null {
  return nodes.find((node) => node.type === "folder") ?? null;
}

function inferLanguage(node: WorkspaceNode): string {
  return node.language ?? inferLanguageFromName(node.name);
}

function inferLanguageFromName(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "py") return "python";
  if (extension === "js") return "javascript";
  if (extension === "java") return "java";
  if (extension === "cpp" || extension === "cc" || extension === "cxx") return "cpp";
  return "python";
}

function updateNode(nodes: WorkspaceNode[], updatedNode: WorkspaceNode): WorkspaceNode[] {
  return nodes.map((node) => {
    if (node.id === updatedNode.id) {
      return { ...node, ...updatedNode };
    }
    if (node.children?.length) {
      return { ...node, children: updateNode(node.children, updatedNode) };
    }
    return node;
  });
}

function insertNode(nodes: WorkspaceNode[], newNode: WorkspaceNode, parentId: string | null): WorkspaceNode[] {
  if (!parentId) {
    return [...nodes, { ...newNode, children: newNode.children ?? [] }];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), { ...newNode, children: newNode.children ?? [] }] };
    }
    if (node.children?.length) {
      return { ...node, children: insertNode(node.children, newNode, parentId) };
    }
    return node;
  });
}

function uniqueFileName(baseName: string, existingNames: string[]) {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  const parts = baseName.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()}` : "";
  const root = parts.join(".") || baseName;
  let counter = 2;
  while (existingNames.includes(`${root}_${counter}${extension}`)) {
    counter += 1;
  }
  return `${root}_${counter}${extension}`;
}

function formatExplanation(response: {
  sections: Array<{ title: string; start_line: number; end_line: number; summary: string }>;
  full_explanation: string;
}) {
  const sectionText = response.sections
    .map((section) => `**Lines ${section.start_line}-${section.end_line} - ${section.title}**\n${section.summary}`)
    .join("\n\n");
  return `# Explanation\n\n${response.full_explanation}\n\n${sectionText}`;
}

function formatLineExplanation(response: { line_number: number; explanation: string; related_lines: number[] }) {
  const relatedLines = response.related_lines.length ? response.related_lines.join(", ") : "None";
  return `# Line ${response.line_number}\n\n${response.explanation}\n\n- Related lines: ${relatedLines}`;
}

function formatBugs(
  bugs: Array<{
    title: string;
    line: number;
    severity: string;
    category: string;
    description: string;
    fix_suggestion: string;
  }>,
) {
  if (!bugs.length) {
    return "# Bugs\n\nNo obvious bugs were detected in the current file.";
  }

  return `# Bugs\n\n${bugs
    .map(
      (bug) =>
        `**Line ${bug.line} - ${bug.title}**\n${bug.description}\n- Severity: ${bug.severity}\n- Category: ${bug.category}\n- Fix: ${bug.fix_suggestion}`,
    )
    .join("\n\n")}`;
}

function formatAssumptions(assumptions: Array<{ title: string; category: string; description: string }>) {
  return `# Assumptions\n\n${assumptions
    .map((assumption) => `**${assumption.title}**\n${assumption.description}\n- Category: ${assumption.category}`)
    .join("\n\n")}`;
}

function looksLikeInteractiveInput(sourceCode: string, language: string) {
  const normalized = language.toLowerCase();
  if (normalized === "python" || normalized === "py") {
    return sourceCode.includes("input(");
  }
  if (normalized === "javascript" || normalized === "js" || normalized === "typescript" || normalized === "ts") {
    return sourceCode.includes("prompt(") || sourceCode.toLowerCase().includes("readline");
  }
  if (normalized === "java") {
    const lower = sourceCode.toLowerCase();
    return lower.includes("scanner") || lower.includes("bufferedreader");
  }
  if (normalized === "cpp" || normalized === "c++") {
    return sourceCode.includes("cin >>") || sourceCode.replace(/\s/g, "").includes("getline(cin");
  }
  return /\bstdin\b/i.test(sourceCode);
}
