import { auth } from "@clerk/nextjs/server";
import { db } from "@lib/db";
import { Message, SafeChat, chats, messages } from "@lib/db/schema";
import { eq } from "drizzle-orm";

export const getChats = async (): Promise<{
  chats: SafeChat[];
  messages: Message[];
}> => {
  try {
    const { userId } = auth();
    if (!userId) {
      return { chats: [], messages: [] };
    }
    const _chats = (
      await db.select().from(chats).where(eq(chats.userId, userId))
    ).map((d) => ({ ...d, createdAt: d.createdAt.toUTCString() }));
    const _messages = await Promise.all(
      _chats.map((chat: SafeChat) =>
        db.select().from(messages).where(eq(messages.chatId, chat.id))
      )
    );
    return { chats: _chats, messages: _messages.flat() };
  } catch (error) {
    return { chats: [], messages: [] };
  }
};

export const getCurrentChat = (chats: SafeChat[], chatId: string) => {
  return chatId ? chats.find((chat: SafeChat) => chat.id === chatId) : null;
};
