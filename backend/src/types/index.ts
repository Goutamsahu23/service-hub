import type { Request } from "express";

export type UserRole = "owner" | "staff";

export interface WorkspaceUser {
  id: string;
  workspace_id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  permissions: Record<string, boolean>;
}

export interface JwtPayload {
  userId: string;
  workspaceId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface Workspace {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  contact_email: string | null;
  status: "draft" | "active";
  email_connected: boolean;
  sms_connected: boolean;
  created_at: Date;
  updated_at: Date;
}
