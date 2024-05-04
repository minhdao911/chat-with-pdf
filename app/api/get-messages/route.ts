import { db } from "@/lib/db";
import { messages, sources } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();

  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));

  let _sources = await Promise.all(
    _messages.map(async (message) => {
      return await db
        .select()
        .from(sources)
        .where(eq(sources.messageId, message.id))
        .orderBy(asc(sources.pageNumber));
    })
  );
  _sources = _sources.filter((s) => s.length > 0);

  return NextResponse.json({ messages: _messages, sources: _sources });
}
