import { Router } from "express";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";
import { AnalysisService } from "../../services";

const router = Router();

router.get("/global", route(async (_req, res) => {
  sendOk(res, await AnalysisService.buildGlobalAnalysis());
}));

router.get("/case/:caseId", route(async (req, res) => {
  const analysis = await AnalysisService.buildCaseAnalysis(req.params.caseId);
  if (!analysis) throw badRequest("Case not found");
  sendOk(res, analysis);
}));

export default router;

