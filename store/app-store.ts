import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SafeChat } from "@lib/db/schema";
import { createComputed } from "zustand-computed";
import { DEFAULT_MODEL } from "@/constants/models";

type AppStore = {
  chats: SafeChat[];
  currentChatId: string;
  messageCount: number;
  isSubscribed: boolean;
  isAdmin: boolean;
  freeChats: number;
  freeMessages: number;
  selectedModel: string;
  addChat: (chat: SafeChat) => void;
  removeChat: (chatId: string) => void;
  setCurrentChatId: (currentChatId: string) => void;
  updateMessageCount: (type: "increase" | "decrease", by: number) => void;
  setSelectedModel: (model: string) => void;
  initialize: (data: any) => void;
};

type ComputedStore = {
  fileCount: number;
  isUsageRestricted: boolean;
};

const computed = createComputed(
  (state: AppStore): ComputedStore => ({
    fileCount: state.chats.length,
    isUsageRestricted: !state.isSubscribed && !state.isAdmin,
  })
);

export const useAppStore = create<AppStore>()(
  devtools(
    computed((set) => ({
      chats: [],
      currentChatId: "",
      messageCount: 0,
      isSubscribed: false,
      isAdmin: false,
      freeChats: 0,
      freeMessages: 0,
      selectedModel: DEFAULT_MODEL,
      addChat: (chat) =>
        set((state) => {
          const newChats = [chat, ...state.chats];
          console.log("addChat newChats", newChats);
          return { chats: newChats };
        }),
      removeChat: (chatId) =>
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== chatId);
          console.log("removeChat newChats", newChats);
          return { chats: newChats };
        }),
      setCurrentChatId: (currentChatId) => set({ currentChatId }),
      updateMessageCount: (type, by) =>
        set((state) => ({
          messageCount:
            type === "increase"
              ? state.messageCount + by
              : state.messageCount - by,
        })),
      setSelectedModel: (model) => set({ selectedModel: model }),
      initialize: (data) => set({ ...data }),
    })),
    {
      name: "app-store",
      enabled: process.env.NODE_ENV !== "production",
    }
  )
);
