import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
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
    console.log("BODY →", body); // 👈 log message content
    console.log("API_KEY set →", !!process.env.OPENAI_API_KEY); // 👈 log if key exists

    if (!message) {
      console.log("No message in body");
      return res.status(400).json({ reply: "Message missing!" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Sunny, a friendly kindergarten helper. Reply in short, cheerful sentences with emojis sometimes.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const reply =
        completion.choices?.[0]?.message?.content ??
        "I couldn’t think of anything right now 🌞";
      console.log("✅ GPT reply ok");
      return res.status(200).json({ reply });
    } catch (apiErr) {
      console.error("❌ OpenAI API error →", apiErr);
      return res
        .status(500)
        .json({ reply: "OpenAI API failed — check key or model name." });
    }
  } catch (err) {
    console.error("Chat error →", err);
    return res
      .status(500)
      .json({ reply: "Oops! Sunny is taking a nap. 💤" });
  }
}
