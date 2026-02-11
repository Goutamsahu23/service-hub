import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import * as inboxService from "../services/inboxService.js";
import type { AuthRequest } from "../types/index.js";

export const inboxRouter = Router();

inboxRouter.use(authMiddleware);

inboxRouter.get(
  "/:workspaceId/conversations",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const list = await inboxService.listConversations(workspaceId, userId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

inboxRouter.get(
  "/:workspaceId/conversations/:conversationId",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, conversationId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const conv = await inboxService.getConversation(workspaceId, userId, conversationId);
      res.json(conv);
    } catch (e) {
      next(e);
    }
  }
);

inboxRouter.patch(
  "/:workspaceId/conversations/:conversationId/read",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, conversationId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      await inboxService.markConversationRead(workspaceId, userId, conversationId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

inboxRouter.get(
  "/:workspaceId/conversations/:conversationId/messages",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, conversationId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const messages = await inboxService.getMessages(workspaceId, userId, conversationId);
      res.json(messages);
    } catch (e) {
      next(e);
    }
  }
);

inboxRouter.post(
  "/:workspaceId/conversations/:conversationId/reply",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, conversationId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const message = await inboxService.sendReply(workspaceId, userId, conversationId, req.body);
      res.status(201).json(message);
    } catch (e) {
      next(e);
    }
  }
);
