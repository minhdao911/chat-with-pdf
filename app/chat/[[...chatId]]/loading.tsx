import { Loader2 } from "lucide-react";
import React from "react";

const ChatLoading = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-neutral-300 dark:text-neutral-600"
        />
        <p className="mt-4 text-sm text-neutral-500">Loading chat...</p>
      </div>
    </div>
  );
};

export default ChatLoading;
