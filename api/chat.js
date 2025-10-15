// File: api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = await req.json();

    // Safety filter (block personal data requests)
    const sensitivePattern = /(address|phone|contact|email|personal\s+info|location)/i;
    if (sensitivePattern.test(message)) {
      return res.json({ reply: "Let's talk about learning fun things instead!" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cost-effective, fast GPT-4 variant
      messages: [
        {
          role: "system",
          content: `You are Sunny, a friendly kindergarten assistant. Speak in short, cheerful sentences.`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}