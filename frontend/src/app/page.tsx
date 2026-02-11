"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { APP_NAME } from "@/constants";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
        <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
          Welcome, {user.fullName || user.email}
        </h1>
        <p className="text-slate-600">{user.workspace.name}</p>
        <Link
          href="/dashboard"
          className="min-h-[48px] rounded-xl bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <span className="text-lg font-semibold sm:text-xl">{APP_NAME}</span>
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/login"
            className="min-h-[44px] min-w-[44px] rounded-lg border border-white/20 px-4 py-2.5 text-center text-sm font-medium hover:bg-white/10 sm:py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="min-h-[44px] min-w-[44px] rounded-lg bg-sky-500 px-4 py-2.5 text-center text-sm font-medium hover:bg-sky-600 sm:py-2"
          >
            Get started
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          One system. One dashboard. One business.
        </h1>
        <p className="mt-4 text-base text-slate-300 sm:mt-6 sm:text-lg">
          Connect leads, bookings, forms, and inventory in a single operations platform.
          No more scattered tools—see and act from one place.
        </p>
        <div className="mt-8 flex flex-col gap-3 px-2 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4 sm:px-0">
          <Link
            href="/signup"
            className="min-h-[48px] rounded-xl bg-sky-500 px-6 py-3.5 font-medium hover:bg-sky-600 sm:py-3"
          >
            Start free
          </Link>
          <Link
            href="/login"
            className="min-h-[48px] rounded-xl border border-white/20 px-6 py-3.5 font-medium hover:bg-white/10 sm:py-3"
          >
            Log in
          </Link>
        </div>
      </main>
    </div>
  );
}
