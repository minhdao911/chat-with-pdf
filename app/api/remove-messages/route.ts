import { db } from "@/lib/db";
import { chats, messages, sources } from "@/lib/db/schema";
import { deleteVectors } from "@lib/pinecone";
import { removeFileFromS3 } from "@lib/s3";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId, fileKey } = await req.json();
  try {
    await removeFileFromS3(fileKey);
    await deleteVectors(fileKey);
    await db.delete(sources).where(eq(sources.chatId, chatId));
    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));
    return NextResponse.json({ chatId });
  } catch (err) {
    console.error(err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
