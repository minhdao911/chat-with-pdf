import { logger } from "@lib/logger";
import { Client } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().then(() => {
  // Listen for changes on the 'table_changes' channel
  client.query("LISTEN table_changes");
  logger.debug("Listening for database changes...");
});

// Prevents this route's response from being cached on Vercel
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      // Set up a heartbeat to keep the connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(`data: heartbeat\n\n`);
      }, 30000); // Every 30 seconds

      client.on("notification", (msg) => {
        logger.debug("Table change detected:", msg.payload);
        try {
          controller.enqueue(`data: ${msg.payload}\n\n`);
        } catch (error) {
          logger.error("Error enqueuing data:", {
            error,
          });
        }
      });

      req.signal.addEventListener("abort", () => {
        logger.debug("sse abort");
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  // Set response headers for SSE
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
