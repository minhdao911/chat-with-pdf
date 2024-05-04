"use client";

import FileUpload from "./file-upload";

interface ChatFileProps {
  isUsageRestricted: boolean;
  chatCount: number;
}

const ChatFile = ({ chatCount, isUsageRestricted }: ChatFileProps) => {
  return (
    <div className="relative flex-1 w-full h-screen overflow-auto">
      <div className="absolute-center">
        <FileUpload
          chatCount={chatCount}
          isUsageRestricted={isUsageRestricted}
        />
      </div>
    </div>
  );
};

export default ChatFile;
