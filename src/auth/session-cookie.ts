import type { CookieOptions, Response } from "express";
import { env } from "../config/env";

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction || env.AUTH_COOKIE_SECURE,
    domain: env.AUTH_COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: 12 * 60 * 60 * 1000
  };
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(env.AUTH_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(env.AUTH_COOKIE_NAME, {
    ...getSessionCookieOptions(),
    maxAge: undefined
  });
}
