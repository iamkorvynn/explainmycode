import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FilePlus,
  Folder,
  Search,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  const [search, setSearch] = useState("");
  const filteredNodes = useMemo(() => filterTree(nodes, search), [nodes, search]);

  const totalFiles = useMemo(() => countFiles(nodes), [nodes]);

  return (
    <aside className="h-full bg-[#000000] border-r border-white/10 flex flex-col select-none text-white transition-colors">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider text-white/50 uppercase">
              {workspaceName ? workspaceName : "Workspace"}
            </span>
            {/* Pill Counter */}
            <span className="px-2 py-0.5 rounded-full bg-[#eca8d6] text-black text-[10px] font-semibold font-mono">
              {totalFiles}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onCreateFile}
            title="Create new file"
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter files..."
            className="w-full h-8 bg-white/[0.03] border border-white/10 rounded-lg pl-8 pr-2 text-xs text-white placeholder:text-white/35 font-mono focus:outline-none focus:border-[#eca8d6]/50 focus:ring-1 focus:ring-[#eca8d6]/30 transition-all"
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        {isLoading ? (
          <div className="px-3 py-6 text-xs text-white/40 flex items-center justify-center gap-2 font-mono">
            <div className="w-3 h-3 border-2 border-[#eca8d6]/30 border-t-[#eca8d6] rounded-full animate-spin" />
            <span>Loading workspace files...</span>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-white/40 font-mono">
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
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedFileId === node.id;

  if (node.type === "folder") {
    return (
      <div>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.04] cursor-pointer transition-colors"
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#eca8d6]" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-white/40" />
          )}
          <span className="text-xs truncate font-medium">{node.name}</span>
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
      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-white/[0.08] text-white font-medium border border-white/15 shadow-xs relative"
          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
      }`}
      style={{ paddingLeft: `${depth * 14 + 16}px` }}
    >
      <div className="flex items-center gap-2 truncate">
        {isSelected ? (
          <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6] shrink-0" />
        ) : (
          <FileCode className="w-3.5 h-3.5 text-white/40 shrink-0" />
        )}
        <span className="text-xs truncate font-mono">{node.name}</span>
      </div>

      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-white/40 border border-white/5 shrink-0">
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
