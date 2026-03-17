import { Router } from "express";
import { parseBody, createCaseSchema, updateCaseSchema } from "../../../lib/validators";
import { CasesService } from "../../services";
import { badRequest } from "../../services/_shared/errors";
import { parseNum, route, sendOk } from "../_shared/http";

const router = Router();

router.get(
  "/",
  route(async (req, res) => {
    const data = await CasesService.listCases({
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      search: req.query.search as string | undefined,
      page: parseNum(req.query.page, 1),
      pageSize: parseNum(req.query.pageSize, 25)
    });
    sendOk(res, data);
  })
);

router.get(
  "/:id",
  route(async (req, res) => {
    sendOk(res, await CasesService.getCaseById(req.params.id));
  })
);

router.post(
  "/",
  route(async (req, res) => {
    const parsed = parseBody(createCaseSchema, req.body);
    if (!parsed.success) throw badRequest(parsed.error);
    const createdById = (req.headers["x-user-id"] as string | undefined) ?? "system";
    const created = await CasesService.createCase({ ...parsed.data, createdById });
    sendOk(res, created, 201);
  })
);

router.patch(
  "/:id",
  route(async (req, res) => {
    const parsed = parseBody(updateCaseSchema, req.body);
    if (!parsed.success) throw badRequest(parsed.error);
    sendOk(res, await CasesService.updateCase(req.params.id, parsed.data));
  })
);

router.delete(
  "/:id",
  route(async (req, res) => {
    sendOk(res, await CasesService.deleteCase(req.params.id));
  })
);

export default router;

