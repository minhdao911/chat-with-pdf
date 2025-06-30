"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Loader2, Clipboard, Check } from "lucide-react";
import { FunctionComponent, useState } from "react";
import TooltipButton from "./ui/tooltip-button";
// import SourcesDialog from "./sources-dialog";

interface MessageListProps {
  messages: Message[];
  chatId: string;
  isLoading: boolean;
  // data: Record<string, any>;
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  isLoading,
  // data,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = (text: string, chatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(chatId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="absolute-center">
        <Loader2 size={30} className="text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 pb-5 h-full overflow-y-auto no-scrollbar">
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
                {/* <SourcesDialog sources={data[m.id] ?? data[i]} /> */}
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
    </div>
  );
};

export default MessageList;
