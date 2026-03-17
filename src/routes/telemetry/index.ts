import { Router } from "express";
import { AuditService } from "../../services";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";

const router = Router();

router.post("/", route(async (req, res) => {
  if (!req.body?.event) throw badRequest("event is required");
  await AuditService.createAuditEntry({
    userId: req.headers["x-user-id"] as string | undefined,
    userEmail: req.headers["x-user-email"] as string | undefined,
    action: `telemetry.${req.body.event}`,
    entity: "telemetry",
    entityId: req.body.sessionId ? String(req.body.sessionId) : undefined,
    metadata: {
      path: req.body.path,
      userAgent: req.headers["user-agent"],
      payload: req.body.payload ?? null
    }
  });
  sendOk(res, { tracked: true }, 201);
}));

export default router;

