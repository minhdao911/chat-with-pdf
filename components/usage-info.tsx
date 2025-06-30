"use client";

import { HelpCircle, Mail } from "lucide-react";
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
        <div className="flex flex-col items-center gap-3 p-3 bg-purple-custom-300/60 dark:bg-neutral-800 rounded-md">
          <div className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
            <p className="uppercase text-[11px] font-semibold tracking-wide">
              Beta usage
            </p>
            <HelpCircle
              size={12}
              className="cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
              onClick={() => setShowHelpDialog(true)}
            />
          </div>

          <div className="w-full flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <div className="w-full p-2 px-3.5 bg-white dark:bg-neutral-700 rounded-md shadow">
              <p className="">Files</p>
              <p>
                <span className="text-lg font-semibold">{chatCount}</span>/
                {data?.free_chats}
              </p>
            </div>
            <div className="w-full p-2 px-3.5 bg-white dark:bg-neutral-700 rounded-md shadow">
              <p>Messages</p>
              <p>
                <span className="text-lg font-semibold">{messageCount}</span>/
                {data?.free_messages}
              </p>
            </div>
          </div>
          {data?.billing && (
            <div className="w-full">
              <p className="text-xs text-center text-neutral-700 dark:text-neutral-400 mb-3">
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
                <span className="font-semibold">beta version</span> of AskPDF.
                During the beta period, usage is limited to help manage server
                resources and gather feedback.
              </p>

              <div className="border-t pt-3 flex flex-col gap-3">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Need more usage?
                </p>
                <p className="text-sm">
                  If you need higher limits or want to provide feedback about
                  the product, please don&apos;t hesitate to contact me.
                </p>
                <div className="flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <Mail size={18} className="text-purple-custom-500" />
                  <span className="text-sm">
                    Use the contact button in the bottom-right corner of the
                    sidebar to reach out!
                  </span>
                </div>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
