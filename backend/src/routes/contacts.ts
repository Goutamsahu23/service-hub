import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import * as contactsService from "../services/contactsService.js";
import type { AuthRequest } from "../types/index.js";

export const contactsRouter = Router();

contactsRouter.use(authMiddleware);

contactsRouter.get(
  "/:workspaceId/contacts",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const list = await contactsService.listContacts(workspaceId, userId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

contactsRouter.get(
  "/:workspaceId/contacts/:contactId",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, contactId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const contact = await contactsService.getContact(workspaceId, userId, contactId);
      res.json(contact);
    } catch (e) {
      next(e);
    }
  }
);
