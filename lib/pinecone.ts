import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { metadata } from "@app/layout";

let pinecone: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
    pdf: {
      totalPages: number;
    };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. Split and segment the pdf into smaller documents
  // const documents = await Promise.all(pages.map(prepareDocument));

  // From the docs https://www.pinecone.io/learn/chunking-strategies/
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
    separators: ["\n\n", "\n"],
  });

  let documents = await textSplitter.splitDocuments(pages);
  documents = documents.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      fileKey: convertToAscii(fileKey),
    },
  }));

  console.log("documents", documents);

  // 3. vetorise and embed individual documents
  // const vectors = await Promise.all(
  //   documents.flat().map((d) => embedDocument(d, fileKey))
  // );

  // 4. upload to pinecone
  console.log(`Loading ${documents.length} chunks into pinecone...`);

  await embedDocuments(documents, fileKey);

  console.log("Data embedded and stored in pinecone index");

  // const client = await getPineconeClient();
  // const pineconeIndex = client.index("askpdf");

  // console.log("inserting vectors into pinecone");

  // await pineconeIndex.upsert(vectors);
}

export async function embedDocuments(docs: Document[], fileKey: string) {
  try {
    const embeddings = new OpenAIEmbeddings();

    // const hash = md5(doc.pageContent);
    const client = await getPineconeClient();
    const index = client.index("askpdf");

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    // return {
    //   id: hash,
    //   values: embeddings,
    //   metadata: {
    //     text: doc.metadata.text,
    //     pageNumber: doc.metadata.pageNumber,
    //     fileKey: convertToAscii(fileKey),
    //   },
    // } as PineconeRecord;
  } catch (err) {
    console.error("error embedding document", err);
    throw err;
  }
}

export function truncateStringByByte(str: string, bytes: number) {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
}

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 0,
  });

  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByByte(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

export async function deleteVectors(fileKey: string) {
  try {
    const client = await getPineconeClient();
    const index = client.index("askpdf");

    await index.deleteMany({
      fileKey: { $eq: fileKey },
    });
  } catch (err) {
    console.error("error deleting vectors", err);
    throw err;
  }
}
