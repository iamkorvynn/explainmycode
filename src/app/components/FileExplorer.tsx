import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode, FilePlus, Folder, Search } from "lucide-react";
import { motion } from "motion/react";

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

  return (
    <div className="h-full bg-[#111827] flex flex-col">
      <div className="p-3 border-b border-[#1f2937]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
            {workspaceName ? `${workspaceName} Explorer` : "Explorer"}
          </span>
          <button
            onClick={onCreateFile}
            className="w-6 h-6 rounded hover:bg-[#1f2937] flex items-center justify-center transition-colors"
          >
            <FilePlus className="w-4 h-4 text-[#9ca3af]" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full h-7 bg-[#1f2937] border border-[#374151] rounded pl-8 pr-2 text-xs text-[#e5e7eb] placeholder:text-[#6b7280] focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="px-2 py-4 text-sm text-[#6b7280]">Loading workspace...</div>
        ) : filteredNodes.length === 0 ? (
          <div className="px-2 py-4 text-sm text-[#6b7280]">No files match your search.</div>
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
    </div>
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

  if (node.type === "folder") {
    return (
      <div>
        <motion.div
          whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.5)" }}
          onClick={() => setIsExpanded((value) => !value)}
          className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer group"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
          )}
          <Folder className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-sm text-[#e5e7eb]">{node.name}</span>
        </motion.div>

        {isExpanded && node.children?.length ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {node.children.map((child) => (
              <FileTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
              />
            ))}
          </motion.div>
        ) : null}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.5)" }}
      onClick={() => onSelectFile(node)}
      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer group ${
        selectedFileId === node.id ? "bg-[#1e3a8a]/40 border border-[#3b82f6]/40" : ""
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <FileCode className="w-4 h-4 text-[#22c55e]" />
      <span className="text-sm text-[#e5e7eb]">{node.name}</span>
    </motion.div>
  );
}

function filterTree(nodes: WorkspaceNode[], query: string): WorkspaceNode[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return nodes;
  }

  return nodes
    .map((node) => {
      if (node.type === "folder") {
        const children = filterTree(node.children ?? [], normalizedQuery);
        if (node.name.toLowerCase().includes(normalizedQuery) || children.length > 0) {
          return { ...node, children };
        }
        return null;
      }
      return node.name.toLowerCase().includes(normalizedQuery) ? node : null;
    })
    .filter((node): node is WorkspaceNode => node !== null);
}
