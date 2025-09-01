"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Loader2, Clipboard, Check } from "lucide-react";
import { FunctionComponent, useEffect, useState } from "react";
import TooltipButton from "./ui/tooltip-button";
import SourcesDialog from "./sources-dialog";

interface MessageListProps {
  messages: Message[];
  chatId: string;
  isLoading: boolean;
  isResponding: boolean;
  data?: Record<string, any>;
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  isLoading,
  isResponding = false,
  data,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = (text: string, chatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(chatId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 1000);
  };

  useEffect(() => {
    const messageContainer = document.getElementById("message-list");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isResponding]);

  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Loader2
          size={30}
          className="text-neutral-400 dark:text-neutral-600 animate-spin"
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 p-3 pb-4 h-full overflow-y-auto no-scrollbar"
      id="message-list"
    >
      {messages.map((m, i) => (
        <div
          key={m.id}
          className={cn("flex", {
            "justify-end": m.role === "user",
            "justify-start": m.role !== "user",
          })}
        >
          <div
            className={cn(
              "flex flex-col items-end gap-2 rounded-md px-3 py-1.5 dark:text-neutral-200",
              {
                "bg-purple-custom-300 dark:bg-purple-custom-800":
                  m.role === "user",
                "bg-neutral-100 dark:bg-neutral-800": m.role !== "user",
              }
            )}
          >
            {m.content}
            {m.role !== "user" && (
              <div className="flex">
                {data && <SourcesDialog sources={data[m.id] ?? data[i]} />}
                <TooltipButton
                  icon={copiedMessageId === m.id ? Check : Clipboard}
                  tooltipText="Copy"
                  onClick={() => handleCopy(m.content, m.id)}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading placeholder when AI is responding */}
      {isResponding && (
        <div className="flex justify-start">
          <div className="flex flex-col items-end gap-2 rounded-md px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                AI is thinking
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
