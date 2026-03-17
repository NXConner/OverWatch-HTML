import type { NextFunction, Request, Response } from "express";
import type { AuthRole } from "../types/auth";

export function roleRequired(roles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.auth?.role;
    if (!role) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
}
