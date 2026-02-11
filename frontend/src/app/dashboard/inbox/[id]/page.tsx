"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Message } from "@/types";

export default function ConversationPage() {
  const params = useParams();
  const { user } = useAuth();
  const workspaceId = user?.workspace?.id;
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactName, setContactName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyChannel, setReplyChannel] = useState<"email" | "sms">("email");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!workspaceId || !conversationId) return;
    api<Message[]>(`/inbox/${workspaceId}/conversations/${conversationId}/messages`).then(setMessages).catch(() => setMessages([]));
    api<{ contact_name: string }>(`/inbox/${workspaceId}/conversations/${conversationId}`).then((c) => setContactName(c.contact_name || "Contact")).catch(() => {});
  }, [workspaceId, conversationId]);

  // Mark as read when opening the chat and refresh sidebar count
  useEffect(() => {
    if (!workspaceId || !conversationId) return;
    api(`/inbox/${workspaceId}/conversations/${conversationId}/read`, { method: "PATCH" })
      .then(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dashboard:refresh-nav-counts"));
        }
      })
      .catch(() => {});
  }, [workspaceId, conversationId]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      await api(`/inbox/${workspaceId}/conversations/${conversationId}/reply`, {
        method: "POST",
        body: JSON.stringify({ channel: replyChannel, body: replyBody }),
      });
      setReplyBody("");
      const next = await api<Message[]>(`/inbox/${workspaceId}/conversations/${conversationId}/messages`);
      setMessages(next);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-3">
        <Link
          href="/dashboard/inbox"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 transition"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Inbox
        </Link>
        <div className="h-4 w-px bg-slate-200" aria-hidden />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-slate-800">{contactName || "…"}</h1>
          <p className="text-xs text-slate-500">Conversation</p>
        </div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg px-4 py-2 max-w-[80%] ${
              m.direction === "in" ? "ml-0 bg-slate-100" : "ml-auto bg-sky-100"
            }`}
          >
            <p className="text-sm text-slate-600">{m.body}</p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(m.created_at).toLocaleString()} · {m.channel}
              {m.is_automated && " · automated"}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={sendReply} className="flex items-end gap-2 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
        <select
          value={replyChannel}
          onChange={(e) => setReplyChannel(e.target.value as "email" | "sms")}
          className="h-9 shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
        <textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Type your reply…"
          rows={1}
          className="min-h-[2.25rem] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !replyBody.trim()}
          className="h-9 shrink-0 rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
