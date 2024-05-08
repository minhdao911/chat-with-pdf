import { db } from "@/lib/db";
import { messages as _messages } from "@/lib/db/schema";
import { callChain } from "@/lib/langchain";
import { Message } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

export async function POST(req: Request) {
  try {
    const { messages, fileKey, chatId } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    const formattedMessages = messages.map(formatMessage);
    const chatHistory = formattedMessages.join("\n");

    const streamingtextResponse = await callChain({
      question: lastMessage,
      chatHistory,
      fileKey,
      streamCallbacks: {
        onStart: async () => {
          // save user message into db
          await db.insert(_messages).values({
            chatId,
            content: lastMessage,
            role: "user",
          });
        },
        onCompletion: async (completion) => {
          // save ai message into db
          await db.insert(_messages).values({
            chatId,
            content: completion,
            role: "system",
          });
        },
      },
    });

    // Return a StreamingTextResponse, which can be consumed by the client
    return streamingtextResponse;
  } catch (err) {
    console.error("error generating reply");
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
