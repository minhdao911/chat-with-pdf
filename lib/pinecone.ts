import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

let pinecone: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
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

type RecordMetadata = {
  text: string;
  pageNumber: number;
  fileKey: string;
};

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // 1. obtain the pdf
    console.log("downloading s3 into file system");
    const file_name = await downloadFromS3(fileKey);
    if (!file_name) {
      throw new Error("could not download from s3");
    }

    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the pdf into smaller documents
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

    // 3. vetorise and embed individual documents
    const vectors = await Promise.all(
      documents.flat().map((d) => embedDocument(d as PDFPage, fileKey))
    );

    // 4. upload to pinecone
    const client = await getPineconeClient();
    const pineconeIndex = client.index("askpdf").namespace(fileKey);

    console.log("inserting vectors into pinecone");

    await pineconeIndex.upsert(vectors);

    console.log("success inserting vectors to pinecone");
  } catch (err) {
    console.error("error inserting vectors to pinecone");
    throw err;
  }
}

async function embedDocument(
  doc: PDFPage,
  fileKey: string
): Promise<PineconeRecord<RecordMetadata>> {
  const embeddings = await getEmbeddings(doc.pageContent);
  const hash = md5(doc.pageContent);

  return {
    id: fileKey + "#" + hash,
    values: embeddings,
    metadata: {
      text: truncateStringByByte(doc.pageContent, 36000),
      pageNumber: doc.metadata.loc.pageNumber,
      fileKey: convertToAscii(fileKey),
    },
  };
}

export function truncateStringByByte(str: string, bytes: number) {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
}

export async function deleteVectors(fileKey: string) {
  try {
    const client = await getPineconeClient();
    const index = client.index("askpdf").namespace(fileKey);
    const prefix = fileKey + "#";

    const pageOneList = await index.listPaginated({ prefix });
    const pageOneVectorIds =
      pageOneList.vectors?.map((vector) => vector.id) ?? [];
    if (pageOneVectorIds.length > 0) await index.deleteMany(pageOneVectorIds);

    let paginationToken = pageOneList.pagination?.next;

    while (paginationToken) {
      const nextPageList = await index.listPaginated({
        prefix,
        paginationToken,
      });
      const nextPageVectorIds =
        nextPageList.vectors?.map((vector) => vector.id) ?? [];
      if (nextPageVectorIds.length > 0)
        await index.deleteMany(nextPageVectorIds);
      else break;
      paginationToken = nextPageList.pagination?.next;
    }
  } catch (err) {
    console.error("error deleting vectors", err);
    throw err;
  }
}
