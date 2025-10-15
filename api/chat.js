// File: api/chat.js — Google Gemini API version (no OpenAI required)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // ✅ Parse incoming body (works on Vercel)
    let raw = "";
    await new Promise((resolve, reject) => {
      req.on("data", chunk => (raw += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const { message } = JSON.parse(raw || "{}");
    if (!message) return res.status(400).json({ error: "Message missing!" });

    // ✅ Safety filter for personal info
    const sensitive = /(address|phone|email|contact|personal|location)/i;
    if (sensitive.test(message)) {
      return res.json({ reply: "Let's talk about fun things instead! 🌈" });
    }

    // ✅ Call Google Gemini API
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Sunny, a cheerful kindergarten chatbot 🌞. Reply in short, happy sentences with emojis sometimes.\n\nUser: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't think of anything right now 🌞";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Chat error →", err);
    return res
      .status(500)
      .json({ error: err.message || "Something went wrong!" });
  }
}
