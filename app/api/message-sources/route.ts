import { db } from "@lib/db";
import { messages, sources as _sources } from "@lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sources, chatId } = await req.json();

    console.log("save sources", sources);

    const _messages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt));
    const lastMessage = _messages[_messages.length - 1];

    const messageSources = await db
      .select()
      .from(_sources)
      .where(eq(_sources.messageId, lastMessage.id));

    console.log("messageSources", messageSources);

    if (messageSources.length === 0) {
      sources.forEach(
        async (source: { pageNumber: number; content: string }) => {
          await db.insert(_sources).values({
            pageNumber: source.pageNumber,
            content: source.content,
            messageId: lastMessage.id,
          });
        }
      );
    }
    return NextResponse.json({ messageId: lastMessage.id });
  } catch (err) {
    console.error("error saving sources to db");
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
