import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { registerOwner, login as loginService, getMe } from "../services/authService.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, fullName, workspaceName, address, timezone } = req.body;
    if (!email || !password || !workspaceName) {
      return res.status(400).json({ error: "email, password, and workspaceName required" });
    }
    const result = await registerOwner({
      email,
      password,
      fullName,
      workspaceName,
      address,
      timezone,
    });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const result = await loginService({ email, password });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const payload = (req as import("../types/index.js").AuthRequest).user!;
    const result = await getMe(payload.userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
