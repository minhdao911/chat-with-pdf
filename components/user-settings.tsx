import { useUser, UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import PricingDialog from "./pricing-dialog";
import { Switch } from "./ui/switch";
import { useTheme } from "next-themes";

interface UserSettingsProps {
  isPro: boolean;
}

const UserSettings = ({ isPro }: UserSettingsProps) => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const darkmode = theme === "dark";

  return (
    <div className="flex flex-col gap-3 border-t-2 border-gray-200 dark:border-gray-700 pt-5">
      {!isPro && <PricingDialog />}
      <div className="flex items-center justify-between pl-4">
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
