// OpenAI model configurations
export const OPENAI_MODELS = {
  GPT_5_CHAT_LATEST: "gpt-5-chat-latest",
  GPT_4_1: "gpt-4.1",
  GPT_4O_MINI: "gpt-4o-mini",
} as const;

// Anthropic model configurations
export const ANTHROPIC_MODELS = {
  CLAUDE_3_7_SONNET: "claude-3.7-sonnet",
} as const;

// Google model configurations
export const GOOGLE_MODELS = {
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
} as const;

// DeepSeek model configurations
export const DEEPSEEK_MODELS = {
  DEEPSEEK_R1_0528: "deepseek-r1-0528",
} as const;

// All available models
export const ALL_MODELS = {
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GOOGLE_MODELS,
  ...DEEPSEEK_MODELS,
} as const;

// Available models for selection
export const VALID_MODELS = Object.values(ALL_MODELS) as string[];

// Default model
export const DEFAULT_MODEL = OPENAI_MODELS.GPT_4O_MINI;

// Model options for the UI selector
export const MODEL_OPTIONS = [
  // OpenAI Models
  {
    value: OPENAI_MODELS.GPT_5_CHAT_LATEST,
    label: "GPT-5",
    description: "Latest GPT-5 model for chat",
    provider: "OpenAI",
    credits: 1,
  },
  {
    value: OPENAI_MODELS.GPT_4_1,
    label: "GPT-4.1",
    description: "Smart non-reasoning model",
    provider: "OpenAI",
    credits: 1,
  },
  {
    value: OPENAI_MODELS.GPT_4O_MINI,
    label: "GPT-4o Mini",
    description: "Fast and efficient for most tasks",
    provider: "OpenAI",
    credits: 1,
  },
  // Anthropic Models
  {
    value: ANTHROPIC_MODELS.CLAUDE_3_7_SONNET,
    label: "Claude 3.7 Sonnet",
    description: "Advanced reasoning and analysis",
    provider: "Anthropic",
    credits: 2,
  },
  // Google Models
  {
    value: GOOGLE_MODELS.GEMINI_2_5_FLASH,
    label: "Gemini 2.5 Flash",
    description: "Fast multimodal AI model",
    provider: "Google",
    credits: 0,
  },
  // DeepSeek Models
  {
    value: DEEPSEEK_MODELS.DEEPSEEK_R1_0528,
    label: "DeepSeek R1",
    description: "Advanced reasoning model",
    provider: "DeepSeek",
    credits: 0,
  },
] as const;
