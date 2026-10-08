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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Layers,
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
    <aside className="h-full bg-[#FCFBFA] border-l border-[#ECE8DF] flex flex-col select-none transition-colors">
      {/* Purr'Coffee-Style Right Header */}
      <div className="p-4 border-b border-[#ECE8DF] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1EB] border border-[#FFD9CA] flex items-center justify-center text-[#FF7A50]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1E1E24] leading-tight">
                AI Inspector
              </h2>
              <span className="text-[10px] text-[#A8A29E] font-medium">
                Live Groq LLaMA 3.3 Mentor
              </span>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-[#F5F4F0] text-[#78716C] text-[10px] font-mono border border-[#ECE8DF]">
            #LIVE-3243
          </span>
        </div>

        {/* Purr'Coffee Segmented Pills Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5F4F0] rounded-2xl border border-[#ECE8DF]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FF7A50] text-white shadow-sm shadow-[#FF7A50]/30 font-bold"
                    : "text-[#78716C] hover:text-[#1E1E24] hover:bg-white/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body Area */}
      <div className="flex-1 overflow-y-auto p-4 select-text">
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
              className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-xs text-[#DC2626] space-y-1 shadow-xs"
            >
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
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
              <div className="w-12 h-12 rounded-2xl bg-[#F5F4F0] border border-[#ECE8DF] flex items-center justify-center mx-auto text-[#A8A29E]">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#1E1E24]">Ready for Code Analysis</div>
                <div className="text-xs text-[#A8A29E] leading-relaxed">
                  Select an AI tab, click any line number in the editor, or ask the mentor a question below.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Deck (Matching the Purr'Coffee Cart Checkout Deck!) */}
      <div className="p-4 border-t border-[#ECE8DF] bg-[#FFFFFF] space-y-3">
        {activeTab === "Chat" ? (
          <div className="space-y-2">
            <div className="flex items-center bg-[#F7F6F2] hover:bg-[#F2F0EB] focus-within:bg-[#FFFFFF] border border-[#ECE8DF] focus-within:border-[#FF7A50]/50 focus-within:ring-2 focus-within:ring-[#FF7A50]/15 rounded-2xl pl-3.5 pr-1.5 py-1.5 transition-all shadow-inner">
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
                className="flex-1 bg-transparent text-xs text-[#1E1E24] placeholder:text-[#A8A29E] font-medium outline-none disabled:opacity-60"
              />
              <motion.button
                whileHover={{ scale: !isLoading ? 1.05 : 1 }}
                whileTap={{ scale: !isLoading ? 0.95 : 1 }}
                onClick={() => void handleSendMessage()}
                disabled={isLoading || !chatInput.trim()}
                className="w-8 h-8 bg-[#FF7A50] hover:bg-[#FF6633] active:bg-[#E65F35] disabled:bg-[#F5F4F0] disabled:text-[#A8A29E] text-white rounded-xl flex items-center justify-center transition-all shadow-sm shadow-[#FF7A50]/20 cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>
            <div className="text-[10px] text-[#A8A29E] flex items-center justify-between px-1">
              <span>Press Enter to send</span>
              <span className="font-semibold text-[#FF7A50]">Groq LLaMA 3.3 Turbo</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Resource / Order Summary Box (matching Purr'Coffee Items & Total preview) */}
            <div className="p-3 rounded-2xl bg-[#FBFBFA] border border-[#ECE8DF] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#78716C]">
                <span>Engine Complexity</span>
                <span className="font-mono font-bold text-[#1E1E24]">O(n log n)</span>
              </div>
              <div className="flex items-center justify-between text-[#78716C]">
                <span>Docker Sandbox</span>
                <span className="text-[#10B981] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Verified
                </span>
              </div>
            </div>

            {/* The Big Coral Action Button (matching "Place an order" button in Purr'Coffee!) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange("Chat")}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FF7A50] hover:bg-[#FF6633] active:bg-[#E65F35] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF7A50]/25 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-2">
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF1EB] border border-[#FFD9CA] text-[#FF7A50]">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span className="text-xs font-bold">Analyzing your code...</span>
      </div>

      <div className="space-y-2 p-1">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-2.5 text-xs text-[#78716C]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A50]" />
            <span>{step}</span>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white rounded-2xl border border-[#ECE8DF] space-y-2 shadow-xs">
        <div className="h-2.5 bg-[#F5F4F0] rounded-full animate-pulse w-3/4" />
        <div className="h-2.5 bg-[#F5F4F0] rounded-full animate-pulse w-1/2" />
        <div className="h-2.5 bg-[#F5F4F0] rounded-full animate-pulse w-5/6" />
      </div>
    </motion.div>
  );
}

function CommentsTab({ comments, code }: { comments: LiveComment[]; code: string }) {
  if (!code) {
    return (
      <div className="text-[#A8A29E] text-xs italic text-center py-8">
        Write or open code in the editor to view line-by-line comments.
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-[#A8A29E] text-xs italic text-center py-8">
        No comments yet. Code looks clean!
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wide mb-1">
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
            className="p-3.5 rounded-2xl bg-white border border-[#ECE8DF] hover:border-[#FF7A50]/40 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-[#F5F4F0] text-[#78716C] font-mono text-[11px] font-bold">
                Line {comment.line}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isError
                    ? "bg-[#FEF2F2] text-[#DC2626]"
                    : isImportant
                    ? "bg-[#FFF1EB] text-[#FF7A50]"
                    : "bg-[#F0FDF4] text-[#16A34A]"
                }`}
              >
                {comment.type}
              </span>
            </div>
            <p className="text-xs text-[#1E1E24] leading-relaxed font-medium">
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
        <div className="text-xs font-bold text-[#1E1E24]">Start a Mentor Session</div>
        <p className="text-xs text-[#A8A29E] max-w-xs mx-auto">
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
            className={`rounded-2xl p-3.5 text-xs ${
              isUser
                ? "ml-8 bg-[#FF7A50] text-white shadow-sm shadow-[#FF7A50]/20 rounded-tr-sm"
                : "mr-4 bg-white border border-[#ECE8DF] text-[#1E1E24] shadow-xs rounded-tl-sm space-y-2"
            }`}
          >
            <div
              className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                isUser ? "text-white/80" : "text-[#A8A29E]"
              }`}
            >
              {isUser ? "You" : "AI Mentor"}
            </div>

            {isUser ? (
              <p className="font-medium leading-relaxed">{message.content}</p>
            ) : (
              <ResponseRenderer content={message.content || ""} />
            )}

            {/* Follow up pills */}
            {message.followUps?.length ? (
              <div className="mt-2.5 pt-2 border-t border-[#ECE8DF] flex flex-wrap gap-1.5">
                {message.followUps.map((followUp) => (
                  <button
                    key={followUp}
                    onClick={() => onFollowUpClick(followUp)}
                    className="rounded-full border border-[#FFD9CA] bg-[#FFF1EB] hover:bg-[#FFE4D6] px-2.5 py-1 text-[11px] font-semibold text-[#FF7A50] transition-colors cursor-pointer"
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
          className="mr-6 rounded-2xl bg-white border border-[#ECE8DF] p-3 text-xs flex items-center gap-2 text-[#78716C] shadow-xs"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF7A50]" />
          <span>Generating response with Groq LLaMA 3.3...</span>
        </motion.div>
      ) : null}

      {errorMessage ? (
        <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs">
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
    <div className="space-y-2 text-xs leading-relaxed text-[#1E1E24]">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h3 key={index} className="text-sm font-extrabold text-[#1E1E24] mt-2 mb-1">
              {line.substring(2)}
            </h3>
          );
        }

        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h4 key={index} className="font-bold text-[#FF7A50] mt-2">
              {line.substring(2, line.length - 2)}
            </h4>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <div key={index} className="flex items-start gap-1.5 ml-2 text-[#44403C]">
              <span className="text-[#FF7A50] font-bold">•</span>
              <span>{line.substring(2)}</span>
            </div>
          );
        }

        if (line.includes("`") && line.includes("`")) {
          const parts = line.split("`");
          return (
            <div key={index} className="text-[#44403C]">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? (
                  <code
                    key={partIndex}
                    className="px-1.5 py-0.5 bg-[#F5F4F0] border border-[#ECE8DF] rounded text-[#FF7A50] font-mono text-[11px] font-semibold"
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
            <p key={index} className="text-[#44403C]">
              {line}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
