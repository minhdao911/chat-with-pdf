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
    console.error("error calling openai embedding api", err);
    throw err;
  }
}
