import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("Missing OpenAI API key");
}

const openai = new OpenAI({
    apiKey,
});

export const aiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

export default openai;
