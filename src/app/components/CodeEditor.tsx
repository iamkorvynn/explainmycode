import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { FileCode, Sparkles, Code2 } from "lucide-react";

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
    <div className="h-full w-full bg-[#FAF9F7] flex flex-col overflow-hidden select-none transition-colors">
      {/* Top File Tab Strip (Stitch Studio Style) */}
      <div className="h-10 bg-[#FFFFFF] border-b border-[#ECE8DF] flex items-center justify-between px-3 select-none">
        <div className="flex items-center gap-1.5">
          {/* Active File Tab Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F5F4F0] border border-[#ECE8DF] text-xs font-bold text-[#1E1E24] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A50]" />
            <FileCode className="w-3.5 h-3.5 text-[#FF7A50]" />
            <span>{filename}</span>
          </div>
        </div>

        {/* Right Info Tags */}
        <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#F5F4F0] text-[#A8A29E] font-mono">
            {lineCount} lines
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#FFF1EB] text-[#FF7A50] font-bold border border-[#FFD9CA] uppercase text-[10px]">
            {language}
          </span>
        </div>
      </div>

      {/* Editor Surface: High-contrast Dark Graphite Inset */}
      <div className="flex-1 p-2 bg-[#FAF9F7]">
        <div className="h-full w-full rounded-2xl bg-[#0F141C] border border-[#1E2530] overflow-hidden shadow-inner">
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
