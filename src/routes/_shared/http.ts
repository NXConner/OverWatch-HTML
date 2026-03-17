import type { NextFunction, Request, Response } from "express";
import { ServiceError } from "../../services/_shared/errors";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function route(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function sendOk(res: Response, data: unknown, status = 200) {
  res.status(status).json({ ok: true, data });
}

export function parseNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ServiceError) {
    res.status(error.statusCode).json({
      ok: false,
      error: { code: error.code, message: error.message, details: error.details }
    });
    return;
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message } });
}

