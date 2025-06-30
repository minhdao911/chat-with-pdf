import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./tooltip";
import { FunctionComponent } from "react";
import { Button } from "./button";
import { cn } from "@lib/utils";

interface TooltipButtonProps {
  icon: any;
  tooltipText: string;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

const TooltipButton: FunctionComponent<TooltipButtonProps> = ({
  icon,
  tooltipText,
  className,
  iconClassName,
  onClick,
}) => {
  const Icon = icon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            className={cn(
              "bg-transparent hover:bg-purple-custom-200 dark:hover:bg-neutral-700 py-[3px] px-2",
              className
            )}
            size="sm"
            onClick={onClick}
          >
            <Icon size={15} className={cn("text-neutral-400", iconClassName)} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipButton;
