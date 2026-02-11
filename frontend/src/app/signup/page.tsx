"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        email,
        password,
        fullName: fullName || undefined,
        workspaceName,
        address: address || undefined,
        timezone,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-1 w-full min-h-[48px] rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Create your workspace</h1>
        <p className="mt-1 text-sm text-slate-500">Step 1: Account and business</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">Your name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Business name</label>
            <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Address (optional)</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Time zone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern</option>
              <option value="America/Chicago">Central</option>
              <option value="America/Denver">Mountain</option>
              <option value="America/Los_Angeles">Pacific</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-sky-600 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            {loading ? "Creating…" : "Create workspace"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-sky-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
