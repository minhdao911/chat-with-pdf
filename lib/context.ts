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
    const queryResult = await index.query({
      topK: 10, // Increase to get more candidates
      vector: embeddings,
      filter: {
        fileKey: { $eq: convertToAscii(fileKey) },
        // Filter out very short chunks
        chunkLength: { $gte: 50 },
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
  const queryEmbeddings = await getEmbeddings(query.trim());
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  // Improved filtering with adaptive threshold and quality checks
  const qualifyingDocs = matches
    .filter((match) => {
      // Adaptive threshold: start with 0.6, but ensure we get at least 2 matches
      const minScore = matches.length > 5 ? 0.65 : 0.6;
      return match.score && match.score > minScore;
    })
    .slice(0, 6) // Limit to top 6 matches
    .sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending

  type Metadata = {
    text: string;
    pageNumber: number;
    chunkLength: number;
    preview: string;
  };

  if (qualifyingDocs.length === 0) {
    logger.warn(
      `No qualifying documents found for query: ${query.substring(0, 50)}...`
    );
    // Fallback: return top 2 matches regardless of score
    const fallbackDocs = matches.slice(0, 2);
    const docs = fallbackDocs.map((match) => (match.metadata as Metadata).text);
    return docs.join("\n\n").substring(0, 4000);
  }

  // Deduplicate similar chunks based on preview
  const uniqueDocs = [];
  const seenPreviews = new Set();

  for (const match of qualifyingDocs) {
    const metadata = match.metadata as Metadata;
    const preview =
      metadata.preview?.substring(0, 50) || metadata.text.substring(0, 50);

    if (!seenPreviews.has(preview)) {
      seenPreviews.add(preview);
      uniqueDocs.push(match);
    }
  }

  const docs = uniqueDocs.map((match) => {
    const metadata = match.metadata as Metadata;
    return `[Page ${metadata.pageNumber}] ${metadata.text}`;
  });

  return docs.join("\n\n").substring(0, 5000); // Increased context size
}
