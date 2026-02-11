export const DEFAULT_JWT_EXPIRES_IN = "7d";

export const ROLES = ["owner", "staff"] as const;
export type Role = (typeof ROLES)[number];

export const WORKSPACE_STATUSES = ["draft", "active"] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];
