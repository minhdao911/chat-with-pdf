import ChatFile from "@/components/chat-file";
import ChatInterface from "@/components/chat-interface";
import ChatSideBar from "@/components/chat-sidebar";
import PdfViewer from "@/components/pdf-viewer";
import { checkAdmin, checkSubscription } from "@lib/account";
import { getChats, getCurrentChat } from "./_actions/chat";

interface ChatPageProps {
  params: {
    chatId: string[];
  };
}

export default async function ChatPage({ params: { chatId } }: ChatPageProps) {
  const { chats, messages } = await getChats();
  const currentChat = chatId ? getCurrentChat(chats, chatId[0]) : null;

  const hasValidSubscription = await checkSubscription();
  const isAdmin = await checkAdmin();
  const isUsageRestricted = !hasValidSubscription && !isAdmin;

  return (
    <div className="flex">
      <ChatSideBar
        chats={chats}
        currentChatId={currentChat?.id}
        isUsageRestricted={isUsageRestricted}
        messageCount={messages.length}
      />
      {currentChat ? (
        <>
          <PdfViewer pdfUrl={currentChat.pdfUrl} />
          <ChatInterface
            isUsageRestricted={isUsageRestricted}
            currentChat={currentChat}
            messageCount={messages.length}
          />
        </>
      ) : (
        <ChatFile
          chatCount={chats.length}
          isUsageRestricted={isUsageRestricted}
        />
      )}
    </div>
  );
}
