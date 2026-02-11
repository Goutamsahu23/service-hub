import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import * as dashboardService from "../services/dashboardService.js";
import type { AuthRequest } from "../types/index.js";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

// More specific route first so it isn't matched by :workspaceId
dashboardRouter.get(
  "/:workspaceId/nav-counts",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const counts = await dashboardService.getNavCounts(workspaceId, userId);
      res.json(counts);
    } catch (e) {
      next(e);
    }
  }
);

dashboardRouter.get(
  "/:workspaceId",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const data = await dashboardService.getDashboard(workspaceId, userId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);
