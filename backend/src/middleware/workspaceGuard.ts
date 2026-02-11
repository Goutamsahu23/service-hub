import type { Response, NextFunction } from "express";
import { db } from "../db/client.js";
import type { AuthRequest } from "../types/index.js";
import { AppError } from "./errorHandler.js";

export async function workspaceGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const workspaceId = req.params.workspaceId ?? req.body?.workspace_id;
  if (!workspaceId || !req.user) {
    return next(new AppError(400, "Workspace ID required"));
  }
  const r = await db.query(
    "SELECT role FROM workspace_users WHERE id = $1 AND workspace_id = $2",
    [req.user.userId, workspaceId]
  );
  if (r.rows.length === 0) {
    return next(new AppError(403, "Access denied to this workspace"));
  }
  (req as AuthRequest & { userWorkspaceRole: string }).userWorkspaceRole = r.rows[0].role;
  next();
}
