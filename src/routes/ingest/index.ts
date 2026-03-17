import { Router } from "express";
import { ingestSchema, parseBody } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";
import { IngestService } from "../../services";

const router = Router();

router.post("/pdf", route(async (req, res) => {
  const parsed = parseBody(ingestSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await IngestService.ingestFromPdf(parsed.data), 201);
}));

router.post("/events", route(async (req, res) => {
  if (!req.body?.caseId || !req.body?.source || !Array.isArray(req.body?.events)) {
    throw badRequest("caseId, source and events[] are required");
  }
  sendOk(res, await IngestService.ingestEvents(req.body.caseId, req.body.source, req.body.events), 201);
}));

export default router;

