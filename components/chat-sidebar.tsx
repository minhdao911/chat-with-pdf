"use client";

import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { SafeChat } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import UserSettings from "./user-settings";
import { MouseEventHandler } from "react";

interface ChatSideBarProps {
  chats: SafeChat[];
  currentChatId: string;
  isPro: boolean;
  messageCount: number;
}

const ChatSideBar = ({
  chats,
  isPro,
  currentChatId,
  messageCount,
}: ChatSideBarProps) => {
  const router = useRouter();

  return (
    <div className="w-72 h-screen shrink-0 bg-purple-custom-50 dark:bg-gray-800 px-4 py-5 flex flex-col justify-between">
      <div>
        <NewChatButton onClick={() => router.push("/chat")} />
        <div className="w-full mt-3 flex flex-col gap-1">
          {chats.map((chat) => {
            const selected = chat.id === currentChatId;
            return (
              <li
                key={chat.id}
                className={`flex justify-start items-center p-3 rounded-md cursor-pointer hover:bg-purple-custom-300 hover:text-gray-800 dark:hover:bg-gray-900 dark:hover:text-gray-300 ${
                  selected
                    ? "bg-purple-custom-300 text-gray-800 dark:bg-gray-950 dark:text-gray-300"
                    : "text-gray-700 dark:text-gray-400"
                }`}
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                <MessageSquare size={20} className="shrink-0 mr-2" />
                <p className="truncate">{chat.pdfName}</p>
              </li>
            );
          })}
        </div>
      </div>
      <UserSettings
        isPro={isPro}
        messageCount={messageCount}
        chatCount={chats.length}
      />
    </div>
  );
};

export default ChatSideBar;

interface NewChatButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const NewChatButton = ({ onClick }: NewChatButtonProps) => {
  return (
    <Button
      variant="secondary"
      className="w-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow"
      onClick={onClick}
    >
      <PlusCircle size={20} className="mr-1.5" />
      New Chat
    </Button>
  );
};
