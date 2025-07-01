import FileUpload from "./file-upload";

interface ChatFileProps {}

const ChatFile = ({}: ChatFileProps) => {
  return (
    <div className="relative flex-1 w-full h-screen overflow-auto no-scrollbar">
      <div className="absolute-center">
        <FileUpload />
      </div>
    </div>
  );
};

export default ChatFile;
