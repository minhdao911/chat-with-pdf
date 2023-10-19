import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text,
    });
    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (err) {
    console.error("error calling openai embedding api", err);
    throw err;
  }
}
