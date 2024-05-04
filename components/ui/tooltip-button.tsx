import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./tooltip";
import { FunctionComponent } from "react";
import { Button } from "./button";

interface TooltipButtonProps {
  icon: any;
  tooltipText: string;
}

const TooltipButton: FunctionComponent<TooltipButtonProps> = ({
  icon,
  tooltipText,
}) => {
  const Icon = icon;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            className="bg-transparent hover:bg-purple-custom-200 dark:hover:bg-gray-700 py-[3px] px-2"
            size="sm"
          >
            <Icon size={15} className="text-gray-400" />
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
