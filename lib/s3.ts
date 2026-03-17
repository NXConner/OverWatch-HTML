import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3 = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  const key = isPublic
    ? `${folderPrefix}public/uploads/${Date.now()}-${fileName}`
    : `${folderPrefix}uploads/${Date.now()}-${fileName}`;
  const cmd = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ...(isPublic ? { ContentDisposition: 'attachment' } : {}),
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path: key };
}

export async function getFileUrl(cloud_storage_path: string, isPublic: boolean) {
  if (isPublic) {
    const region = process.env.AWS_REGION ?? 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
  }
  const cmd = new GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ResponseContentDisposition: 'attachment' });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

export async function deleteFile(cloud_storage_path: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }));
}

export async function initiateMultipartUpload(fileName: string, isPublic: boolean) {
  const key = isPublic
    ? `${folderPrefix}public/uploads/${Date.now()}-${fileName}`
    : `${folderPrefix}uploads/${Date.now()}-${fileName}`;
  const cmd = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: key,
    ...(isPublic ? { ContentDisposition: 'attachment' } : {}),
  });
  const res = await s3.send(cmd);
  return { uploadId: res.UploadId ?? '', cloud_storage_path: key };
}

export async function getPresignedUrlForPart(cloud_storage_path: string, uploadId: string, partNumber: number) {
  const cmd = new UploadPartCommand({ Bucket: bucketName, Key: cloud_storage_path, UploadId: uploadId, PartNumber: partNumber });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

export async function completeMultipartUpload(cloud_storage_path: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
  const cmd = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  await s3.send(cmd);
}
