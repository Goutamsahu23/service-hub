import type { NavCounts } from "@/types";

export const APP_NAME = "Service Hub";

export const ROLES = ["owner", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const WORKSPACE_STATUSES = ["draft", "active"] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export const BOOKING_STATUSES = ["confirmed", "completed", "no_show", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const FORM_SUBMISSION_STATUSES = ["pending", "overdue", "completed"] as const;
export type FormSubmissionStatus = (typeof FORM_SUBMISSION_STATUSES)[number];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", countKey: null as keyof NavCounts | null, icon: "overview" as const },
  { href: "/dashboard/inbox", label: "Inbox", countKey: "inbox" as keyof NavCounts | null, icon: "inbox" as const },
  { href: "/dashboard/bookings", label: "Bookings", countKey: "bookings" as keyof NavCounts | null, icon: "bookings" as const },
  { href: "/dashboard/forms", label: "Forms", countKey: null as keyof NavCounts | null, icon: "forms" as const },
  { href: "/dashboard/inventory", label: "Inventory", countKey: null as keyof NavCounts | null, icon: "inventory" as const },
  { href: "/dashboard/settings", label: "Settings", countKey: null as keyof NavCounts | null, icon: "settings" as const },
] as const;

export const PUBLIC_BOOK_STEPS = ["Service", "Date & time", "Your details"] as const;

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
