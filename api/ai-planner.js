export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({
      error: "Method not allowed",
    });
  }

  const { input } = request.body || {};

  if (
    typeof input !== "string" ||
    input.trim().length < 20 ||
    input.length > 5000
  ) {
    return response.status(400).json({
      error: "Input must contain 20–5000 characters",
    });
  }

  if (!process.env.N8N_AI_WEBHOOK_URL || !process.env.N8N_AI_WEBHOOK_SECRET) {
    return response.status(503).json({ error: "AI service not configured" });
  }

  try {
    const n8nResponse = await fetch(process.env.N8N_AI_WEBHOOK_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-pfev-secret": process.env.N8N_AI_WEBHOOK_SECRET,
      },

      body: JSON.stringify({
        input: input.trim(),
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!n8nResponse.ok) {
      return response
        .status(n8nResponse.status === 429 ? 429 : 502)
        .json({ error: "Upstream service unavailable" });
    }

    const data = await n8nResponse.json();

    if (
      typeof data.plan !== "string" ||
      !data.plan.trim() ||
      data.plan.length > 60000
    ) {
      return response.status(502).json({ error: "Invalid upstream response" });
    }
    return response.status(200).json({ plan: data.plan });
  } catch (error) {
    return response.status(error.name === "TimeoutError" ? 504 : 502).json({
      error: "Unable to generate plan",
    });
  }
}
