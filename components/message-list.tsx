"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { Loader2, Clipboard, Check } from "lucide-react";
import { FunctionComponent, useEffect, useState } from "react";
import TooltipButton from "./ui/tooltip-button";
import SourcesDialog from "./sources-dialog";
import Markdown from "markdown-to-jsx";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

// Custom code component that handles both inline code and code blocks
const CodeComponent = ({ className, children, ...props }: any) => {
  const childrenString = String(children);

  // Detect theme - check if dark mode is active
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addListener(checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeListener(checkTheme);
    };
  }, []);

  // Check if this is a code block by:
  // 1. Has a language class (lang-*)
  // 2. Contains newlines (multiline)
  // 3. Is longer than typical inline code
  const hasLanguageClass = className && className.startsWith("lang-");
  const hasNewlines = childrenString.includes("\n");
  const isLongCode = childrenString.length > 50;

  const isCodeBlock = hasLanguageClass || hasNewlines || isLongCode;

  if (isCodeBlock) {
    // Extract language from className if available
    const language = hasLanguageClass ? className.replace("lang-", "") : "text";

    return (
      <div className="w-full max-w-full min-w-0 overflow-hidden my-2">
        <div
          className="syntax-highlighter-container"
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            display: "block",
          }}
        >
          <SyntaxHighlighter
            language={language}
            style={isDarkMode ? vscDarkPlus : oneLight}
            customStyle={{
              margin: 0,
              padding: "1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              overflow: "auto",
              resize: "none",
              boxSizing: "border-box",
              display: "block",
              lineHeight: "1.5",
            }}
            codeTagProps={{
              style: {
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                display: "block",
              },
            }}
            preTag={({
              children,
              ...preProps
            }: {
              children: any;
              [key: string]: any;
            }) => (
              <pre
                {...preProps}
                style={{
                  ...preProps.style,
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  margin: 0,
                  overflowX: "auto",
                  boxSizing: "border-box",
                  display: "block",
                }}
              >
                {children}
              </pre>
            )}
            wrapLongLines={true}
            showLineNumbers={false}
            {...props}
          >
            {childrenString.replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  // For inline code, just return a simple styled span
  return (
    <code
      className="bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  );
};

interface MessageListProps {
  messages: Message[];
  chatId: string;
  isLoading: boolean;
  isResponding: boolean;
  data?: Record<string, any>;
}

const MessageList: FunctionComponent<MessageListProps> = ({
  messages,
  isLoading,
  isResponding = false,
  data,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = (text: string, chatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(chatId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 1000);
  };

  useEffect(() => {
    const messageContainer = document.getElementById("message-list");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isResponding]);

  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Loader2
          size={30}
          className="text-neutral-400 dark:text-neutral-600 animate-spin"
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 p-3 pb-4 h-full overflow-y-auto no-scrollbar"
      id="message-list"
    >
      {messages.map((m, i) => (
        <div
          key={m.id}
          className={cn("flex", {
            "justify-end": m.role === "user",
            "justify-start": m.role !== "user",
          })}
        >
          <div
            className={cn(
              "flex flex-col items-end gap-2 rounded-md px-3 py-1.5 dark:text-neutral-300",
              {
                "bg-purple-custom-200 dark:bg-purple-custom-800 dark:text-neutral-200":
                  m.role === "user",
              }
            )}
          >
            <Markdown
              options={{
                overrides: {
                  p: {
                    props: {
                      className: "my-2",
                    },
                  },
                  ol: {
                    props: {
                      className: "list-decimal pl-5",
                    },
                  },
                  ul: {
                    props: {
                      className: "list-disc pl-5",
                    },
                  },
                  li: {
                    props: {
                      className: "my-2",
                    },
                  },
                  code: CodeComponent,
                },
              }}
            >
              {m.content}
            </Markdown>
            {m.role !== "user" && (
              <div className="flex">
                {data && <SourcesDialog sources={data[m.id] ?? data[i]} />}
                <TooltipButton
                  icon={copiedMessageId === m.id ? Check : Clipboard}
                  tooltipText="Copy"
                  onClick={() => handleCopy(m.content, m.id)}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading placeholder when AI is responding */}
      {isResponding && (
        <div className="flex justify-start">
          <div className="flex flex-col items-end gap-2 rounded-md px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                AI is thinking
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
