export enum FeatureFlags {
  Billing = "billing",
}

export enum AppSettings {
  FreeChats = "free_chats",
  FreeMessages = "free_messages",
}

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
  deepseek?: string;
}
