import { OpenAIService, ValidationError } from "./openai-service";

let openAIService: OpenAIService | null = null;

// Degoog calls this when the plugin is loaded
export async function init(ctx: any) {
  console.log("🦆 Initializing DuckAI Plugin...");
  openAIService = new OpenAIService(ctx.storage);
  await openAIService.initialize();
  console.log("✅ DuckAI Plugin ready.");
}

// Degoog calls this when the plugin is disabled/removed
export async function cleanup(ctx: any) {
  console.log("🛑 DuckAI Plugin stopped.");
}

// Helper to format OpenAI-compatible errors
function handleError(error: any): Response {
  let statusCode = 500;
  let errorType = "internal_server_error";
  let errorMessage = "An unexpected server error occurred";

  if (error instanceof ValidationError) {
    statusCode = 400; errorType = "invalid_request_error"; errorMessage = error.message;
  } else if (error.message && (error.message.includes("Rate limited") || error.message.includes("418") || error.message.includes("429"))) {
    statusCode = 429; errorType = "rate_limit_error"; errorMessage = "Rate limit exceeded.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return new Response(JSON.stringify({ error: { message: errorMessage, type: errorType } }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

export const routes = [
  {
    method: "POST",
    path: "/v1/chat/completions",
    handler: async (req: Request, ctx: any) => {
      try {
        if (!openAIService) throw new Error("Service not initialized");
        const body = await req.json();
        const validatedRequest = openAIService.validateRequest(body);

        if (validatedRequest.stream) {
          const stream = await openAIService.createChatCompletionStream(validatedRequest);
          return new Response(stream, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
          });
        }

        const completion = await openAIService.createChatCompletion(validatedRequest);
        return new Response(JSON.stringify(completion), { headers: { "Content-Type": "application/json" } });
      } catch (error) {
        return handleError(error);
      }
    }
  },
  {
    method: "GET",
    path: "/v1/models",
    handler: async (req: Request, ctx: any) => {
      try {
        if (!openAIService) throw new Error("Service not initialized");
        const models = openAIService.getModels();
        return new Response(JSON.stringify(models), { headers: { "Content-Type": "application/json" } });
      } catch (error) {
        return handleError(error);
      }
    }
  }
];
