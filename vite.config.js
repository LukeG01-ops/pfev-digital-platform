import { defineConfig, loadEnv } from "vite";
import handler from "./api/ai-planner.js";

// Run the same Vercel handler in development. No credentials enter the bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "N8N_");
  for (const key of ["N8N_AI_WEBHOOK_URL", "N8N_AI_WEBHOOK_SECRET"]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [
      {
        name: "local-vercel-api",
        configureServer(server) {
          server.middlewares.use(
            "/api/ai-planner",
            async (request, response) => {
              response.status = (code) => {
                response.statusCode = code;
                return response;
              };
              response.json = (data) => {
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify(data));
                return response;
              };
              if (request.method !== "POST") return handler(request, response);
              try {
                let body = "";
                for await (const chunk of request) {
                  body += chunk;
                  if (body.length > 30000)
                    return response
                      .status(413)
                      .json({ error: "Request too large" });
                }
                request.body = JSON.parse(body || "{}");
                await handler(request, response);
              } catch {
                response.status(400).json({ error: "Invalid JSON" });
              }
            },
          );
        },
      },
    ],
  };
});
