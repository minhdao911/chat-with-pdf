import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { SafeChat } from "@lib/db/schema";
import { createComputed } from "zustand-computed";
import { DEFAULT_MODEL } from "@/constants/models";
import { ApiKeys } from "@/types";
import { encryptData, decryptData, isCryptoAvailable } from "@/lib/crypto";
import { logger } from "@lib/logger";

// LocalStorage keys
const STORAGE_KEYS = {
  API_KEYS: "chat-pdf-api-keys",
};

// Utility functions for localStorage with encryption
const saveApiKeysToStorage = (apiKeys: ApiKeys, userId: string) => {
  if (!userId) return;

  try {
    if (isCryptoAvailable()) {
      const encryptedData = encryptData(JSON.stringify(apiKeys), userId);
      localStorage.setItem(STORAGE_KEYS.API_KEYS, encryptedData);
    } else {
      // Fallback to unencrypted storage if crypto is not available
      localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
    }
  } catch (error) {
    logger.error("Error saving API keys:", error);
  }
};

const loadApiKeysFromStorage = (userId: string): ApiKeys => {
  if (!userId) return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (!stored) return {};

    if (isCryptoAvailable()) {
      try {
        const decryptedData = decryptData(stored, userId);
        return JSON.parse(decryptedData);
      } catch (error) {
        // If decryption fails, try parsing as unencrypted (for backward compatibility)
        logger.warn(
          "Failed to decrypt API keys, attempting to parse as unencrypted"
        );
        try {
          return JSON.parse(stored);
        } catch (parseError) {
          logger.error("Error parsing stored API keys:", parseError);
          return {};
        }
      }
    } else {
      // Fallback to unencrypted parsing if crypto is not available
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error("Error loading API keys:", error);
    return {};
  }
};

type AppStore = {
  chats: SafeChat[];
  currentChatId: string;
  messageCount: number;
  isSubscribed: boolean;
  isAdmin: boolean;
  freeChats: number;
  freeMessages: number;
  selectedModel: string;
  apiKeys: ApiKeys;
  addChat: (chat: SafeChat) => void;
  removeChat: (chatId: string) => void;
  setCurrentChatId: (currentChatId: string) => void;
  updateMessageCount: (type: "increase" | "decrease", by: number) => void;
  setSelectedModel: (model: string) => void;
  setApiKeys: (apiKeys: ApiKeys, userId?: string) => void;
  initializeApiKeys: (userId: string) => void;
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
      apiKeys: {},
      userId: "",
      addChat: (chat) =>
        set((state) => {
          const newChats = [chat, ...state.chats];
          return { chats: newChats };
        }),
      removeChat: (chatId) =>
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== chatId);
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
      setApiKeys: (apiKeys, userId) => {
        if (userId) {
          saveApiKeysToStorage(apiKeys, userId);
        }
        set({ apiKeys });
      },
      initializeApiKeys: (userId) => {
        if (!userId) return;
        const storedApiKeys = loadApiKeysFromStorage(userId);
        set({ apiKeys: storedApiKeys });
      },
      initialize: (data) => set({ ...data }),
    })),
    {
      name: "app-store",
      enabled: process.env.NODE_ENV !== "production",
    }
  )
);

// Export the ApiKeys type for use in other components
export type { ApiKeys };
