import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import {
  AIStreamCallbacksAndOptions,
  LangChainStream,
  StreamingTextResponse,
} from "ai";
import { CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT } from "./prompts";
import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";

const openAIApiKey = process.env.OPENAI_API_KEY;

const streamingModel = new ChatOpenAI({
  openAIApiKey,
  modelName: "gpt-3.5-turbo",
  streaming: true,
  temperature: 0,
});

const nonStreamingModel = new ChatOpenAI({
  openAIApiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0,
});

type callChainArgs = {
  question: string;
  chatHistory: string;
  fileKey: string;
  streamCallbacks?: AIStreamCallbacksAndOptions;
};

export async function callChain({
  question,
  chatHistory,
  fileKey,
  streamCallbacks,
}: callChainArgs) {
  try {
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const vectorStore = await getVectorStore(fileKey);
    const { stream, handlers } = LangChainStream(streamCallbacks);

    const chain = ConversationalRetrievalQAChain.fromLLM(
      streamingModel,
      vectorStore.asRetriever(),
      {
        memory: new BufferMemory({
          memoryKey: "chat_history",
          inputKey: "question", // The key for the input to the chain
          outputKey: "text", // The key for the final conversational output of the chain
          returnMessages: true,
        }),
        questionGeneratorChainOptions: {
          llm: nonStreamingModel,
          template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
        },
        returnSourceDocuments: true,
      }
    );

    chain.call(
      {
        question: sanitizedQuestion,
        chat_history: chatHistory,
      },
      [handlers]
    );

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("error while using callChain");
    throw err;
  }
}

async function getVectorStore(fileKey: string) {
  try {
    const embeddings = new OpenAIEmbeddings();
    const pinecone = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = pinecone.index("askpdf");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      filter: {
        fileKey: convertToAscii(fileKey),
      },
    });

    return vectorStore;
  } catch (err) {
    console.error("error while getting vector store");
    throw err;
  }
}
