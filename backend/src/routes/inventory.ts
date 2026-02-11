import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import { requireRole } from "../middleware/auth.js";
import * as inventoryService from "../services/inventoryService.js";
import type { AuthRequest } from "../types/index.js";

export const inventoryRouter = Router();

inventoryRouter.use(authMiddleware);

inventoryRouter.get(
  "/:workspaceId/items",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const list = await inventoryService.listInventory(workspaceId, userId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

inventoryRouter.post(
  "/:workspaceId/items",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const created = await inventoryService.createInventoryItem(workspaceId, userId, req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

inventoryRouter.patch(
  "/:workspaceId/items/:itemId",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, itemId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const updated = await inventoryService.updateInventoryItem(workspaceId, userId, itemId, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);
