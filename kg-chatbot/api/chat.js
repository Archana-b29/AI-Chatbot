import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = await req.json();

    // Safety filter (block personal data requests)
    if (/address|phone|contact|email/i.test(message)) {
      return res.json({ reply: "Let's talk about learning fun things instead!" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cost-effective, fast GPT-4 variant
      messages: [
        {
          role: "system",
          content: `You are Sunny, a friendly kindergarten assistant.
          Speak in short, cheerful sentences. 
          Never ask for personal information.
          If unsure, say "Let's ask your teacher!"`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    return res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ reply: "Oops! Sunny needs a quick nap. Try again later!" });
  }
}
