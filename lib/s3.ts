import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File) {
  try {
    const fileKey =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("success uploading file to s3", fileKey);

    return Promise.resolve({ file_key: fileKey, file_name: file.name });
  } catch (error) {
    console.error("error uploading file to s3", error);
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
    console.log("success removing s3 file", fileKey);
  } catch (error) {
    console.error("error removing s3 file", error);
    throw error;
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_BUCKET_REGION}.amazonaws.com/${file_key}`;
  return url;
}
