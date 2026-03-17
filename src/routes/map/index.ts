import { Router } from "express";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";
import { MapService } from "../../services";

const router = Router();

router.get("/points", route(async (req, res) => {
  const caseId = req.query.caseId as string | undefined;
  if (!caseId) throw badRequest("caseId query param required");
  sendOk(res, await MapService.getCaseMapPoints(caseId));
}));

router.get("/heatmap", route(async (req, res) => {
  const caseId = req.query.caseId as string | undefined;
  if (!caseId) throw badRequest("caseId query param required");
  sendOk(res, await MapService.getHeatmap(caseId));
}));

export default router;

