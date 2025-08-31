import { db } from "@/lib/db";
import {
  app_settings,
  chats,
  messages,
  sources,
  user_settings,
  users,
} from "@/lib/db/schema";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { logger } from "@lib/logger";
import { deleteVectors } from "@lib/pinecone";
import { removeFileFromS3 } from "@lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing Clerk webhook secret");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Error verifying clerk webhook:", {
      error: err,
    });
    return new Response("Error occured", {
      status: 400,
    });
  }

  try {
    const eventType = evt.type;
    if (eventType === "user.created") {
      logger.debug("User created event received");
      await db
        .insert(users)
        .values({
          id: evt.data.id, // Store Clerk user ID directly in id field
          email: evt.data.email_addresses[0].email_address,
          name: evt.data.first_name + " " + evt.data.last_name,
        })
        .returning();

      const settings = await db.select().from(app_settings);

      await db.insert(user_settings).values({
        userId: evt.data.id,
        messageCount: 0,
        freeChats: Number(
          settings.find((s) => s.name === "free_chats")?.value || 0
        ),
        freeMessages: Number(
          settings.find((s) => s.name === "free_messages")?.value || 0
        ),
      });

      logger.debug("User created in database:", {
        user: evt.data.id,
      });

      return new NextResponse("User created successfully", { status: 201 });
    }
    if (eventType === "user.deleted") {
      logger.debug("User deleted event received");
      if (evt.data.id) {
        const userChats = await db
          .select()
          .from(chats)
          .where(eq(chats.userId, evt.data.id));

        if (userChats.length > 0) {
          // delete pdf files
          await Promise.all(
            userChats.map((chat) => {
              return removeFileFromS3(chat.fileKey);
            })
          );
          await Promise.all(
            userChats.map((chat) => {
              return deleteVectors(chat.fileKey);
            })
          );

          // delete user chats
          await db.delete(messages).where(
            inArray(
              messages.chatId,
              userChats.map((chat) => chat.id)
            )
          );
          await db.delete(sources).where(
            inArray(
              sources.chatId,
              userChats.map((chat) => chat.id)
            )
          );
          await db.delete(chats).where(eq(chats.userId, evt.data.id));
        }

        await db
          .delete(user_settings)
          .where(eq(user_settings.userId, evt.data.id));
        await db.delete(users).where(eq(users.id, evt.data.id));

        logger.debug("User deleted from database:", {
          user: evt.data.id,
        });
      }

      return new NextResponse("User deleted successfully", { status: 200 });
    }
  } catch (err) {
    logger.error("Error in clerk webhook:", {
      error: err,
    });
    return new NextResponse("Error in clerk webhook", { status: 500 });
  }
}
