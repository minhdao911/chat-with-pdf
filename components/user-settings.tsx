"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { Switch } from "./ui/switch";
import { useTheme } from "next-themes";
import UsageInfo from "./usage-info";
import ContactButton from "./contact-button";
import { useAppStore } from "@store/app-store";
import { useUserInitialization } from "@providers/user-provider";

interface UserSettingsProps {}

const UserSettings = ({}: UserSettingsProps) => {
  const { user } = useUser();
  const { isUsageRestricted, messageCount, fileCount } = useAppStore();
  const { isInitialized } = useUserInitialization();
  const { theme, setTheme } = useTheme();
  const darkmode = theme === "dark";

  return (
    <div className="flex flex-col gap-5 dark:border-neutral-700">
      {isInitialized && (
        <UsageInfo
          isUsageRestricted={isUsageRestricted}
          messageCount={messageCount}
          chatCount={fileCount}
        />
      )}
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
