"use client";

import axios from "axios";
import { FunctionComponent, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CornerDownRight } from "lucide-react";
import { SafeChat } from "@/lib/db/schema";
import { Button } from "./ui/button";
import MessageList from "./message-list";
import { Textarea } from "./ui/textarea";
import LimitReachedDialog from "./limit-reached-dialog";
import { useAppStore } from "@store/app-store";
import { useDbEvents } from "@providers/db-events-provider";

interface ChatInterfaceProps {
  currentChat: SafeChat;
}

const ChatInterface: FunctionComponent<ChatInterfaceProps> = ({
  currentChat,
}) => {
  const chatId = currentChat.id;
  const { settings } = useDbEvents();
  const {
    isUsageRestricted,
    messageCount,
    isAdmin,
    freeMessages,
    setCurrentChatId,
    updateMessageCount,
  } = useAppStore();

  const messageLimit = freeMessages || Number(settings?.free_messages);

  const query = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const { messages, input, isLoading, handleInputChange, handleSubmit } =
    useChat({
      body: {
        fileKey: currentChat.fileKey,
        chatId,
        messageCount,
        isAdmin,
      },
      initialMessages: query.data?.messages || [],
      onResponse: (response) => {
        updateMessageCount("increase", 1);

        const sourcesHeader = response.headers.get("x-sources");
        const sources = sourcesHeader
          ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
          : [];
        const messageIndexHeader = response.headers.get("x-message-index");
        if (sources.length && messageIndexHeader !== null) {
          setSourcesForMessages({
            ...sourcesForMessages,
            [messageIndexHeader]: sources,
          });
        }
      },
    });

  useEffect(() => {
    setCurrentChatId(chatId);
  }, []);

  // useEffect(() => {
  //   if (query.data?.sources) {
  //     const msgSources = query.data?.sources
  //       ? (query.data?.sources as SafeSource[]).reduce(
  //           (a, v) => ({ ...a, [v.messageId]: v.data }),
  //           {}
  //         )
  //       : {};
  //     setSourcesForMessages(msgSources);
  //   }
  // }, [query.data?.sources]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isUsageRestricted && messageCount === messageLimit) {
      e.preventDefault();
      setShowLimitDialog(true);
      return;
    }
    handleSubmit(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onSubmit(e as any);
    }
  };

  return (
    <>
      <div className="relative w-full h-screen flex flex-col justify-between">
        <MessageList
          messages={messages}
          isLoading={query.isLoading}
          // data={sourcesForMessages}
          chatId={chatId}
        />
        <form
          className={`flex gap-2 bg-white dark:bg-background px-3 pt-1 pb-5`}
          onSubmit={onSubmit}
        >
          <div className="flex flex-col items-end w-full border border-neutral-300 dark:border-neutral-700 rounded-lg">
            <Textarea
              value={input}
              placeholder="Ask any question..."
              rows={2}
              disabled={isLoading}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              className="pt-2.5 border-none resize-none"
            />
            <Button
              type="submit"
              variant="ghost"
              className="w-fit gap-1 font-light text-[12px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 hover:bg-transparent"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <CornerDownRight size={16} />
                  Enter to send
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <LimitReachedDialog
        type="message"
        open={showLimitDialog}
        setOpen={setShowLimitDialog}
      />
    </>
  );
};

export default ChatInterface;
