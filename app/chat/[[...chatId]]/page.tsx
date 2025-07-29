import ChatFile from "@/components/chat-file";
import ChatInterface from "@/components/chat-interface";
import PdfViewer from "@/components/pdf-viewer";
import { getChat } from "./_actions/chat";

interface ChatPageProps {
  params: {
    chatId: string[];
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  const currentChat = chatId?.[0] ? await getChat(chatId[0]) : null;

  return (
    <>
      {currentChat ? (
        <>
          <PdfViewer pdfUrl={currentChat.pdfUrl} />
          <ChatInterface currentChat={currentChat} />
        </>
      ) : (
        <ChatFile />
      )}
    </>
  );
}
