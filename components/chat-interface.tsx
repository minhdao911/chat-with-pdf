"use client";

import { FunctionComponent, useEffect, useState } from "react";
import { Message, useChat } from "ai/react";
import { Input } from "./ui/input";
import { Loader2, SendHorizonal } from "lucide-react";
import { Button } from "./ui/button";
import MessageList from "./message-list";
import { SafeChat } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ChatInterfaceProps {
  currentChat: SafeChat;
}

const ChatInterface: FunctionComponent<ChatInterfaceProps> = ({
  currentChat,
}) => {
  const chatId = currentChat.id;
  const query = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });
  const { messages, input, isLoading, handleInputChange, handleSubmit } =
    useChat({
      body: {
        fileKey: currentChat.fileKey,
        chatId,
      },
      initialMessages: query.data || [],
    });

  const [scrolled, setScrolled] = useState(false);

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

  return (
    <div
      className="relative flex-[2] h-screen overflow-auto pt-3"
      id="message-container"
    >
      <MessageList messages={messages} isLoading={query.isLoading} />
      <form
        className={`${
          scrolled ? "sticky" : "absolute"
        } bottom-0 left-0 right-0 flex gap-2 bg-white dark:bg-background px-3 py-5`}
        onSubmit={handleSubmit}
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
              className="text-gray-600 dark:text-gray-200"
            />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
