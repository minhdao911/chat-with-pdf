/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Loader2, Clipboard } from "lucide-react";
import { FunctionComponent } from "react";
import TooltipButton from "./ui/tooltip-button";
import SourcesDialog from "./sources-dialog";
import axios from "axios";

const getSources = (data: any[], messageId: string) => {
  const found = data.find((d: any) => d[0]?.messageId === messageId);
  return found || [];
};

interface MessageListProps {
  messages: Message[];
  chatId: string;
  isLoading: boolean;
  data: any[];
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  chatId,
  isLoading,
  data,
}) => {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setSources(data);
    }
  }, [JSON.stringify(data)]);

  // useEffect(() => {
  //   async function saveSources() {
  //     if (data.length > 0 && messages.length > 0) {
  //       const lastDataSources = data[data.length - 1];
  //       const lastSources = sources[sources.length - 1];
  //       const lastMessage = messages[messages.length - 1];
  //       if (
  //         !lastSources.messageId ||
  //         lastDataSources[0].content !== lastSources[0].content
  //       ) {
  //         try {
  //           await axios.post("/api/message-sources", {
  //             sources: lastDataSources,
  //             chatId,
  //           });
  //           const formattedSources = [
  //             ...sources.slice(0, -1),
  //             lastDataSources
  //               .sort((a: any, b: any) => a.pageNumber - b.pageNumber)
  //               .map((s: any) => ({
  //                 ...s,
  //                 messageId: lastMessage.id,
  //               })),
  //           ];
  //           console.log("formattedSources", formattedSources);
  //           setSources(formattedSources);
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       }
  //     }
  //   }
  //   saveSources();
  // }, [
  //   chatId,
  //   JSON.stringify(data),
  //   JSON.stringify(sources),
  //   JSON.stringify(messages),
  // ]);

  console.log("msg list sources", sources);

  if (isLoading) {
    return (
      <div className="absolute-center">
        <Loader2 size={30} className="text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn("flex", {
            "justify-end": m.role === "user",
            "justify-start": m.role !== "user",
          })}
        >
          <div
            className={cn(
              "flex flex-col items-end gap-2 rounded-md px-3 py-1.5 dark:text-gray-200",
              {
                "bg-purple-custom-300 dark:bg-purple-custom-800":
                  m.role === "user",
                "bg-gray-100 dark:bg-gray-800": m.role !== "user",
              }
            )}
          >
            {m.content}
            {m.role !== "user" && (
              <div className="flex">
                <SourcesDialog sources={getSources(sources, m.id)} />
                <TooltipButton
                  icon={Clipboard}
                  tooltipText="Copy to clipboard"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
