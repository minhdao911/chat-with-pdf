import ChatFile from "@/components/chat-file";
import ChatInterface from "@/components/chat-interface";
import ChatSideBar from "@/components/chat-sidebar";
import PdfViewer from "@/components/pdf-viewer";
import { db } from "@/lib/db";
import { SafeChat, chats, messages } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";

interface ChatPageProps {
  params: {
    chatId: string[];
  };
}

export default async function ChatPage({ params: { chatId } }: ChatPageProps) {
  const { userId } = auth();
  const _chats = (
    await db.select().from(chats).where(eq(chats.userId, userId!))
  ).map((d) => ({ ...d, createdAt: d.createdAt.toUTCString() }));
  const currentChat = chatId
    ? _chats.find((chat: SafeChat) => chat.id === chatId[0])
    : null;
  const _messages = _chats.map(async (chat: SafeChat) => {
    await db.select().from(messages).where(eq(messages.chatId, chat.id));
  });
  const hasValidSubscription = await checkSubscription();

  return (
    <div className="flex">
      <ChatSideBar
        chats={_chats}
        currentChatId={chatId ? chatId[0] : ""}
        isPro={hasValidSubscription}
        messageCount={_messages.length}
      />
      {currentChat ? (
        <>
          <PdfViewer pdfUrl={currentChat.pdfUrl} />
          <ChatInterface
            isPro={hasValidSubscription}
            currentChat={currentChat}
            messageCount={_messages.length}
          />
        </>
      ) : (
        <ChatFile chatCount={_chats.length} isPro={hasValidSubscription} />
      )}
    </div>
  );
}
