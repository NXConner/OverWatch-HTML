import { Router } from "express";
import { parseBody, presignedUploadSchema, uploadCompleteSchema } from "../../../lib/validators";
import { badRequest } from "../../services/_shared/errors";
import { parseBool, route, sendOk } from "../_shared/http";
import { UploadService } from "../../services";

const router = Router();

router.post("/presign", route(async (req, res) => {
  const parsed = parseBody(presignedUploadSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await UploadService.createUploadUrl(parsed.data), 201);
}));

router.post("/complete", route(async (req, res) => {
  const parsed = parseBody(uploadCompleteSchema, req.body);
  if (!parsed.success) throw badRequest(parsed.error);
  sendOk(res, await UploadService.completeUpload(parsed.data), 201);
}));

router.get("/download-url", route(async (req, res) => {
  const path = req.query.cloud_storage_path as string | undefined;
  if (!path) throw badRequest("cloud_storage_path query param required");
  sendOk(res, await UploadService.getDownloadUrl(path, parseBool(req.query.isPublic)));
}));

router.delete("/", route(async (req, res) => {
  const path = req.query.cloud_storage_path as string | undefined;
  if (!path) throw badRequest("cloud_storage_path query param required");
  sendOk(res, await UploadService.removeUploadedFile(path));
}));

export default router;

