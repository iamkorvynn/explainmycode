import { useState } from "react";
import { Send, Loader2, MessageSquare, FileText, Bug, Shield, Lightbulb, Bot } from "lucide-react";
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
  { id: "Explanation", label: "Explanation", icon: Lightbulb },
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
  canChat,
}: AIMentorPanelProps) {
  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = async () => {
    const message = chatInput.trim();
    if (!message) {
      return;
    }

    await onSendMessage(message);
    setChatInput("");
  };

  return (
    <div className="h-full bg-[#111827] flex flex-col">
      <div className="p-4 border-b border-[#1f2937]">
        <h2 className="text-lg font-semibold text-[#e5e7eb] mb-3">AI Mentor</h2>

        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/20"
                    : "bg-[#1f2937] text-[#9ca3af] hover:bg-[#374151] hover:text-[#e5e7eb]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
              className="rounded-lg border border-[#ef4444]/40 bg-[#7f1d1d]/30 p-4 text-sm text-[#fecaca]"
            >
              {errorMessage}
            </motion.div>
          ) : response ? (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="prose prose-invert prose-sm max-w-none"
            >
              <ResponseRenderer content={response} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#6b7280] text-sm italic"
            >
              Select an AI tab, click a line number, or ask the mentor a question about your code.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-[#1f2937]">
        {activeTab === "Chat" ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSendMessage();
                }
              }}
              disabled={!canChat || isLoading}
              placeholder={canChat ? "Ask AI Mentor about this code..." : "Open or create a file to chat with the mentor"}
              className="flex-1 h-10 bg-[#1f2937] border border-[#374151] rounded-lg px-4 text-sm text-[#e5e7eb] placeholder:text-[#6b7280] focus:outline-none focus:border-[#22c55e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <motion.button
              whileHover={{ scale: canChat && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: canChat && !isLoading ? 0.95 : 1 }}
              onClick={() => void handleSendMessage()}
              disabled={!canChat || isLoading}
              className="w-10 h-10 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#14532d] disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-[#22c55e]/20"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        ) : (
          <div className="text-xs text-[#6b7280]">
            Open the <span className="text-[#22c55e] font-medium">Chat</span> tab to ask follow-up questions about the current file.
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyzingAnimation() {
  const steps = [
    "AI analyzing code...",
    "Scanning functions...",
    "Detecting algorithms...",
    "Generating explanation...",
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-[#22c55e] animate-spin" />
        <span className="text-sm text-[#e5e7eb]">Analyzing your code...</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.5 }}
            className="flex items-center gap-2 text-sm text-[#9ca3af]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
            {step}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
        <div className="space-y-2">
          <div className="h-3 bg-[#374151] rounded animate-pulse" style={{ width: "80%" }} />
          <div className="h-3 bg-[#374151] rounded animate-pulse" style={{ width: "60%" }} />
          <div className="h-3 bg-[#374151] rounded animate-pulse" style={{ width: "90%" }} />
        </div>
      </div>
    </motion.div>
  );
}

function CommentsTab({ comments, code }: { comments: LiveComment[]; code: string }) {
  if (!code) {
    return <div className="text-[#6b7280] text-sm italic">Write some code to see real-time line comments...</div>;
  }

  if (comments.length === 0) {
    return <div className="text-[#6b7280] text-sm italic">No comments yet. Pause briefly and the backend will analyze the file.</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-[#9ca3af] mb-3">Real-time line-by-line analysis powered by the backend.</div>
      {comments.map((comment, index) => {
        const bgColor =
          comment.type === "info"
            ? "bg-[#1e3a8a]/20 border-[#3b82f6]"
            : comment.type === "important"
              ? "bg-[#14532d]/20 border-[#22c55e]"
              : "bg-[#7f1d1d]/20 border-[#ef4444]";

        const textColor =
          comment.type === "info"
            ? "text-[#3b82f6]"
            : comment.type === "important"
              ? "text-[#22c55e]"
              : "text-[#ef4444]";

        return (
          <motion.div
            key={`${comment.line}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`p-3 rounded-lg border ${bgColor} transition-all`}
          >
            <div className="flex items-start gap-2">
              <span className={`text-xs font-mono font-bold ${textColor} min-w-[3rem]`}>Line {comment.line}</span>
              <span className="text-sm text-[#d1d5db]">{comment.comment}</span>
            </div>
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
  if (!messages.length && !isLoading && !errorMessage) {
    return (
      <div className="text-[#6b7280] text-sm italic">
        Ask the mentor anything about the current file, edge cases, bugs, complexity, or how to improve it.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 ${
            message.role === "user"
              ? "ml-8 border-[#1d4ed8]/40 bg-[#1e3a8a]/20"
              : "mr-4 border-[#374151] bg-[#1f2937]"
          }`}
        >
          <div className="mb-2 text-[11px] uppercase tracking-wider text-[#9ca3af]">
            {message.role === "user" ? "You" : "AI Mentor"}
          </div>
          {message.role === "assistant" ? (
            <ResponseRenderer content={message.content} />
          ) : (
            <p className="text-sm text-[#e5e7eb]">{message.content}</p>
          )}

          {message.citations?.length ? (
            <div className="mt-3 space-y-1">
              {message.citations.map((citation, citationIndex) => (
                <div key={citationIndex} className="text-xs text-[#9ca3af]">
                  {String(citation.label ?? "Reference")}:
                  {" "}
                  {String(citation.reason ?? "")}
                </div>
              ))}
            </div>
          ) : null}

          {message.followUps?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.followUps.map((followUp) => (
                <button
                  key={followUp}
                  onClick={() => onFollowUpClick(followUp)}
                  className="rounded-full border border-[#22c55e]/30 bg-[#14532d]/20 px-3 py-1 text-xs text-[#86efac] hover:bg-[#14532d]/35 transition-colors"
                >
                  {followUp}
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      ))}

      {errorMessage ? (
        <div className="rounded-lg border border-[#ef4444]/40 bg-[#7f1d1d]/30 p-4 text-sm text-[#fecaca]">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mr-4 rounded-2xl border border-[#374151] bg-[#1f2937] p-4"
        >
          <div className="mb-2 text-[11px] uppercase tracking-wider text-[#9ca3af]">AI Mentor</div>
          <div className="flex items-center gap-2 text-sm text-[#d1d5db]">
            <Loader2 className="h-4 w-4 animate-spin text-[#22c55e]" />
            Thinking about your code...
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function ResponseRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h2 key={index} className="text-lg font-bold text-[#e5e7eb] mb-2">
              {line.substring(2)}
            </h2>
          );
        }

        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3 key={index} className="font-semibold text-[#e5e7eb] mt-3">
              {line.substring(2, line.length - 2)}
            </h3>
          );
        }

        if (line.startsWith("- ") || line.startsWith("Warning") || line.startsWith("Fix") || line.startsWith("Related")) {
          return (
            <div key={index} className="text-sm text-[#d1d5db] ml-2">
              {line}
            </div>
          );
        }

        if (line.includes("`") && line.includes("`")) {
          const parts = line.split("`");
          return (
            <div key={index} className="text-sm text-[#d1d5db]">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? (
                  <code key={partIndex} className="px-2 py-0.5 bg-[#1f2937] rounded text-[#22c55e] font-mono text-xs">
                    {part}
                  </code>
                ) : (
                  <span key={partIndex}>{part}</span>
                ),
              )}
            </div>
          );
        }

        if (line.trim()) {
          return (
            <p key={index} className="text-sm text-[#d1d5db]">
              {line}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
