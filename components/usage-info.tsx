"use client";

import { HelpCircle, Mail } from "lucide-react";
import PricingDialog from "./pricing-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { useState } from "react";
import { useDbEvents } from "@providers/db-events-provider";
import { useAppStore } from "@store/app-store";

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
  const { settings } = useDbEvents();
  const { freeChats, freeMessages } = useAppStore();

  const chatLimit = freeChats || Number(settings?.free_chats);
  const messageLimit = freeMessages || Number(settings?.free_messages);

  const [showHelpDialog, setShowHelpDialog] = useState(false);

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
                {chatLimit}
              </p>
            </div>
            <div className="w-full p-2 px-3.5 bg-white dark:bg-neutral-700 rounded-md shadow">
              <p>Messages</p>
              <p>
                <span className="text-lg font-semibold">{messageCount}</span>/
                {messageLimit}
              </p>
            </div>
          </div>
          {settings?.billing && (
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
                  Run out of usage?
                </p>
                <p className="text-sm">
                  You can add your API keys in the settings to continue using
                  the app. The keys are encrypted and stored on your local
                  machine, it cannot be used and accessed by anyone else except
                  you.
                </p>
                <p className="text-sm">
                  If you have any questions, contact me through the contact
                  button inside the settings.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsageInfo;
