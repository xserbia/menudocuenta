import { respond } from "../emc-chatbot-worker.js";

const headers = { "Cache-Control": "no-store" };

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Método no disponible." }, {
        status: 405,
        headers: { ...headers, Allow: "POST" }
      });
    }

    const { CHAT_AI_ENABLED, OPENAI_API_KEY } = process.env;
    if (CHAT_AI_ENABLED !== "true" || !OPENAI_API_KEY) {
      return Response.json({ error: "La IA no está disponible en este momento." }, {
        status: 503,
        headers
      });
    }

    return respond(request, { OPENAI_API_KEY });
  }
};
