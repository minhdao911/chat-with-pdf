import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import { logger } from "./logger";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = await pinecone.Index("askpdf");

  try {
    // const namespace = index.namespace(convertToAscii(fileKey));
    const queryResult = await index.query({
      topK: 5,
      vector: embeddings,
      filter: {
        fileKey: { $eq: convertToAscii(fileKey) },
      },
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (err) {
    logger.error("Error querying embeddings", {
      error: err,
    });
    throw err;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  return docs.join("\n").substring(0, 3000);
}
