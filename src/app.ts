import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorMiddleware } from "./routes/_shared/http";
import { ServiceError } from "./services/_shared/errors";
import analysisRoute from "./routes/analysis";
import auditRoute from "./routes/audit";
import loginRoute from "./routes/auth/login";
import logoutRoute from "./routes/auth/logout";
import meRoute from "./routes/auth/me";
import signupRoute from "./routes/auth/signup";
import casesRoute from "./routes/cases";
import eventsRoute from "./routes/events";
import ingestRoute from "./routes/ingest";
import intelligenceRoute from "./routes/intelligence";
import iocRoute from "./routes/ioc";
import mapRoute from "./routes/map";
import statsRoute from "./routes/stats";
import subjectsRoute from "./routes/subjects";
import tagsRoute from "./routes/tags";
import contactRoute from "./routes/contact";
import telemetryRoute from "./routes/telemetry";
import uploadRoute from "./routes/upload";

export const app = express();

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", env: env.NODE_ENV });
});

app.use("/api/cases", casesRoute);
app.use("/api/subjects", subjectsRoute);
app.use("/api/events", eventsRoute);
app.use("/api/tags", tagsRoute);
app.use("/api/intelligence", intelligenceRoute);
app.use("/api/ioc", iocRoute);
app.use("/api/analysis", analysisRoute);
app.use("/api/map", mapRoute);
app.use("/api/map-data", mapRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/ingest", ingestRoute);
app.use("/api/audit", auditRoute);
app.use("/api/stats", statsRoute);
app.use("/api/contact", contactRoute);
app.use("/api/telemetry", telemetryRoute);
app.use("/auth", signupRoute, loginRoute, logoutRoute, meRoute);
app.use("/api/auth", signupRoute, loginRoute, logoutRoute, meRoute);

const frontendCandidates = [
  path.resolve(process.cwd(), "../frontend"),
  path.resolve(process.cwd(), "frontend"),
  path.resolve(__dirname, "../../frontend"),
  path.resolve(__dirname, "../../../frontend")
];
const frontendRoot = frontendCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "index.html"))
);
if (frontendRoot) {
  const frontendIndex = path.join(frontendRoot, "index.html");
  app.use(express.static(frontendRoot));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/auth/")) {
      next();
      return;
    }
    res.sendFile(frontendIndex);
  });
}

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ServiceError) {
    logger.warn("Handled service error", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    errorMiddleware(error, req, res, next);
    return;
  }

  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode?: number }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : 500;

  const message =
    error instanceof Error ? error.message : "Unexpected server error";

  if (statusCode >= 500) {
    logger.error("Unhandled application error", { message });
  } else {
    logger.warn("Handled application error", { message, statusCode });
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : message
  });
});
