import { Router } from "express";
import casesRoutes from "./cases";
import subjectsRoutes from "./subjects";
import eventsRoutes from "./events";
import tagsRoutes from "./tags";
import intelligenceRoutes from "./intelligence";
import iocRoutes from "./ioc";
import analysisRoutes from "./analysis";
import mapRoutes from "./map";
import uploadRoutes from "./upload";
import ingestRoutes from "./ingest";
import auditRoutes from "./audit";
import statsRoutes from "./stats";
import contactRoutes from "./contact";
import telemetryRoutes from "./telemetry";
import { errorMiddleware } from "./_shared/http";

export function createApiRouter() {
  const router = Router();
  router.use("/cases", casesRoutes);
  router.use("/subjects", subjectsRoutes);
  router.use("/events", eventsRoutes);
  router.use("/tags", tagsRoutes);
  router.use("/intelligence", intelligenceRoutes);
  router.use("/ioc", iocRoutes);
  router.use("/analysis", analysisRoutes);
  router.use("/map", mapRoutes);
  router.use("/upload", uploadRoutes);
  router.use("/ingest", ingestRoutes);
  router.use("/audit", auditRoutes);
  router.use("/stats", statsRoutes);
  router.use("/contact", contactRoutes);
  router.use("/telemetry", telemetryRoutes);
  router.use(errorMiddleware);
  return router;
}

