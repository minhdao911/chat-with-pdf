import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FunctionComponent } from "react";
import { DialogHeader } from "./ui/dialog";
import TooltipButton from "./ui/tooltip-button";
import { List } from "lucide-react";

type Source = {
  pageNumber: number;
  content: string;
};

interface SourcesDialogProps {
  sources: Source[];
}

const SourcesDialog: FunctionComponent<SourcesDialogProps> = ({ sources }) => {
  return sources?.length > 0 ? (
    <Dialog>
      <DialogTrigger>
        <TooltipButton icon={List} tooltipText="Show sources" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sources</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 max-h-[800px] w-[600px] overflow-auto pr-3">
          {sources.map(({ pageNumber, content }, index) => (
            <div
              key={index}
              className={`${
                index === sources.length - 1 ? "" : "border-b"
              } py-3`}
            >
              <p className="dark:text-neutral-100 text-neutral-900 mb-1">
                Page {pageNumber}
              </p>
              <p className="text-sm dark:text-neutral-400 text-neutral-500">
                {content}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
};

export default SourcesDialog;
