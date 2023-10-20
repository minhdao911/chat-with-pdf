import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

let openai: OpenAIApi | null = null;

export const getOpenAIApi = () => {
  if (!openai) {
    openai = new OpenAIApi(config);
  }
  return openai;
};
