import { Router } from "express";
import { iocExtractSchema, parseBody } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { parseNum, route, sendOk } from "../_shared/http";
import { IOCService } from "../../services";

const router = Router();

router.get("/", route(async (req, res) => {
  sendOk(res, await IOCService.listIocs({
    caseId: req.query.caseId as string | undefined,
    type: req.query.type as string | undefined,
    search: req.query.search as string | undefined,
    page: parseNum(req.query.page, 1),
    pageSize: parseNum(req.query.pageSize, 25)
  }));
}));

router.post("/", route(async (req, res) => {
  if (!req.body?.caseId || !req.body?.type || !req.body?.value) {
    throw badRequest("caseId, type, and value are required");
  }
  sendOk(res, await IOCService.createIoc(req.body), 201);
}));

router.post("/extract", route(async (req, res) => {
  const parsed = parseBody(iocExtractSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await IOCService.extractIocsFromReport(parsed.data.reportId, parsed.data.caseId));
}));

router.delete("/:id", route(async (req, res) => {
  sendOk(res, await IOCService.deleteIoc(req.params.id));
}));

export default router;

