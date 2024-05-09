import { db } from "@/lib/db";
import { messages, sources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();

  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));

  let _sources = await db
    .select()
    .from(sources)
    .where(eq(sources.chatId, chatId));

  return NextResponse.json({
    messages: _messages,
    sources: _sources,
  });
}
