import type { Request } from "express";

export type AuthRole = "admin" | "operator";

export interface JwtClaims {
  sub: string;
  email: string;
  role: AuthRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: AuthRole;
  sessionId: string;
  token: string;
}

export interface RequestWithAuth extends Request {
  auth?: AuthContext;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
