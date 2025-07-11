import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@lib/logger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { file_key, file_name } = body;

    await loadS3IntoPinecone(file_key);
    const newChat = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning();

    return NextResponse.json({ chat: newChat[0] }, { status: 200 });
  } catch (error) {
    logger.error("Error creating chat:", {
      userId,
      error,
    });
    return NextResponse.json({
      error: "internal server error",
      status: 500,
    });
  }
}
