import { NextResponse } from "next/server";
import {
  checkSubscription,
  ensureUserExists,
  getUserMetadata,
  getUserSettings,
} from "@lib/account";
import { auth } from "@clerk/nextjs/server";
import { db } from "@lib/db";
import { eq, desc } from "drizzle-orm";
import { chats } from "@lib/db/schema";
import { logger } from "@lib/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUserExists();
    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));
    const hasValidSubscription = await checkSubscription();
    const userMetadata = await getUserMetadata();
    const userSettings = await getUserSettings();
    const isAdmin = userMetadata?.role === "admin";
    const safeChats = _chats.map((d) => ({
      ...d,
      createdAt: d.createdAt.toUTCString(),
    }));

    return NextResponse.json({
      chats: safeChats,
      isSubscribed: hasValidSubscription,
      isAdmin,
      messageCount: userSettings?.messageCount || 0,
      freeChats: userSettings?.freeChats || 0,
      freeMessages: userSettings?.freeMessages || 0,
    });
  } catch (error) {
    logger.error("Error initializing user:", {
      error: error,
      userId,
    });
    return NextResponse.json(
      { error: "Failed to initialize user" },
      { status: 500 }
    );
  }
}
