import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import { requireRole } from "../middleware/auth.js";
import * as workspaceService from "../services/workspaceService.js";
import type { AuthRequest } from "../types/index.js";

export const workspaceRouter = Router();

workspaceRouter.use(authMiddleware);

workspaceRouter.get(
  "/:workspaceId",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const workspace = await workspaceService.getWorkspace(workspaceId, userId);
      res.json(workspace);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.patch(
  "/:workspaceId",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const workspace = await workspaceService.updateWorkspace(workspaceId, userId, req.body);
      res.json(workspace);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.get(
  "/:workspaceId/onboarding",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const status = await workspaceService.getOnboardingStatus(workspaceId, userId);
      res.json(status);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.post(
  "/:workspaceId/integrations/email",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const workspace = await workspaceService.setEmailIntegration(workspaceId, userId, req.body);
      res.json(workspace);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.post(
  "/:workspaceId/integrations/sms",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const workspace = await workspaceService.setSmsIntegration(workspaceId, userId, req.body);
      res.json(workspace);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.put(
  "/:workspaceId/contact-form",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const form = await workspaceService.createOrUpdateContactForm(workspaceId, userId, req.body);
      res.json(form);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.post(
  "/:workspaceId/activate",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const workspace = await workspaceService.activateWorkspace(workspaceId, userId);
      res.json(workspace);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.get(
  "/:workspaceId/staff",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const staff = await workspaceService.listStaff(workspaceId, userId);
      res.json(staff);
    } catch (e) {
      next(e);
    }
  }
);

workspaceRouter.post(
  "/:workspaceId/staff",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const staff = await workspaceService.addStaff(workspaceId, userId, req.body);
      res.status(201).json(staff);
    } catch (e) {
      next(e);
    }
  }
);
