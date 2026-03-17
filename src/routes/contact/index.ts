import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { contactSchema, parseBody } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { parseNum, route, sendOk } from "../_shared/http";

const router = Router();

router.get("/", route(async (req, res) => {
  const page = parseNum(req.query.page, 1);
  const pageSize = Math.min(100, parseNum(req.query.pageSize, 25));
  const skip = (page - 1) * pageSize;
  const where = req.query.status ? { status: req.query.status as string } : undefined;
  const [items, total] = await Promise.all([
    prisma.contactSubmission.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
    prisma.contactSubmission.count({ where })
  ]);
  sendOk(res, { items, total, page, pageSize });
}));

router.post("/", route(async (req, res) => {
  const parsed = parseBody(contactSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  const created = await prisma.contactSubmission.create({ data: parsed.data });
  sendOk(res, created, 201);
}));

router.patch("/:id/status", route(async (req, res) => {
  if (!req.body?.status) throw badRequest("status is required");
  const updated = await prisma.contactSubmission.update({
    where: { id: req.params.id },
    data: { status: String(req.body.status) }
  });
  sendOk(res, updated);
}));

export default router;

