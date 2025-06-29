"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { useDbEvents } from "@providers/db-events-provider";

interface FileUploadProps {
  isUsageRestricted: boolean;
  chatCount: number;
}

const FileUpload = ({ chatCount, isUsageRestricted }: FileUploadProps) => {
  const router = useRouter();
  const { data } = useDbEvents();

  const [isUploading, setIsUploading] = useState(false);

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
      if (isUsageRestricted && chatCount === Number(data?.free_chats)) {
        toast("You have reached your file uploads limit");
        return;
      }

      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb
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
            onSuccess: ({ chat_id }: { chat_id: string }) => {
              toast.success("Uploaded file successfully");
              router.push(`/chat/${chat_id}`);
            },
            onError: () => {
              toast.error("Error creating chat");
            },
          });
        } catch (error) {
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate, router, chatCount]
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
          "w-[370px] border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 p-5 py-8 flex justify-center items-center flex-col dark:bg-neutral-900 dark:border-gray-500",
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
          <Upload size={30} className="text-gray-400 dark:text-gray-500 mb-1" />
          {isDragActive ? (
            <p className="text-gray-400 dark:text-gray-500">Drop PDF here</p>
          ) : (
            <p className="text-gray-400 dark:text-gray-500">
              Drag n drop PDF here, or click to select file
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default FileUpload;
