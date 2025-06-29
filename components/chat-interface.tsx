"use client";

import axios from "axios";
import { FunctionComponent, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SendHorizonal, MessageCircle, Mail } from "lucide-react";
import { Input } from "./ui/input";
import { SafeChat, SafeSource } from "@/lib/db/schema";
import { Button } from "./ui/button";
import MessageList from "./message-list";
import { useDbEvents } from "@providers/db-events-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ChatInterfaceProps {
  currentChat: SafeChat;
  isUsageRestricted: boolean;
  messageCount: number;
  isAdmin: boolean;
}

const ChatInterface: FunctionComponent<ChatInterfaceProps> = ({
  currentChat,
  isUsageRestricted,
  messageCount,
  isAdmin,
}) => {
  const chatId = currentChat.id;
  const { data } = useDbEvents();

  const query = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const [scrolled, setScrolled] = useState(false);
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [showLimitDialog, setShowLimitDialog] = useState(true);

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
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
      setScrolled(messageContainer.scrollHeight > window.innerHeight);
    }
  }, [messages]);

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

  return (
    <>
      <div
        className="relative w-full h-screen overflow-auto pt-3"
        id="message-container"
      >
        <MessageList
          messages={messages}
          isLoading={query.isLoading}
          // data={sourcesForMessages}
          chatId={chatId}
        />
        <form
          className={`${
            scrolled ? "sticky" : "absolute"
          } bottom-0 left-0 right-0 flex gap-2 bg-white dark:bg-background px-3 py-5`}
          onSubmit={(e) => {
            if (
              isUsageRestricted &&
              messageCount === Number(data?.free_messages)
            ) {
              e.preventDefault();
              setShowLimitDialog(true);
              return;
            }
            handleSubmit(e);
          }}
        >
          <Input
            value={input}
            placeholder="Ask any question..."
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            className="bg-purple-custom-300 dark:bg-purple-custom-800"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <SendHorizonal
                size={20}
                className="text-neutral-600 dark:text-neutral-200"
              />
            )}
          </Button>
        </form>
      </div>

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {/* <MessageCircle className="h-5 w-5 text-purple-custom-500" /> */}
              Message Limit Reached
            </DialogTitle>
            <DialogDescription className="text-left">
              <div className="flex flex-col gap-3 mt-3">
                <p>
                  You&apos;ve reached your free message limit of{" "}
                  <span className="font-semibold">
                    {data?.free_messages} messages.
                  </span>
                </p>
                <p>
                  Thank you for your interest in the product. Feel free to drop
                  me a line to increase the limit if you want to continue trying
                  out.
                </p>
                <div className="flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <Mail size={18} className="text-purple-custom-500" />
                  <span className="text-sm">
                    Use the contact button in the bottom-right corner of the
                    sidebar to reach out!
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatInterface;
