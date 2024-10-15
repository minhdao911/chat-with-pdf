import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function downloadFromS3(fileKey: string) {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    };

    const fileName = `/tmp/pdf-${Date.now()}.pdf`;
    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);
    const stream = data.Body as Readable;

    if (!stream) throw new Error("Cannot get file stream");

    const buffer = await getStreamBuffer(stream);
    fs.writeFileSync(fileName, buffer);

    return fileName;
  } catch (err) {
    console.error(err);
    return null;
  }
}

const getStreamBuffer = (stream: Readable) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.once("end", () => resolve(Buffer.concat(chunks)));
    stream.once("error", reject);
  });
