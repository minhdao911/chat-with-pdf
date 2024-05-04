"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
// import PricingDialog from "./pricing-dialog";
import { Switch } from "./ui/switch";
import { useTheme } from "next-themes";
import { FREE_MAX_CHATS, FREE_MAX_MESSAGES } from "@/constants";

interface UserSettingsProps {
  isUsageRestricted: boolean;
  messageCount: number;
  chatCount: number;
}

const UserSettings = ({
  isUsageRestricted,
  messageCount,
  chatCount,
}: UserSettingsProps) => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const darkmode = theme === "dark";

  return (
    <div className="flex flex-col gap-5 dark:border-gray-700">
      {isUsageRestricted && (
        <div className="flex flex-col items-center gap-3 p-3 bg-purple-custom-300/60 dark:bg-gray-700 rounded-md">
          <p className="uppercase text-[11px] font-semibold tracking-wide text-gray-700 dark:text-gray-400">
            Beta usage
          </p>
          <div className="w-full flex gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-full p-2 px-3.5 bg-white dark:bg-gray-600 rounded-md shadow">
              <p className="">Files</p>
              <p>
                <span className="text-lg font-semibold">{chatCount}</span>/
                {FREE_MAX_CHATS}
              </p>
            </div>
            <div className="w-full p-2 px-3.5 bg-white dark:bg-gray-600 rounded-md shadow">
              <p>Messages</p>
              <p>
                <span className="text-lg font-semibold">{messageCount}</span>/
                {FREE_MAX_MESSAGES}
              </p>
            </div>
          </div>
          {/* <div className="w-full">
            <p className="text-xs text-center text-gray-700 dark:text-gray-400 mb-3">
              Unlock powerful features and unlimited usage with our{" "}
              <b>Pro upgrade</b> today!
            </p>
            <PricingDialog />
          </div> */}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserButton />
          <p className="text-gray-900 dark:text-gray-400">{user?.fullName}</p>
        </div>
        <Switch
          checked={darkmode}
          icon={darkmode ? Moon : Sun}
          iconClassName={darkmode ? "text-white" : "text-gray-600"}
          onClick={() => setTheme(darkmode ? "light" : "dark")}
        />
      </div>
    </div>
  );
};

export default UserSettings;
