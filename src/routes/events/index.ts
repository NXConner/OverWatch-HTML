import { Router } from "express";
import { badRequest } from "../../services/_shared/errors";
import { parseNum, route, sendOk } from "../_shared/http";
import { EventsService } from "../../services";

const router = Router();

router.get("/", route(async (req, res) => {
  sendOk(res, await EventsService.listEvents({
    caseId: req.query.caseId as string | undefined,
    severity: req.query.severity as string | undefined,
    source: req.query.source as string | undefined,
    eventType: req.query.eventType as string | undefined,
    search: req.query.search as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    page: parseNum(req.query.page, 1),
    pageSize: parseNum(req.query.pageSize, 25)
  }));
}));

router.get("/:id", route(async (req, res) => {
  sendOk(res, await EventsService.getEventById(req.params.id));
}));

router.post("/", route(async (req, res) => {
  if (!req.body?.caseId || !req.body?.eventType || !req.body?.source) {
    throw badRequest("caseId, eventType, and source are required");
  }
  sendOk(res, await EventsService.createEvent(req.body), 201);
}));

router.patch("/:id", route(async (req, res) => {
  sendOk(res, await EventsService.updateEvent(req.params.id, req.body));
}));

router.delete("/:id", route(async (req, res) => {
  sendOk(res, await EventsService.deleteEvent(req.params.id));
}));

router.post("/:id/tags/:tagId", route(async (req, res) => {
  sendOk(res, await EventsService.attachEventTag(req.params.id, req.params.tagId), 201);
}));

router.delete("/:id/tags/:tagId", route(async (req, res) => {
  sendOk(res, await EventsService.detachEventTag(req.params.id, req.params.tagId));
}));

export default router;

