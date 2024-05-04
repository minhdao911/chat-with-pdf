import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { deleteVectors } from "@lib/pinecone";
import { removeFileFromS3 } from "@lib/s3";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId, fileKey } = await req.json();
  try {
    await removeFileFromS3(fileKey);
    await deleteVectors(fileKey);
    await db.delete(messages).where(eq(messages.chatId, chatId));
    return NextResponse.json({ chatId });
  } catch (err) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
