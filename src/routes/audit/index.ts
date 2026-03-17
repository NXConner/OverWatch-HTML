import { Router } from "express";
import { badRequest } from "../../services/_shared/errors";
import { parseNum, route, sendOk } from "../_shared/http";
import { AuditService } from "../../services";

const router = Router();

router.get("/", route(async (req, res) => {
  sendOk(res, await AuditService.listAuditEntries({
    userId: req.query.userId as string | undefined,
    entity: req.query.entity as string | undefined,
    action: req.query.action as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    page: parseNum(req.query.page, 1),
    pageSize: parseNum(req.query.pageSize, 25)
  }));
}));

router.post("/", route(async (req, res) => {
  if (!req.body?.action || !req.body?.entity) throw badRequest("action and entity are required");
  sendOk(res, await AuditService.createAuditEntry(req.body), 201);
}));

export default router;

