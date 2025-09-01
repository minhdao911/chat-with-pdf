import { Pinecone } from "@pinecone-database/pinecone";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { CallbackHandlerMethods } from "@langchain/core/callbacks/base";
import { StreamingTextResponse } from "ai";
import { ANSWER_TEMPLATE, QUESTION_TEMPLATE } from "./prompts";
import { logger } from "./logger";
import {
  VALID_MODELS,
  DEFAULT_MODEL,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GOOGLE_MODELS,
  DEEPSEEK_MODELS,
} from "@/constants/models";
import { ApiKeys } from "@/types";

const openAIApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

const defaultModel = DEFAULT_MODEL;
const alternativeModel = DEFAULT_MODEL;

// Helper functions to determine model providers
function isOpenAIModel(modelName: string): boolean {
  return Object.values(OPENAI_MODELS).includes(modelName as any);
}

function isAnthropicModel(modelName: string): boolean {
  return Object.values(ANTHROPIC_MODELS).includes(modelName as any);
}

function isGoogleModel(modelName: string): boolean {
  return Object.values(GOOGLE_MODELS).includes(modelName as any);
}

function isDeepSeekModel(modelName: string): boolean {
  return Object.values(DEEPSEEK_MODELS).includes(modelName as any);
}

function getModelProvider(modelName: string): string {
  if (isOpenAIModel(modelName)) return "openai";
  if (isAnthropicModel(modelName)) return "anthropic";
  if (isGoogleModel(modelName)) return "google";
  if (isDeepSeekModel(modelName)) return "deepseek";
  return "unknown";
}

function getModelName(messageCount: number, isAdmin: boolean): string {
  return isAdmin
    ? defaultModel
    : messageCount < 20
      ? defaultModel
      : alternativeModel;
}

function validateAndGetModel(
  selectedModel?: string,
  messageCount?: number,
  isAdmin?: boolean
): string {
  // If a specific model is selected, validate it
  if (selectedModel && VALID_MODELS.includes(selectedModel)) {
    return selectedModel;
  }

  // If selected model is invalid, log warning and fallback to default logic
  if (selectedModel && !VALID_MODELS.includes(selectedModel)) {
    console.warn(
      `Invalid model selected: ${selectedModel}. Falling back to default.`
    );
  }

  // Use default model selection logic
  return getModelName(messageCount || 0, isAdmin || false);
}

// Model factory function to create chat instances for different providers
function createChatModel(
  modelName: string,
  streaming: boolean = false,
  apiKeys?: ApiKeys
) {
  const provider = getModelProvider(modelName);

  switch (provider) {
    case "openai":
      const openaiKey = apiKeys?.openai || openAIApiKey;
      if (!openaiKey) {
        throw new Error("OpenAI API key is required for this model");
      }
      return new ChatOpenAI({
        apiKey: openaiKey,
        modelName,
        streaming,
        temperature: 0,
      });

    case "anthropic":
      const anthropicKey = apiKeys?.anthropic || anthropicApiKey;
      if (!anthropicKey) {
        throw new Error("Anthropic API key is required for this model");
      }
      return new ChatAnthropic({
        apiKey: anthropicKey,
        modelName,
        streaming,
        temperature: 0,
      });

    case "google":
      const googleKey = apiKeys?.google || googleApiKey;
      if (!googleKey) {
        throw new Error("Google API key is required for this model");
      }
      return new ChatGoogleGenerativeAI({
        apiKey: googleKey,
        model: modelName,
        streaming,
        temperature: 0,
      });

    case "deepseek":
      const deepseekKey = apiKeys?.deepseek || deepseekApiKey;
      if (!deepseekKey) {
        throw new Error("DeepSeek API key is required for this model");
      }
      return new ChatDeepSeek({
        apiKey: deepseekKey,
        modelName,
        streaming,
        temperature: 0,
      });

    default:
      logger.warn(
        `Unknown provider for model: ${modelName}. Falling back to OpenAI.`
      );
      const fallbackKey = apiKeys?.openai || openAIApiKey;
      if (!fallbackKey) {
        throw new Error("OpenAI API key is required for fallback model");
      }
      return new ChatOpenAI({
        apiKey: fallbackKey,
        modelName: DEFAULT_MODEL,
        streaming,
        temperature: 0,
      });
  }
}

