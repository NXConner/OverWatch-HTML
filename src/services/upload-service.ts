import crypto from "node:crypto";
import { prisma } from "../../lib/prisma";
import { deleteFile, generatePresignedUploadUrl, getFileUrl } from "../../lib/s3";
import { mapPrismaError } from "./_shared/errors";

export async function createUploadUrl(input: { fileName: string; contentType?: string; isPublic?: boolean }) {
  return generatePresignedUploadUrl(input.fileName, input.contentType ?? "application/octet-stream", Boolean(input.isPublic));
}

export async function completeUpload(input: { cloud_storage_path: string; caseId: string; fileName?: string }) {
  const fileHash = crypto.createHash("sha256").update(input.cloud_storage_path).digest("hex");
  try {
    return await prisma.ingestedFile.upsert({
      where: { fileHash_caseId: { fileHash, caseId: input.caseId } },
      create: {
        fileName: input.fileName ?? input.cloud_storage_path.split("/").pop() ?? input.cloud_storage_path,
        fileHash,
        caseId: input.caseId,
        source: input.cloud_storage_path
      },
      update: { source: input.cloud_storage_path }
    });
  } catch (error) {
    throw mapPrismaError(error);
  }
}

export async function getDownloadUrl(cloud_storage_path: string, isPublic?: boolean) {
  return { url: await getFileUrl(cloud_storage_path, Boolean(isPublic)) };
}

export async function removeUploadedFile(cloud_storage_path: string) {
  await deleteFile(cloud_storage_path);
  return { deleted: true };
}

