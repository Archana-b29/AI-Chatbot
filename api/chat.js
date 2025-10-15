// File: api/chat.js — Google Gemini free version
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Read body safely
    let raw = "";
    await new Promise((resolve, reject) => {
      req.on("data", chunk => (raw += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const { message } = JSON.parse(raw || "{}");
    if (!message) return res.status(400).json({ error: "Message missing!" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing Gemini API key!" });

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Sunny, a cheerful kindergarten helper 🌞. Reply to kids in short, simple, happy sentences with emojis. 
User: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await resp.json();
    console.log("Gemini Raw:", JSON.stringify(data, null, 2));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(" ") ||
      "I couldn't think of anything right now 🌞";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Something went wrong!" });
  }
}
