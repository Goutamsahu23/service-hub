import type { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";
  const code = err instanceof AppError ? err.code : undefined;
  if (config.isProduction) {
    console.error(err.name, err.message);
  } else {
    console.error(err);
  }
  res.status(status).json({ error: message, code });
}
