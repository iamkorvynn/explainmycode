import { useEffect, useRef, useState } from "react";
import {
  Send,
  Loader2,
  MessageSquare,
  FileText,
  Bug,
  Shield,
  Lightbulb,
  Bot,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import type { LiveComment } from "../lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
  citations?: Array<Record<string, unknown>>;
}

interface AIMentorPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  response: string;
  comments: LiveComment[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  code: string;
  errorMessage?: string;
  onSendMessage: (message: string) => Promise<void> | void;
  canChat: boolean;
}

const tabs = [
  { id: "Comments", label: "Comments", icon: MessageSquare },
  { id: "Summary", label: "Summary", icon: FileText },
  { id: "Explanation", label: "Explain", icon: Lightbulb },
  { id: "Bugs", label: "Bugs", icon: Bug },
  { id: "Assumptions", label: "Assumptions", icon: Shield },
  { id: "Chat", label: "Chat", icon: Bot },
];

export function AIMentorPanel({
  activeTab,
  onTabChange,
  response,
  comments,
  chatMessages,
  isLoading,
  code,
  errorMessage,
  onSendMessage,
  canChat: _canChat,
}: AIMentorPanelProps) {
  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = async () => {
    const message = chatInput.trim();
    if (!message || isLoading) {
      return;
    }

    setChatInput("");
    if (activeTab !== "Chat") {
      onTabChange("Chat");
    }
    await onSendMessage(message);
  };

  return (
    <aside className="h-full bg-[#000000] border-l border-white/10 flex flex-col select-none text-white transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/15 flex items-center justify-center text-[#eca8d6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">
                AI Code Mentor
              </h2>
              <span className="text-[10px] text-white/40 font-mono">
                Groq LLaMA 3.3 · Sub-10ms
              </span>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/60 text-[10px] font-mono border border-white/10">
            #INSPECTOR-AST
          </span>
        </div>

        {/* Segmented Pills Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-white/50"}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === "Chat" ? (
            <ChatTab
              key="chat"
              messages={chatMessages}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onFollowUpClick={(message) => {
                setChatInput("");
                void onSendMessage(message);
              }}
            />
          ) : isLoading ? (
            <AnalyzingAnimation key="analyzing" />
          ) : activeTab === "Comments" ? (
            <CommentsTab key="comments" comments={comments} code={code} />
          ) : errorMessage ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400 space-y-1 shadow-xs"
            >
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Analysis Notification
              </div>
              <p>{errorMessage}</p>
            </motion.div>
          ) : response ? (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <ResponseRenderer content={response} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4 space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/40">
                <Bot className="w-6 h-6 text-[#eca8d6]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white">Ready for Code Analysis</div>
                <div className="text-xs text-white/40 leading-relaxed font-mono">
                  Select an AI tab, click any line number in the editor, or ask the mentor a question below.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Deck */}
      <div className="p-4 border-t border-white/10 bg-[#000000] space-y-3">
        {activeTab === "Chat" ? (
          <div className="space-y-2">
            <div className="flex items-center bg-white/[0.03] hover:bg-white/[0.05] focus-within:bg-black border border-white/10 focus-within:border-[#eca8d6]/50 rounded-xl pl-3.5 pr-1.5 py-1.5 transition-all">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSendMessage();
                  }
                }}
                disabled={isLoading}
                placeholder="Ask mentor anything..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-white/35 font-mono outline-none disabled:opacity-60"
              />
              <motion.button
                whileHover={{ scale: !isLoading ? 1.05 : 1 }}
                whileTap={{ scale: !isLoading ? 0.95 : 1 }}
                onClick={() => void handleSendMessage()}
                disabled={isLoading || !chatInput.trim()}
                className="w-8 h-8 bg-white hover:bg-white/90 text-black rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>
            <div className="text-[10px] text-white/40 flex items-center justify-between px-1 font-mono">
              <span>Press Enter to send</span>
              <span className="text-[#eca8d6]">Groq LLaMA 3.3 Turbo</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Complexity & Verification Summary */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-white/60">
                <span>Algorithmic Complexity</span>
                <span className="font-bold text-white">O(n log n)</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Docker Sandbox</span>
                <span className="text-[#10b981] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Verified
                </span>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange("Chat")}
              className="w-full py-3 px-4 rounded-full bg-white hover:bg-white/90 active:bg-white/80 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Wand2 className="w-4 h-4 text-black" />
              <span>Ask AI Mentor About Selection</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </motion.button>
          </div>
        )}
      </div>
    </aside>
  );
}

