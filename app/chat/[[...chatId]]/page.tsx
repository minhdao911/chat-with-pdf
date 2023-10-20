import ChatFile from "@/components/chat-file";
import ChatInterface from "@/components/chat-interface";
import ChatSideBar from "@/components/chat-sidebar";
import PdfViewer from "@/components/pdf-viewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
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
    await db.select().from(chats).where(eq(chats.userId, userId))
  ).map((d) => ({ ...d, createdAt: d.createdAt.toUTCString() }));
  const currentChat = chatId
    ? _chats.find((chat) => chat.id === chatId[0])
    : null;

  return (
    <div className="flex">
      <ChatSideBar chats={_chats} currentChatId={chatId ? chatId[0] : ""} />
      {currentChat ? (
        <>
          <PdfViewer pdfUrl={currentChat.pdfUrl} />
          <div className="w-1.5 bg-gray-200 dark:bg-gray-800" />
          <ChatInterface currentChat={currentChat} />
        </>
      ) : (
        <ChatFile />
      )}
    </div>
  );
}
