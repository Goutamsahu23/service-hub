import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import { requireRole } from "../middleware/auth.js";
import * as formsService from "../services/formsService.js";
import type { AuthRequest } from "../types/index.js";

export const formsRouter = Router();

formsRouter.use(authMiddleware);

formsRouter.get(
  "/:workspaceId/templates",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const list = await formsService.listFormTemplates(workspaceId, userId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

formsRouter.post(
  "/:workspaceId/templates",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const created = await formsService.createFormTemplate(workspaceId, userId, req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

formsRouter.get(
  "/:workspaceId/submissions",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const status = req.query.status as string | undefined;
      const list = await formsService.listFormSubmissions(workspaceId, userId, { status });
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

formsRouter.get(
  "/:workspaceId/submissions/:submissionId",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, submissionId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const sub = await formsService.getFormSubmission(workspaceId, userId, submissionId);
      res.json(sub);
    } catch (e) {
      next(e);
    }
  }
);