function AnalyzingAnimation() {
  const steps = [
    "Parsing AST tokens...",
    "Scanning functions & recursion...",
    "Validating complexity bounds...",
    "Composing explanation...",
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-2 font-mono">
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[#eca8d6]">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span className="text-xs font-semibold">Analyzing your code...</span>
      </div>

      <div className="space-y-2 p-1">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-2.5 text-xs text-white/60"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#eca8d6]" />
            <span>{step}</span>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 space-y-2">
        <div className="h-2.5 bg-white/[0.05] rounded-full animate-pulse w-3/4" />
        <div className="h-2.5 bg-white/[0.05] rounded-full animate-pulse w-1/2" />
        <div className="h-2.5 bg-white/[0.05] rounded-full animate-pulse w-5/6" />
      </div>
    </motion.div>
  );
}

function CommentsTab({ comments, code }: { comments: LiveComment[]; code: string }) {
  if (!code) {
    return (
      <div className="text-white/40 text-xs italic text-center py-8 font-mono">
        Write or open code in the editor to view line-by-line comments.
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-white/40 text-xs italic text-center py-8 font-mono">
        No comments yet. Code looks clean!
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wide mb-1">
        Active File Annotations ({comments.length})
      </div>
      {comments.map((comment, index) => {
        const isImportant = comment.type === "important";
        const isError = comment.type === "error" || comment.type === "warning";

        return (
          <motion.div
            key={`${comment.line}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#eca8d6]/40 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-white/80 font-mono text-[11px] font-bold">
                Line {comment.line}
              </span>
              <span
                className={`text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded-full ${
                  isError
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : isImportant
                    ? "bg-[#eca8d6]/10 text-[#eca8d6] border border-[#eca8d6]/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {comment.type}
              </span>
            </div>
            <p className="text-xs text-white/85 leading-relaxed font-sans">
              {comment.comment}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

function ChatTab({
  messages,
  isLoading,
  errorMessage,
  onFollowUpClick,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  errorMessage?: string;
  onFollowUpClick: (message: string) => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, errorMessage]);

  if (!messages.length && !isLoading && !errorMessage) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="text-xs font-semibold text-white">Start a Mentor Session</div>
        <p className="text-xs text-white/40 max-w-xs mx-auto font-mono">
          Ask questions about complexity, optimal algorithms, edge cases, or how to refactor your code.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <motion.div
            key={`${message.role}-${index}-${(message.content || "").slice(0, 24)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-3.5 text-xs ${
              isUser
                ? "ml-8 bg-white/[0.1] text-white border border-white/20 rounded-tr-sm"
                : "mr-4 bg-white/[0.03] border border-white/10 text-white rounded-tl-sm space-y-2"
            }`}
          >
            <div
              className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${
                isUser ? "text-[#eca8d6]" : "text-white/40"
              }`}
            >
              {isUser ? "You" : "AI Mentor"}
            </div>

            {isUser ? (
              <p className="font-sans leading-relaxed">{message.content}</p>
            ) : (
              <ResponseRenderer content={message.content || ""} />
            )}

            {/* Follow up pills */}
            {message.followUps?.length ? (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                {message.followUps.map((followUp) => (
                  <button
                    key={followUp}
                    onClick={() => onFollowUpClick(followUp)}
                    className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 text-[11px] font-mono text-white/80 transition-colors cursor-pointer"
                  >
                    {followUp}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        );
      })}

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mr-6 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs flex items-center gap-2 text-white/60 font-mono"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#eca8d6]" />
          <span>Generating response with Groq LLaMA 3.3...</span>
        </motion.div>
      ) : null}

      {errorMessage ? (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {errorMessage}
        </div>
      ) : null}

      <div ref={messagesEndRef} />
    </div>
  );
}

function ResponseRenderer({ content }: { content: string }) {
  const lines = (content || "").split("\n");

  return (
    <div className="space-y-2 text-xs leading-relaxed text-white/85">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h3 key={index} className="text-sm font-semibold text-white mt-2 mb-1">
              {line.substring(2)}
            </h3>
          );
        }

        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h4 key={index} className="font-semibold text-[#eca8d6] mt-2">
              {line.substring(2, line.length - 2)}
            </h4>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <div key={index} className="flex items-start gap-1.5 ml-2 text-white/80">
              <span className="text-[#eca8d6] font-bold">•</span>
              <span>{line.substring(2)}</span>
            </div>
          );
        }

        if (line.includes("`") && line.includes("`")) {
          const parts = line.split("`");
          return (
            <div key={index} className="text-white/80">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? (
                  <code
                    key={partIndex}
                    className="px-1.5 py-0.5 bg-white/[0.06] border border-white/10 rounded text-[#eca8d6] font-mono text-[11px]"
                  >
                    {part}
                  </code>
                ) : (
                  <span key={partIndex}>{part}</span>
                )
              )}
            </div>
          );
        }

        if (line.trim()) {
          return (
            <p key={index} className="text-white/80">
              {line}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
