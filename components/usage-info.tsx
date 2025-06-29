"use client";

import { HelpCircle } from "lucide-react";
import { useDbEvents } from "@providers/db-events-provider";
import PricingDialog from "./pricing-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useState } from "react";

interface UsageInfoProps {
  isUsageRestricted: boolean;
  messageCount: number;
  chatCount: number;
}

const UsageInfo = ({
  isUsageRestricted,
  messageCount,
  chatCount,
}: UsageInfoProps) => {
  const { data } = useDbEvents();

  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const usage = {
    chats: data?.free_chats,
    messages: data?.free_messages,
  };

  return (
    <>
      {isUsageRestricted && (
        <div className="flex flex-col items-center gap-3 p-3 bg-purple-custom-300/60 dark:bg-gray-700 rounded-md">
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-400">
            <p className="uppercase text-[11px] font-semibold tracking-wide">
              Beta usage
            </p>
            <HelpCircle
              size={12}
              className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              onClick={() => setShowHelpDialog(true)}
            />
          </div>

          <div className="w-full flex gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-full p-2 px-3.5 bg-white dark:bg-gray-600 rounded-md shadow">
              <p className="">Files</p>
              <p>
                <span className="text-lg font-semibold">{chatCount}</span>/
                {data?.free_chats}
              </p>
            </div>
            <div className="w-full p-2 px-3.5 bg-white dark:bg-gray-600 rounded-md shadow">
              <p>Messages</p>
              <p>
                <span className="text-lg font-semibold">{messageCount}</span>/
                {data?.free_messages}
              </p>
            </div>
          </div>
          {data?.billing && (
            <div className="w-full">
              <p className="text-xs text-center text-gray-700 dark:text-gray-400 mb-3">
                Unlock unlimited usage with
                <br />
                <b>Pro plan</b> subscription
              </p>
              <PricingDialog />
            </div>
          )}
        </div>
      )}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Beta Usage Information</DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>
                You&apos;re currently using the{" "}
                <span className="font-semibold">beta version</span> of AskPDF
                service. During the beta period, usage is limited to help manage
                server resources and gather feedback.
              </p>

              <div className="border-t pt-3">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Need more usage?
                </p>
                <p className="text-sm">
                  If you need higher limits or want to provide feedback about
                  the service, please don&apos;t hesitate to contact me.
                </p>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                Thank you for your interest! 🙏
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsageInfo;
