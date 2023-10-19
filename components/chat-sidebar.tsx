"use client";

import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { SafeChat } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";

interface ChatSideBarProps {
  chats: SafeChat[];
  currentChatId: string;
}

const ChatSideBar = ({ chats, currentChatId }: ChatSideBarProps) => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="w-64 h-screen bg-purple-custom-50 px-3 py-5 flex flex-col justify-between">
      <div>
        <NewChatButton onClick={() => router.push("/chat")} />
        <div className="w-full mt-3 flex flex-col gap-1">
          {chats.map((chat) => {
            const selected = chat.id === currentChatId;
            return (
              <li
                key={chat.id}
                className={`flex justify-start items-center p-3 rounded-md truncate cursor-pointer hover:bg-purple-custom-200 hover:text-gray-800 ${
                  selected
                    ? "bg-purple-custom-200 text-gray-800"
                    : "text-gray-700"
                }`}
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                <MessageSquare size={20} className="mr-2" />
                {chat.pdfName}
              </li>
            );
          })}
        </div>
      </div>
      <div className="border-t-2 border-gray-200 pt-5">
        <div className="flex items-center gap-2">
          <UserButton />
          <p className="text-gray-900">{user?.fullName}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;

interface NewChatButtonProps {
  onClick: (evt: MouseEvent) => void;
}

const NewChatButton = ({ onClick }: NewChatButtonProps) => {
  return (
    <Button
      variant="secondary"
      className="w-full bg-white text-gray-600 shadow"
      onClick={onClick}
    >
      <PlusCircle size={20} className="mr-1.5" />
      New Chat
    </Button>
  );
};
