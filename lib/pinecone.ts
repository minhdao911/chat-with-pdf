import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { logger } from "./logger";

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
  chunkLength: number;
  preview: string;
};

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // 1. obtain the pdf
    logger.debug("Downloading s3 into file system");
    const fileName = await downloadFromS3(fileKey);
    if (!fileName) {
      throw new Error("Could not download from s3: " + fileKey);
    }

    const loader = new PDFLoader(fileName);
    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the pdf into smaller documents
    // Improved chunking strategy for better context preservation
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Larger chunks for better context
      chunkOverlap: 200, // More overlap to preserve context across chunks
      separators: ["\n\n", "\n", ".", "!", "?", ";"], // More granular separators
      keepSeparator: true, // Keep separators to maintain text structure
    });

    let documents = await textSplitter.splitDocuments(pages);
    documents = documents.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        fileKey: convertToAscii(fileKey),
      },
    }));

    // 3. vectorize and embed individual documents
    const vectorPromises = await Promise.all(
      documents.flat().map((d) => embedDocument(d as PDFPage, fileKey))
    );

    // Filter out null values (skipped short chunks)
    const vectors = vectorPromises.filter(
      (vector): vector is PineconeRecord<RecordMetadata> => vector !== null
    );

    // 4. upload to pinecone
    const client = await getPineconeClient();
    const pineconeIndex = client.index("askpdf").namespace(fileKey);

    logger.debug("Inserting vectors into pinecone");

    await pineconeIndex.upsert(vectors);

    logger.debug("Success inserting vectors to pinecone");
  } catch (err) {
    logger.error("Error inserting vectors to pinecone:", {
      fileKey,
      error: err,
    });
    throw err;
  }
}

async function embedDocument(
  doc: PDFPage,
  fileKey: string
): Promise<PineconeRecord<RecordMetadata> | null> {
  // Clean and preprocess text for better embeddings
  const cleanedText = doc.pageContent
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s\.\,\!\?\;\:]/g, "") // Remove special characters that don't add meaning
    .trim();

  // Skip very short chunks that don't have meaningful content
  if (cleanedText.length < 50) {
    logger.debug(`Skipping short chunk: ${cleanedText.substring(0, 30)}...`);
    return null;
  }

  const embeddings = await getEmbeddings(cleanedText);
  const hash = md5(cleanedText);

  return {
    id: fileKey + "#" + hash,
    values: embeddings,
    metadata: {
      text: truncateStringByByte(cleanedText, 36000),
      pageNumber: doc.metadata.loc?.pageNumber || 0,
      fileKey: convertToAscii(fileKey),
      chunkLength: cleanedText.length,
      // Add chunk summary for better filtering
      preview: cleanedText.substring(0, 100),
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
    logger.debug("Success deleting vectors", fileKey);
  } catch (err) {
    logger.error("Error deleting vectors:", {
      fileKey,
      error: err,
    });
    throw err;
  }
}
