"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Loader2, Clipboard } from "lucide-react";
import { FunctionComponent } from "react";
import TooltipButton from "./ui/tooltip-button";
import SourcesDialog from "./sources-dialog";

interface MessageListProps {
  messages: Message[];
  chatId: string;
  isLoading: boolean;
  data: Record<string, any>;
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  isLoading,
  data,
}) => {
  if (isLoading) {
    return (
      <div className="absolute-center">
        <Loader2 size={30} className="text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-3">
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
                <SourcesDialog sources={data[m.id] ?? data[i]} />
                <TooltipButton
                  icon={Clipboard}
                  tooltipText="Copy to clipboard"
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
