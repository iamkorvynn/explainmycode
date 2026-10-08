import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { FileCode } from "lucide-react";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  selectedLine: number | null;
  onLineClick: (lineNumber: number) => void;
  filename?: string;
}

export function CodeEditor({
  code,
  language,
  onChange,
  selectedLine,
  onLineClick,
  filename = "main.py",
}: CodeEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    editorRef.current = editor;

    editor.onMouseDown((event) => {
      if (event.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        const lineNumber = event.target.position?.lineNumber;
        if (lineNumber) {
          onLineClick(lineNumber);
        }
      }
    });
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !selectedLine) {
      return;
    }

    editor.revealLineInCenter(selectedLine);
    editor.setSelection({
      startLineNumber: selectedLine,
      startColumn: 1,
      endLineNumber: selectedLine,
      endColumn: editor.getModel()?.getLineMaxColumn(selectedLine) || 1,
    });
  }, [selectedLine]);

  const lineCount = (code || "").split("\n").length;

  return (
    <div className="h-full w-full bg-[#09090b] flex flex-col overflow-hidden select-none text-white transition-colors">
      {/* Top File Tab Strip */}
      <div className="h-10 bg-[#000000] border-b border-white/10 flex items-center justify-between px-3.5 select-none">
        <div className="flex items-center gap-1.5">
          {/* Active File Tab Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.05] border border-white/15 text-xs font-mono text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#eca8d6]" />
            <FileCode className="w-3.5 h-3.5 text-[#eca8d6]" />
            <span>{filename}</span>
          </div>
        </div>

        {/* Right Info Tags */}
        <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/[0.03] text-white/40 border border-white/5">
            {lineCount} lines
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#eca8d6]/10 text-[#eca8d6] font-semibold border border-[#eca8d6]/25 uppercase text-[10px]">
            {language}
          </span>
        </div>
      </div>

      {/* Editor Surface: High-contrast Dark Slate / JetBrains Mono */}
      <div className="flex-1 p-2 bg-[#09090b]">
        <div className="h-full w-full rounded-xl bg-[#000000] border border-white/10 overflow-hidden shadow-inner">
          <Editor
            height="100%"
            language={normalizeLanguage(language)}
            value={code}
            onChange={(value) => onChange(value || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 13.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              renderLineHighlight: "all",
              roundedSelection: true,
              padding: { top: 14, bottom: 14 },
              bracketPairColorization: {
                enabled: true,
              },
              guides: {
                indentation: true,
                bracketPairs: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function normalizeLanguage(language: string) {
  const normalized = language.toLowerCase();
  if (normalized === "py") return "python";
  if (normalized === "js") return "javascript";
  if (normalized === "ts") return "typescript";
  if (normalized === "c++" || normalized === "cpp") return "cpp";
  return normalized || "plaintext";
}
