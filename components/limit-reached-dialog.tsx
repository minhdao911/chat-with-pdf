"use client";

import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useAppStore } from "@store/app-store";
import { useDbEvents } from "@providers/db-events-provider";

interface LimitReachedDialogProps {
  type: "message" | "file";
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LimitReachedDialog = ({
  type,
  open,
  setOpen,
}: LimitReachedDialogProps) => {
  const { settings } = useDbEvents();
  const { freeChats, freeMessages } = useAppStore();

  const chatLimit = freeChats || Number(settings?.free_chats);
  const messageLimit = freeMessages || Number(settings?.free_messages);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "message" ? "Message" : "File"} Limit Reached
          </DialogTitle>
          <DialogDescription className="text-left">
            <div className="flex flex-col gap-3 mt-3">
              <p>
                You&apos;ve reached your free {type} limit of{" "}
                <span className="font-semibold">
                  {type === "message" ? messageLimit : chatLimit} {type}s.
                </span>
              </p>
              <p>
                Thank you for your interest in the product. Feel free to drop me
                a line to increase the limit if you want to continue trying out.
              </p>
              <div className="flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <Mail size={18} className="text-purple-custom-500" />
                <span className="text-sm">
                  Use the contact button in the bottom-right corner of the
                  sidebar to reach out!
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default LimitReachedDialog;
