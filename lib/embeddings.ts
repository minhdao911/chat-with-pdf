import { logger } from "./logger";
import { getOpenAIApi } from "./openai";

const openai = getOpenAIApi();

export async function getEmbeddings(text: string) {
  try {
    // Use text-embedding-3-small which outputs 1536 dimensions by default
    const response = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input: text.trim(),
    });
    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (err) {
    logger.error("Error calling openai embedding api", {
      error: err,
      text: text.substring(0, 100) + "...", // Log first 100 chars for debugging
    });
    throw err;
  }
}
