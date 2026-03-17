import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const boolFromString = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return false;
    return value.toLowerCase() === "true";
  });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default("12h"),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  AUTH_COOKIE_NAME: z.string().default("ow_session"),
  AUTH_COOKIE_DOMAIN: z.string().optional(),
  AUTH_COOKIE_SECURE: boolFromString
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => i.message).join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

const nodeEnv = parsed.data.NODE_ENV;
const jwtSecret = parsed.data.JWT_SECRET ?? "";
if (nodeEnv === "production" && jwtSecret.length < 32) {
  throw new Error("Invalid environment configuration: JWT_SECRET must be at least 32 chars in production");
}

export const env = {
  ...parsed.data,
  JWT_SECRET: jwtSecret.length >= 32 ? jwtSecret : "development-only-fallback-secret-change-me-1234",
  corsAllowedOrigins: parsed.data.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: nodeEnv === "production"
};
