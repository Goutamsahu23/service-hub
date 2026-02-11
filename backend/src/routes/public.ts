import { Router } from "express";
import * as publicService from "../services/publicService.js";
import * as formsService from "../services/formsService.js";

export const publicRouter = Router();

publicRouter.get("/contact-form/:workspaceId", async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const form = await publicService.getPublicContactForm(workspaceId);
    res.json(form);
  } catch (e) {
    next(e);
  }
});

publicRouter.post("/contact-form/:workspaceId/submit", async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const result = await publicService.submitContactForm(workspaceId, req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/booking/:workspaceId", async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const page = await publicService.getPublicBookingPage(workspaceId);
    res.json(page);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/booking/:workspaceId/slots", async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { bookingTypeId, date } = req.query;
    if (!bookingTypeId || !date) {
      return res.status(400).json({ error: "bookingTypeId and date required" });
    }
    const { getAvailableSlots } = await import("../services/bookingsService.js");
    const slots = await getAvailableSlots(workspaceId, bookingTypeId as string, date as string);
    res.json({ slots });
  } catch (e) {
    next(e);
  }
});

publicRouter.post("/booking/:workspaceId", async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const result = await publicService.createBookingPublic(workspaceId, req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/form/:submissionId", async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const form = await formsService.getFormForSubmission(submissionId);
    res.json({ id: form.id, name: form.name, fields: form.fields, status: form.status });
  } catch (e) {
    next(e);
  }
});

publicRouter.post("/form/:submissionId/submit", async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const result = await formsService.submitFormPublic(submissionId, req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
