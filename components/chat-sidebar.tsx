"use client";

import { Loader2, MessageSquarePlus, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { SafeChat } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import UserSettings from "./user-settings";
import { MouseEventHandler, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAppStore } from "@store/app-store";
import { useUserInitialization } from "@providers/user-provider";

interface ChatSideBarProps {}

const ChatSideBar = ({}: ChatSideBarProps) => {
  const router = useRouter();
  const { isInitializing } = useUserInitialization();
  const { chats, currentChatId, setCurrentChatId, removeChat } = useAppStore();

  const [removingChatId, setRemovingChatId] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (chat: SafeChat) => {
      const response = await axios.post("/api/remove-messages", {
        chatId: chat.id,
        fileKey: chat.fileKey,
      });
      return response.data;
    },
  });

  const handleNewChat = () => {
    setCurrentChatId("");
    router.push("/chat");
  };

  const handleRemoveChat = (
    e: React.MouseEvent<HTMLButtonElement>,
    chat: SafeChat
  ) => {
    e.stopPropagation();
    setRemovingChatId(chat.id);
    mutate(chat, {
      onSuccess: ({ chatId }: { chatId: string }) => {
        toast.success("Delete chat successfully");
        removeChat(chatId);
        setRemovingChatId(null);
        if (chatId === currentChatId) {
          router.push("/chat");
        }
      },
      onError: () => {
        toast.error("Error deleting chat");
        setRemovingChatId(null);
      },
    });
  };

  return (
    <div className="w-72 h-screen shrink-0 bg-purple-custom-50 dark:bg-neutral-900 px-4 py-5 flex flex-col justify-between">
      <div>
        <NewChatButton onClick={handleNewChat} disabled={isInitializing} />
        {isInitializing ? (
          <div className="flex justify-center items-center w-full mt-5">
            <Loader2 className="text-neutral-400 dark:text-neutral-600 animate-spin" />
          </div>
        ) : (
          <div className="w-full mt-3 flex flex-col gap-1">
            {chats.map((chat) => {
              const selected = chat.id === currentChatId;
              return (
                <li
                  key={chat.id}
                  className={`w-full group flex justify-between gap-2 items-center p-3 rounded-md cursor-pointer hover:bg-purple-custom-300/50 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 ${
                    selected
                      ? "bg-purple-custom-300/50 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                      : "text-neutral-700 dark:text-neutral-400"
                  }`}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                >
                  <div className="flex items-center gap-1 w-full">
                    <p className="truncate w-[90%]">{chat.pdfName}</p>
                    {isPending && removingChatId === chat.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Button
                        variant="ghost"
                        className="group-hover:block hidden h-fit shrink-0 p-1 bg-purple-custom-100 dark:bg-neutral-600 hover:bg-purple-custom-300 hover:dark:bg-neutral-700 rounded"
                        disabled={isPending}
                        onClick={(e) => handleRemoveChat(e, chat)}
                      >
                        <Trash size={15} />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </div>
        )}
      </div>
      <UserSettings />
    </div>
  );
};

export default ChatSideBar;

interface NewChatButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const NewChatButton = ({ onClick, disabled }: NewChatButtonProps) => {
  return (
    <Button
      variant="secondary"
      className="w-full bg-white dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 shadow"
      onClick={onClick}
      disabled={disabled}
    >
      <MessageSquarePlus size={20} className="mr-1.5" />
      New chat
    </Button>
  );
};
