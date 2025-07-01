"use client";

import { Button } from "@components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const GoToChatButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <Button
      className="w-[130px] bg-black/90 text-neutral-100 hover:bg-black/80"
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Link href="/chat" className="flex">
          Go to chat
          <Bot className="ml-1.5" size={18} />
        </Link>
      )}
    </Button>
  );
};
