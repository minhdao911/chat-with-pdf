import ChatFile from "@/components/chat-file";
import ChatSideBar from "@/components/chat-sidebar";

export default function ChatPage() {
  return (
    <div className="flex">
      <ChatSideBar />
      <ChatFile />
    </div>
  );
}
