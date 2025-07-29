import ChatSideBar from "@components/chat-sidebar";

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
