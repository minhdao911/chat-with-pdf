"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Loader2 } from "lucide-react";
import { FunctionComponent } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="absolute-center">
        <Loader2 size={30} className="text-gray-600 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 px-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn("flex", {
            "justify-end": m.role === "user",
            "justify-start": m.role !== "user",
          })}
        >
          <div
            className={cn("flex rounded-md px-3 py-1.5 dark:text-gray-200", {
              "bg-purple-custom-300 dark:bg-purple-custom-800":
                m.role === "user",
              "bg-gray-100 dark:bg-gray-800": m.role !== "user",
            })}
          >
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
