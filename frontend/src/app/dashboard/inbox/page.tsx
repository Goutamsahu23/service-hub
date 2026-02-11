"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Conversation } from "@/types";
import { LoadingSpinner } from "@/components/ui";

export default function InboxPage() {
  const { user } = useAuth();
  const workspaceId = user?.workspace?.id;
  const [list, setList] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    api<Conversation[]>(`/inbox/${workspaceId}/conversations`)
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const displayName = (c: Conversation) =>
    c.contact_name || c.contact_email || c.contact_phone || "Unknown";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Inbox</h1>
          <p className="mt-0.5 text-sm text-slate-500">All conversations in one place. Click to open and reply.</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-slate-800">No conversations yet</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              When customers submit your contact form or message you, they’ll appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {list.length} conversation{list.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/inbox/${c.id}`}
                  className={`flex items-center gap-4 px-4 py-4 transition hover:bg-slate-50/80 sm:px-5 ${
                    c.has_unread ? "bg-sky-50/30" : ""
                  }`}
                >
                  <div className="relative flex shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                      {displayName(c).charAt(0).toUpperCase()}
                    </div>
                    {c.has_unread && (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-sky-500"
                        title="Unread"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate font-medium ${c.has_unread ? "text-slate-900" : "text-slate-800"}`}>
                        {displayName(c)}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {c.last_message_at
                          ? new Date(c.last_message_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: new Date(c.last_message_at).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                            })
                          : ""}
                      </span>
                    </div>
                    {c.last_message ? (
                      <p className="mt-0.5 truncate text-sm text-slate-500">{c.last_message}</p>
                    ) : (
                      <p className="mt-0.5 text-sm italic text-slate-400">No messages yet</p>
                    )}
                  </div>
                  <svg className="h-5 w-5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
