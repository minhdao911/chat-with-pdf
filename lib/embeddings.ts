import { logger } from "./logger";
import { getOpenAIApi } from "./openai";

const openai = getOpenAIApi();

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input: text,
    });
    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (err) {
    logger.error("Error calling openai embedding api", {
      error: err,
    });
    throw err;
  }
}
