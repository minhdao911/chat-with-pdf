"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { logger } from "@lib/logger";
import LimitReachedDialog from "./limit-reached-dialog";
import { useAppStore } from "@store/app-store";
import { SafeChat } from "@lib/db/schema";
import { useDbEvents } from "@providers/db-events-provider";

const FileUpload = () => {
  const router = useRouter();
  const { settings } = useDbEvents();
  const { freeChats, isUsageRestricted, fileCount, addChat } = useAppStore();

  const chatLimit = freeChats || Number(settings?.free_chats);

  const [isUploading, setIsUploading] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: any) => {
      if (isUsageRestricted && fileCount === chatLimit) {
        setShowLimitDialog(true);
        return;
      }

      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        // bigger than 5mb
        toast.error("File too large");
        return;
      } else {
        try {
          setIsUploading(true);
          const data = await uploadToS3(file);
          if (!data?.file_key || !data.file_name) {
            toast.error("Something went wrong");
            return;
          }
          mutate(data, {
            onSuccess: ({ chat }: { chat: SafeChat }) => {
              toast.success("Uploaded file successfully");
              console.log("chat", chat);
              addChat(chat);
              router.push(`/chat/${chat.id}`);
            },
            onError: () => {
              toast.error("Error creating chat");
            },
          });
        } catch (error) {
          logger.error("Error uploading file:", {
            error,
          });
        } finally {
          setIsUploading(false);
        }
      }
    },
    [mutate, router, fileCount, chatLimit, isUsageRestricted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop,
  });

  return (
    <div
      {...getRootProps({
        className:
          "w-[370px] border-dashed border-2 rounded-xl cursor-pointer bg-neutral-50 p-5 py-8 flex justify-center items-center flex-col dark:bg-neutral-900 dark:border-neutral-500",
      })}
    >
      <input {...getInputProps()} />
      {isPending || isUploading ? (
        <>
          <Loader2 size={30} className="animate-spin text-slate-500" />
          <p className="text-slate-400 mt-1">Spilling tea to GPT...</p>
        </>
      ) : (
        <>
          <Upload
            size={22}
            className="text-neutral-400 dark:text-neutral-500 mb-1"
          />
          <p className="text-neutral-400 dark:text-neutral-500">
            Drop your PDF here{isDragActive ? "" : " or click to select file"}
          </p>
        </>
      )}

      <LimitReachedDialog
        type="file"
        open={showLimitDialog}
        setOpen={setShowLimitDialog}
      />
    </div>
  );
};

export default FileUpload;
