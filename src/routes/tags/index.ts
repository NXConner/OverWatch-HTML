import { Router } from "express";
import { parseBody, tagSchema } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { route, sendOk } from "../_shared/http";
import { TagsService } from "../../services";

const router = Router();

router.get("/", route(async (_req, res) => {
  sendOk(res, await TagsService.listTags());
}));

router.get("/:id", route(async (req, res) => {
  sendOk(res, await TagsService.getTagById(req.params.id));
}));

router.post("/", route(async (req, res) => {
  const parsed = parseBody(tagSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await TagsService.createTag(parsed.data), 201);
}));

router.patch("/:id", route(async (req, res) => {
  sendOk(res, await TagsService.updateTag(req.params.id, req.body));
}));

router.delete("/:id", route(async (req, res) => {
  sendOk(res, await TagsService.deleteTag(req.params.id));
}));

export default router;

