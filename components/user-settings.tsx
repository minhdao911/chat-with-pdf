"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { Switch } from "./ui/switch";
import { useTheme } from "next-themes";
import { useDbEvents } from "@providers/db-events-provider";
import UsageInfo from "./usage-info";

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
  const { data } = useDbEvents();
  const { theme, setTheme } = useTheme();
  const darkmode = theme === "dark";

  return (
    <div className="flex flex-col gap-5 dark:border-gray-700">
      <UsageInfo
        isUsageRestricted={isUsageRestricted}
        messageCount={messageCount}
        chatCount={chatCount}
      />
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

const Usage = () => {};
