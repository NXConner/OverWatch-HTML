import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtClaims } from "../types/auth";

export class AuthTokenError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthTokenError";
    this.statusCode = statusCode;
  }
}

export function signAuthToken(payload: Omit<JwtClaims, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export function verifyAuthToken(token: string): JwtClaims {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string") {
      throw new AuthTokenError("Invalid token payload");
    }

    if (!decoded.sub || !decoded.email || !decoded.role || !decoded.sessionId) {
      throw new AuthTokenError("Token payload missing required fields");
    }

    if (decoded.role !== "admin" && decoded.role !== "operator") {
      throw new AuthTokenError("Invalid token role");
    }

    return decoded as JwtClaims;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AuthTokenError("Token expired");
    }
    if (error instanceof JsonWebTokenError) {
      throw new AuthTokenError("Invalid token");
    }
    if (error instanceof AuthTokenError) {
      throw error;
    }
    throw new AuthTokenError("Unable to verify token");
  }
}
