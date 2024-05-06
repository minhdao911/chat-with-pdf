"use client";

import { MessageSquare, PlusCircle, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { SafeChat } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import UserSettings from "./user-settings";
import { MouseEventHandler } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ChatSideBarProps {
  chats: SafeChat[];
  currentChatId: string;
  isUsageRestricted: boolean;
  messageCount: number;
}

const ChatSideBar = ({
  chats,
  isUsageRestricted,
  currentChatId,
  messageCount,
}: ChatSideBarProps) => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (chat: SafeChat) => {
      const response = await axios.post("/api/remove-messages", {
        chatId: chat.id,
        fileKey: chat.fileKey,
      });
      return response.data;
    },
  });

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
                className={`w-full group flex justify-between gap-2 items-center p-3 rounded-md cursor-pointer hover:bg-purple-custom-300 hover:text-gray-800 dark:hover:bg-gray-900 dark:hover:text-gray-300 ${
                  selected
                    ? "bg-purple-custom-300 text-gray-800 dark:bg-gray-950 dark:text-gray-300"
                    : "text-gray-700 dark:text-gray-400"
                }`}
                onClick={() => router.push(`/chat/${chat.id}`)}
              >
                <div className="flex items-center w-[80%]">
                  <MessageSquare size={20} className="shrink-0 mr-2" />
                  <p className="truncate">{chat.pdfName}</p>
                </div>
                <div
                  className="group-hover:block hidden shrink-0 p-1 bg-purple-custom-100 dark:bg-gray-600 hover:bg-purple-custom-200 hover:dark:bg-gray-700 rounded"
                  onClick={async (e) => {
                    e.stopPropagation();
                    mutate(chat, {
                      onSuccess: ({ chatId }: { chatId: string }) => {
                        toast.success("Delete chat successfully");
                        if (chatId === currentChatId) {
                          router.push("/chat");
                        } else {
                          router.refresh();
                        }
                      },
                      onError: () => {
                        toast.error("Error deleting chat");
                      },
                    });
                  }}
                >
                  <Trash size={15} />
                </div>
              </li>
            );
          })}
        </div>
      </div>
      <UserSettings
        isUsageRestricted={isUsageRestricted}
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
