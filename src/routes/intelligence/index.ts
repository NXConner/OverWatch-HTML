import { Router } from "express";
import { intelligenceSchema, parseBody, saveReportSchema } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";
import { IntelligenceService } from "../../services";

const router = Router();

router.get("/", route(async (req, res) => {
  const caseId = req.query.caseId as string | undefined;
  if (!caseId) throw badRequest("caseId query param required");
  sendOk(res, await IntelligenceService.listIntelligenceReports(caseId));
}));

router.post("/generate", route(async (req, res) => {
  const parsed = parseBody(intelligenceSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(
    res,
    await IntelligenceService.generateIntelligenceReport({
      ...parsed.data,
      userId: req.headers["x-user-id"] as string | undefined,
      userEmail: req.headers["x-user-email"] as string | undefined
    }),
    201
  );
}));

router.post("/", route(async (req, res) => {
  const parsed = parseBody(saveReportSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(
    res,
    await IntelligenceService.saveIntelligenceReport({
      ...parsed.data,
      userId: req.headers["x-user-id"] as string | undefined,
      userEmail: req.headers["x-user-email"] as string | undefined
    }),
    201
  );
}));

export default router;

