# KG Chatbot


Simple serverless chatbot backend (OpenAI GPT-4) for a kindergarten website. Deploy to Vercel and set OPENAI_API_KEY in environment.


## Quick start
1. Deploy to Vercel or any serverless host.
2. Set `OPENAI_API_KEY` in environment variables.
3. POST to `/api/chat` with JSON `{ "message": "Hello" }`.