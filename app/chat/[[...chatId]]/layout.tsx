import ChatSideBar from "@components/chat-sidebar";
import { Loader2 } from "lucide-react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <ChatSideBar />
      {children}
    </div>
  );
}
