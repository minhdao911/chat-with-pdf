import { Pinecone } from "@pinecone-database/pinecone";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
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

const openAIApiKey = process.env.OPENAI_API_KEY;
const defaultModel = "gpt-4.1-mini";
const alternativeModel = "gpt-4o-mini";

function getModelName(messageCount: number, isAdmin: boolean): string {
  return isAdmin
    ? defaultModel
    : messageCount < 20
      ? defaultModel
      : alternativeModel;
}

function createStreamingModel(messageCount: number, isAdmin: boolean) {
  return new ChatOpenAI({
    openAIApiKey,
    modelName: getModelName(messageCount, isAdmin),
    streaming: true,
    temperature: 0,
  });
}

function createNonStreamingModel(messageCount: number, isAdmin: boolean) {
  return new ChatOpenAI({
    openAIApiKey,
    modelName: getModelName(messageCount, isAdmin),
    temperature: 0,
  });
}

type retrievalArgs = {
  question: string;
  chatHistory: string;
  previousMessages: string[];
  fileKey: string;
  isAdmin: boolean;
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
    createNonStreamingModel(messageCount, isAdmin),
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
    createStreamingModel(messageCount, isAdmin),
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
    const embeddings = new OpenAIEmbeddings();
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