function createStreamingModel(
  selectedModel?: string,
  messageCount?: number,
  isAdmin?: boolean,
  apiKeys?: ApiKeys
) {
  const modelName = validateAndGetModel(selectedModel, messageCount, isAdmin);
  return createChatModel(modelName, true, apiKeys);
}

function createNonStreamingModel(
  selectedModel?: string,
  messageCount?: number,
  isAdmin?: boolean,
  apiKeys?: ApiKeys
) {
  const modelName = validateAndGetModel(selectedModel, messageCount, isAdmin);
  return createChatModel(modelName, false, apiKeys);
}

type retrievalArgs = {
  question: string;
  chatHistory: string;
  previousMessages: string[];
  fileKey: string;
  isAdmin: boolean;
  selectedModel?: string;
  apiKeys?: ApiKeys;
  streamCallbacks: CallbackHandlerMethods;
};

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const questionPrompt = PromptTemplate.fromTemplate(QUESTION_TEMPLATE);
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

export async function retrieval({
  question,
  chatHistory,
  previousMessages,
  fileKey,
  isAdmin,
  selectedModel,
  apiKeys,
  streamCallbacks,
}: retrievalArgs) {
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");
  const vectorstore = getVectorStore(fileKey);
  const messageCount = previousMessages.length;

  /**
   * https://js.langchain.com/docs/expression_language/cookbook/retrieval
   */
  const standaloneQuestionChain = RunnableSequence.from([
    questionPrompt,
    createNonStreamingModel(selectedModel, messageCount, isAdmin, apiKeys),
    new StringOutputParser(),
  ]);

  let resolveWithDocuments: (value: Document[]) => void;
  const documentPromise = new Promise<Document[]>((resolve) => {
    resolveWithDocuments = resolve;
  });

  const retriever = vectorstore.asRetriever({
    callbacks: [
      {
        handleRetrieverEnd(documents) {
          resolveWithDocuments(documents);
        },
      },
    ],
  });

  const retrievalChain = retriever.pipe(combineDocumentsFn);

  const answerChain = RunnableSequence.from([
    {
      context: RunnableSequence.from([
        (input) => input.question,
        retrievalChain,
      ]),
      chat_history: (input) => input.chat_history,
      question: (input) => input.question,
    },
    answerPrompt,
    createStreamingModel(selectedModel, messageCount, isAdmin, apiKeys),
  ]);

  const conversationalRetrievalQAChain = RunnableSequence.from([
    {
      question: standaloneQuestionChain,
      chat_history: (input) => input.chat_history,
    },
    answerChain,
    new BytesOutputParser(),
  ]);

  const stream = await conversationalRetrievalQAChain.stream(
    {
      question: sanitizedQuestion,
      chat_history: chatHistory,
    },
    { callbacks: CallbackManager.fromHandlers(streamCallbacks) }
  );

  const documents = await documentPromise;

  // Truncate content and limit number of documents to prevent large strings
  const truncateContent = (
    content: string,
    maxBytes: number = 1000
  ): string => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(encoder.encode(content).slice(0, maxBytes));
  };

  const limitedDocuments = documents.slice(0, 5); // Limit to 5 documents max
  const serializedSources = Buffer.from(
    JSON.stringify(
      limitedDocuments.map((doc) => {
        return {
          content: truncateContent(doc.pageContent, 1000), // Truncate to 1KB per document
          pageNumber: doc.metadata.pageNumber,
        };
      })
    )
  ).toString("base64");

  return new StreamingTextResponse(stream, {
    headers: {
      "x-message-index": (previousMessages.length + 1).toString(),
      "x-sources": serializedSources,
    },
  });
}

function getVectorStore(fileKey: string) {
  try {
    // Use the same embedding model as in indexing for consistency
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
    });
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = pinecone.index("askpdf");

    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex,
      namespace: fileKey,
    });

    return vectorStore;
  } catch (err) {
    logger.error("Error while getting vector store", {
      error: err,
    });
    throw err;
  }
}
