import { Router } from "express";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";
import { StatsService } from "../../services";

const router = Router();

router.get("/dashboard", route(async (_req, res) => {
  sendOk(res, await StatsService.getDashboardStats());
}));

router.get("/case/:caseId", route(async (req, res) => {
  sendOk(res, await StatsService.getCaseStats(req.params.caseId));
}));

router.get("/case", route(async (req, res) => {
  const caseId = req.query.caseId as string | undefined;
  if (!caseId) throw badRequest("caseId query param required");
  sendOk(res, await StatsService.getCaseStats(caseId));
}));

export default router;

