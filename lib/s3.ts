import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { logger } from "./logger";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File) {
  const fileKey =
    "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    logger.debug("Success uploading file to s3", fileKey);

    return Promise.resolve({ file_key: fileKey, file_name: file.name });
  } catch (error) {
    logger.error("Error uploading file to s3:", {
      fileKey,
      error,
    });
  }
}

export async function removeFileFromS3(fileKey: string) {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    logger.debug("Success removing s3 file", fileKey);
  } catch (error) {
    logger.error("Error removing s3 file:", {
      fileKey,
      error,
    });
    throw error;
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_BUCKET_REGION}.amazonaws.com/${file_key}`;
  return url;
}
