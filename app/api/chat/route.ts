import { db } from "@/lib/db";
import { messages as _messages, sources as _sources } from "@/lib/db/schema";
import { retrieval } from "@/lib/langchain";
import { Message } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const formatMessages = (messages: Message[]) => {
  const formattedMessages = messages.map(
    (message) =>
      `${message.role === "user" ? "Human" : "Assistant"}: ${message.content}`
  );
  return formattedMessages.join("/n");
};

export async function POST(req: Request) {
  try {
    const { messages, fileKey, chatId } = await req.json();
    const currentMessageContent = messages[messages.length - 1].content;
    const previousMessages = messages.slice(0, -1);
    const chatHistory = formatMessages(previousMessages);

    // save user message into db
    await db.insert(_messages).values({
      chatId,
      content: currentMessageContent,
      role: "user",
    });

    let count = 0;
    let sources: { content: string; pageNumber: number }[] = [];

    const streamingtextResponse = await retrieval({
      question: currentMessageContent,
      chatHistory,
      previousMessages,
      fileKey,
      streamCallbacks: {
        handleRetrieverEnd: (documents) => {
          sources = documents.map((d) => ({
            content: d.pageContent,
            pageNumber: d.metadata.pageNumber,
          }));
        },
        handleLLMEnd: async (output) => {
          count++;
          if (count == 2) {
            // save ai message into db
            const completion = output.generations[0][0].text;
            const messageId = await db
              .insert(_messages)
              .values({
                chatId,
                content: completion,
                role: "system",
              })
              .returning({
                insertedId: _messages.id,
              });
            if (sources.length > 0) {
              await db.insert(_sources).values({
                messageId: messageId[0].insertedId,
                chatId,
                data: JSON.stringify(sources),
              });
            }
          }
        },
      },
    });

    // Return a StreamingTextResponse, which can be consumed by the client
    return streamingtextResponse;
  } catch (err) {
    console.error("error generating reply", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
