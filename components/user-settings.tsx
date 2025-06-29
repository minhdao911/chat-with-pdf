"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { Switch } from "./ui/switch";
import { useTheme } from "next-themes";
import UsageInfo from "./usage-info";
import ContactButton from "./contact-button";

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
    <div className="flex flex-col gap-5 dark:border-neutral-700">
      <UsageInfo
        isUsageRestricted={isUsageRestricted}
        messageCount={messageCount}
        chatCount={chatCount}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserButton />
          <p className="text-neutral-900 dark:text-neutral-400">
            {user?.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={darkmode}
            icon={darkmode ? Moon : Sun}
            iconClassName={darkmode ? "text-white" : "text-neutral-600"}
            onClick={() => setTheme(darkmode ? "light" : "dark")}
          />
          <ContactButton />
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
