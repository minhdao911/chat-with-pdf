"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

const FileUpload = () => {
  const router = useRouter();
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
            onSuccess: ({ chat_id }) => {
              toast.success("Uploaded file successfully");
              router.push(`/chat/${chat_id}`);
            },
            onError: () => {
              toast.error("Error creating chat");
            },
          });
        } catch (error) {
          console.log(error);
        } finally {
          setIsUploading(false);
        }
      }
    },
    [mutate, router]
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
          "w-[370px] border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 p-5 py-8 flex justify-center items-center flex-col dark:bg-gray-800 dark:border-gray-500",
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
          <Upload size={30} className="text-slate-500" />
          {isDragActive ? (
            <p className="text-slate-400 mt-1">Drop PDF here</p>
          ) : (
            <p className="text-slate-400 mt-1">
              Drag n drop PDF here, or click to select file
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default FileUpload;
