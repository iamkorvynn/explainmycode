import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  selectedLine: number | null;
  onLineClick: (lineNumber: number) => void;
}

export function CodeEditor({ code, language, onChange, selectedLine, onLineClick }: CodeEditorProps) {
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

  return (
    <div className="h-full w-full bg-[#020617]">
      <Editor
        height="100%"
        language={normalizeLanguage(language)}
        value={code}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
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
          padding: { top: 16, bottom: 16 },
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
  );
}

function normalizeLanguage(language: string) {
  const normalized = language.toLowerCase();
  if (normalized === "py") return "python";
  if (normalized === "js") return "javascript";
  if (normalized === "c++" || normalized === "cpp") return "cpp";
  return normalized || "plaintext";
}
