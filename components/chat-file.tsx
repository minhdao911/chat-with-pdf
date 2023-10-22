"use client";

import FileUpload from "./file-upload";

interface ChatFileProps {
  isPro: boolean;
  chatCount: number;
}

const ChatFile = ({ chatCount, isPro }: ChatFileProps) => {
  return (
    <div className="relative flex-1 w-full h-screen overflow-auto">
      <div className="absolute-center">
        <FileUpload chatCount={chatCount} isPro={isPro} />
      </div>
    </div>
  );
};

export default ChatFile;
