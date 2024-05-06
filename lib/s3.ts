import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3({
  params: {
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  },
  region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
});

export async function uploadToS3(file: File) {
  try {
    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };

    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        console.log(
          "uploading to s3...",
          parseInt(((evt.loaded * 100) / evt.total).toString()) + "%"
        );
      })
      .promise();

    await upload.then((data) => {
      console.log("success uploading file to s3", file_key);
    });

    return Promise.resolve({ file_key, file_name: file.name });
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
    const res = s3.deleteObject(params).promise();
    await res.then(() => {
      console.log("success removing s3 file");
    });
    return Promise.resolve();
  } catch (error) {
    console.error("error removing s3 file", error);
    throw error;
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_BUCKET_REGION}.amazonaws.com/${file_key}`;
  return url;
}
