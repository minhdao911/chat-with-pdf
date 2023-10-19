"use client";

import FileUpload from "./file-upload";

const ChatFile = () => {
  return (
    <div className="relative w-full h-screen overflow-auto">
      <div className="absolute-center">
        <FileUpload />
      </div>
    </div>
  );
};

export default ChatFile;
