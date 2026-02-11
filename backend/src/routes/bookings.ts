import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { workspaceGuard } from "../middleware/workspaceGuard.js";
import { requireRole } from "../middleware/auth.js";
import * as bookingsService from "../services/bookingsService.js";
import type { AuthRequest } from "../types/index.js";

export const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

bookingsRouter.get(
  "/:workspaceId/booking-types",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const list = await bookingsService.listBookingTypes(workspaceId, userId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

bookingsRouter.post(
  "/:workspaceId/booking-types",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const created = await bookingsService.createBookingType(workspaceId, userId, req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

bookingsRouter.get(
  "/:workspaceId/availability",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const bookingTypeId = req.query.bookingTypeId as string | undefined;
      const list = await bookingsService.listAvailability(workspaceId, bookingTypeId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

bookingsRouter.put(
  "/:workspaceId/availability",
  workspaceGuard,
  requireRole("owner"),
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const list = await bookingsService.setAvailability(workspaceId, userId, req.body);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

bookingsRouter.get(
  "/:workspaceId/bookings",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const status = req.query.status as string | undefined;
      const list = await bookingsService.listBookings(workspaceId, userId, { from, to, status });
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

bookingsRouter.patch(
  "/:workspaceId/bookings/:bookingId/status",
  workspaceGuard,
  async (req, res, next) => {
    try {
      const { workspaceId, bookingId } = req.params;
      const userId = (req as AuthRequest).user!.userId;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: "status required" });
      const updated = await bookingsService.updateBookingStatus(workspaceId, userId, bookingId, status);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);
