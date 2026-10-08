import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FilePlus,
  Folder,
  Search,
  FolderOpen,
  Sparkles,
  Eye,
  BarChart3,
  Terminal as TerminalIcon,
  HardDrive,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

import type { WorkspaceNode } from "../lib/api";

interface FileExplorerProps {
  workspaceName?: string;
  nodes: WorkspaceNode[];
  selectedFileId?: string | null;
  isLoading?: boolean;
  onCreateFile: () => void;
  onSelectFile: (node: WorkspaceNode) => void;
}

export function FileExplorer({
  workspaceName,
  nodes,
  selectedFileId,
  isLoading = false,
  onCreateFile,
  onSelectFile,
}: FileExplorerProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const filteredNodes = useMemo(() => filterTree(nodes, search), [nodes, search]);

  const totalFiles = useMemo(() => countFiles(nodes), [nodes]);

  return (
    <aside className="h-full bg-[#FBFBFA] border-r border-[#ECE8DF] flex flex-col select-none transition-colors">
      {/* Header with Purr'Coffee-Style Pill Badge */}
      <div className="p-3.5 border-b border-[#ECE8DF] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold tracking-wider text-[#A8A29E] uppercase">
              {workspaceName ? workspaceName : "Workspace"}
            </span>
            {/* Coral Pill Counter (Like '13' in the mockup) */}
            <span className="px-2 py-0.5 rounded-full bg-[#FF7A50] text-white text-[10px] font-bold shadow-xs">
              {totalFiles}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onCreateFile}
            title="Create new file"
            className="w-7 h-7 rounded-lg bg-[#FFFFFF] hover:bg-[#FFF1EB] border border-[#ECE8DF] hover:border-[#FF7A50]/50 text-[#78716C] hover:text-[#FF7A50] flex items-center justify-center transition-all shadow-xs cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A29E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter files..."
            className="w-full h-8 bg-white border border-[#ECE8DF] rounded-xl pl-8 pr-2 text-xs text-[#1E1E24] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#FF7A50] focus:ring-1 focus:ring-[#FF7A50]/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        {isLoading ? (
          <div className="px-3 py-6 text-xs text-[#A8A29E] flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-[#FF7A50]/30 border-t-[#FF7A50] rounded-full animate-spin" />
            <span>Loading workspace files...</span>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[#A8A29E]">
            No files match your query.
          </div>
        ) : (
          filteredNodes.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>

      {/* Bottom Shortcuts Deck (matching the Purr'Coffee left nav items) */}
      <div className="p-3 border-t border-[#ECE8DF] bg-[#F8F7F4] space-y-1.5">
        <button
          onClick={() => navigate("/visualize")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:text-[#1E1E24] hover:bg-white hover:border-[#ECE8DF] border border-transparent transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#FF7A50]" />
            <span>Algorithm Visualizer</span>
          </div>
          <span className="text-[10px] text-[#A8A29E] group-hover:text-[#FF7A50] transition-colors">
            Interactive
          </span>
        </button>

        <button
          onClick={() => navigate("/analysis")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:text-[#1E1E24] hover:bg-white hover:border-[#ECE8DF] border border-transparent transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>AI Code Health</span>
          </div>
          <span className="text-[10px] text-[#A8A29E] group-hover:text-[#3B82F6] transition-colors">
            Metrics
          </span>
        </button>

        {/* Sandbox status pill */}
        <div className="pt-1 flex items-center justify-between px-3 text-[10px] text-[#A8A29E]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Docker Sandbox Online
          </span>
          <span className="font-mono text-[#78716C]">v1.4</span>
        </div>
      </div>
    </aside>
  );
}

interface FileTreeNodeProps {
  node: WorkspaceNode;
  depth: number;
  selectedFileId?: string | null;
  onSelectFile: (node: WorkspaceNode) => void;
}

function FileTreeNode({ node, depth, selectedFileId, onSelectFile }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const isSelected = selectedFileId === node.id;

  if (node.type === "folder") {
    return (
      <div>
        <div
          onClick={() => setIsExpanded((value) => !value)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-[#F2F0EB] text-[#78716C] hover:text-[#1E1E24] transition-colors group"
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#FF7A50]" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-[#FF7A50]" />
          )}
          <span className="text-xs font-semibold text-[#1E1E24]">{node.name}</span>
        </div>

        {isExpanded && node.children?.length ? (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  const extension = node.name.split(".").pop()?.toLowerCase();

  return (
    <div
      onClick={() => onSelectFile(node)}
      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "bg-[#FFFFFF] text-[#1E1E24] font-bold border border-[#ECE8DF] shadow-xs relative"
          : "text-[#78716C] hover:text-[#1E1E24] hover:bg-[#F2F0EB]"
      }`}
      style={{ paddingLeft: `${depth * 14 + 16}px` }}
    >
      <div className="flex items-center gap-2 truncate">
        {/* Active Coral Dot Indicator */}
        {isSelected ? (
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A50] shrink-0" />
        ) : (
          <FileCode className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
        )}
        <span className="text-xs truncate">{node.name}</span>
      </div>

      {/* Language badge pill */}
      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#F5F4F0] text-[#A8A29E] shrink-0">
        {extension ?? "code"}
      </span>
    </div>
  );
}

function countFiles(nodes: WorkspaceNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") count++;
    if (node.children?.length) count += countFiles(node.children);
  }
  return count;
}

function filterTree(nodes: WorkspaceNode[], query: string): WorkspaceNode[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return nodes;
  }

  return nodes
    .map((node) => {
      if (node.type === "folder") {
        const filteredChildren = filterTree(node.children ?? [], normalizedQuery);
        if (filteredChildren.length || node.name.toLowerCase().includes(normalizedQuery)) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      return node.name.toLowerCase().includes(normalizedQuery) ? node : null;
    })
    .filter(Boolean) as WorkspaceNode[];
}
