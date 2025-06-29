import ChatFile from "@/components/chat-file";
import ChatInterface from "@/components/chat-interface";
import ChatSideBar from "@/components/chat-sidebar";
import PdfViewer from "@/components/pdf-viewer";
import {
  getUserMetadata,
  checkSubscription,
  getUserSettings,
  ensureUserExists,
} from "@lib/account";
import { getChats, getCurrentChat } from "./_actions/chat";

interface ChatPageProps {
  params: {
    chatId: string[];
  };
}

export default async function ChatPage({ params: { chatId } }: ChatPageProps) {
  // Ensure user exists in database after login
  await ensureUserExists();

  const { chats, messages } = await getChats();
  const currentChat = chatId ? getCurrentChat(chats, chatId[0]) : null;

  const hasValidSubscription = await checkSubscription();
  const userMetadata = await getUserMetadata();
  const userSettings = await getUserSettings();
  const isAdmin = userMetadata?.role === "admin";
  const isUsageRestricted = !hasValidSubscription && !isAdmin;

  return (
    <div className="flex">
      <ChatSideBar
        chats={chats}
        currentChatId={currentChat?.id}
        isUsageRestricted={isUsageRestricted}
        messageCount={userSettings?.messageCount || messages.length}
      />
      {currentChat ? (
        <>
          <PdfViewer pdfUrl={currentChat.pdfUrl} />
          <ChatInterface
            isUsageRestricted={isUsageRestricted}
            currentChat={currentChat}
            messageCount={userSettings?.messageCount || messages.length}
            isAdmin={isAdmin}
          />
        </>
      ) : (
        <ChatFile
          chatCount={userSettings?.freeChats || chats.length}
          isUsageRestricted={isUsageRestricted}
        />
      )}
    </div>
  );
}
