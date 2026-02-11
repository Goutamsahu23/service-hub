"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { APP_NAME, NAV_ITEMS, ROLES } from "@/constants";
import type { NavCounts } from "@/types";
import { NavIcon, LogoIcon, IconMenu, IconClose } from "@/icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [navCounts, setNavCounts] = useState<NavCounts>({ inbox: 0, bookings: 0 });
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const refreshNavCounts = useCallback(() => {
    if (!user?.workspace?.id) return;
    api<NavCounts>(`/dashboard/${user.workspace.id}/nav-counts`)
      .then((data) => {
        setNavCounts(data);
        setCountsLoaded(true);
      })
      .catch(() => {
        setNavCounts({ inbox: 0, bookings: 0 });
        setCountsLoaded(true);
      });
  }, [user?.workspace?.id]);

  useEffect(() => {
    if (!user?.workspace?.id) return;
    refreshNavCounts();
  }, [user?.workspace?.id, pathname, refreshNavCounts]);

  useEffect(() => {
    if (!user?.workspace?.id) return;
    const onRefresh = () => refreshNavCounts();
    window.addEventListener("dashboard:refresh-nav-counts", onRefresh);
    return () => window.removeEventListener("dashboard:refresh-nav-counts", onRefresh);
  }, [user?.workspace?.id, refreshNavCounts]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <button
        type="button"
        aria-label="Close menu"
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-20 bg-slate-900/50 transition-opacity md:hidden ${
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-64 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out md:z-10 md:w-56 md:max-w-none md:translate-x-0 md:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-4 py-4 md:justify-start">
          <Link href="/dashboard" onClick={closeMobileMenu} className="flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 text-white shadow-sm ring-1 ring-sky-500/20">
              <LogoIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-slate-800">{APP_NAME}</span>
              <span className="block truncate text-xs text-slate-500">{user.workspace.name}</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Close menu"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => {
            const count = item.countKey ? navCounts[item.countKey] : 0;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium no-underline md:py-2 ${
                  isActive ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="shrink-0 text-current">
                  <NavIcon name={item.icon} />
                </span>
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.href === "/dashboard/settings" && user.role === ROLES[1] && (
                    <span className="shrink-0 text-xs text-slate-400">(limited)</span>
                  )}
                  {countsLoaded && item.countKey && (
                    <span
                      className={`pointer-events-none shrink-0 min-w-[1.25rem] rounded-full px-2 py-0.5 text-center text-xs font-semibold ${
                        count > 0 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                      title={item.countKey === "inbox" ? "Open conversations" : "Upcoming confirmed bookings"}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 md:py-2"
          >
            <span className="shrink-0">
              <NavIcon name="logout" />
            </span>
            Log out
          </button>
        </div>
      </aside>

      <div
        className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 pb-3 md:hidden"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="-ml-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200"
          aria-label="Open menu"
        >
          <IconMenu className="h-6 w-6" />
        </button>
        <span className="text-base font-semibold text-slate-800">{APP_NAME}</span>
        <div className="min-w-[44px]" />
      </div>

      <main className="min-h-screen flex-1 pt-[calc(max(0.75rem,env(safe-area-inset-top,0px))+4rem+0.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pl-4 pr-4 md:ml-56 md:pt-6 md:pb-6 md:pl-6 md:pr-6">
        {children}
      </main>
    </div>
  );
}
