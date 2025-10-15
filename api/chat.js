// File: api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // ✅ Manual body reader (works perfectly on Vercel)
    let raw = "";
    await new Promise((resolve, reject) => {
      req.on("data", chunk => (raw += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    let body = {};
    try {
      body = JSON.parse(raw || "{}");
    } catch {
      console.log("Failed to parse body:", raw);
    }

    const { message } = body;
    console.log("BODY →", body);
    console.log("API_KEY set →", !!process.env.OPENAI_API_KEY);

    if (!message) {
      return res.status(400).json({ error: "Message missing!" });
    }

    // 🧠 Safety filter: avoid sensitive questions
    const sensitivePattern = /(address|phone|contact|email|personal\s+info|location)/i;
    if (sensitivePattern.test(message)) {
      return res.json({ reply: "Let's talk about fun learning things instead! 🌈" });
    }

    // ✅ OpenAI API setup
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ✅ Model request
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // more reliable model name
      messages: [
        {
          role: "system",
          content: "You are Sunny, a cheerful kindergarten chatbot. Speak in short, happy sentences with emojis sometimes.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "I couldn’t think of anything right now 🌞";
    console.log("✅ GPT reply ok");
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("❌ Chat error →", err);
    res.status(500).json({ error: err.message || "Something went wrong!" });
  }
}
