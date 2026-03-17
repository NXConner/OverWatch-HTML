import { Router } from "express";
import { createSubjectSchema, parseBody, updateSubjectSchema } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { parseNum, route, sendOk } from "../_shared/http";
import { SubjectsService } from "../../services";

const router = Router();

router.get("/", route(async (req, res) => {
  sendOk(res, await SubjectsService.listSubjects({
    caseId: req.query.caseId as string | undefined,
    search: req.query.search as string | undefined,
    page: parseNum(req.query.page, 1),
    pageSize: parseNum(req.query.pageSize, 25)
  }));
}));

router.get("/:id", route(async (req, res) => {
  sendOk(res, await SubjectsService.getSubjectById(req.params.id));
}));

router.post("/", route(async (req, res) => {
  const parsed = parseBody(createSubjectSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await SubjectsService.createSubject(parsed.data), 201);
}));

router.patch("/:id", route(async (req, res) => {
  const parsed = parseBody(updateSubjectSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await SubjectsService.updateSubject(req.params.id, parsed.data));
}));

router.delete("/:id", route(async (req, res) => {
  sendOk(res, await SubjectsService.deleteSubject(req.params.id));
}));

router.post("/:id/tags/:tagId", route(async (req, res) => {
  sendOk(res, await SubjectsService.attachSubjectTag(req.params.id, req.params.tagId), 201);
}));

router.delete("/:id/tags/:tagId", route(async (req, res) => {
  sendOk(res, await SubjectsService.detachSubjectTag(req.params.id, req.params.tagId));
}));

export default router;

