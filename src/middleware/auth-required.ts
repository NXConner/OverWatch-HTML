import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { verifyAuthToken } from "../auth/jwt";

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  try {
    const cookieToken = req.cookies?.[env.AUTH_COOKIE_NAME];
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const token = cookieToken || bearerToken;

    if (!token || typeof token !== "string") {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const claims = verifyAuthToken(token);
    req.auth = {
      userId: claims.sub,
      email: claims.email,
      role: claims.role,
      sessionId: claims.sessionId,
      token
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
