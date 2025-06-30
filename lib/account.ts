"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  app_settings,
  chats,
  feature_flags,
  messages,
  subscriptions,
  user_settings,
  users,
  UserSettings,
} from "./db/schema";
import { AppSettings, FeatureFlags } from "@types";
import { logger } from "./logger";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function checkSubscription() {
  try {
    const { userId } = auth();
    if (!userId) return false;

    const _subscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    if (_subscriptions.length === 0) {
      return false;
    }

    const subscription = _subscriptions[0];
    const isValid =
      subscription.stripePriceId &&
      subscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
    return !!isValid;
  } catch (err) {
    logger.error("Error checking subscription:", {
      error: err,
    });
    return false;
  }
}

export const getUserMetadata = async () => {
  try {
    const { sessionClaims } = auth();
    return sessionClaims?.metadata;
  } catch (err) {
    logger.error("Error getting user metadata:", {
      error: err,
    });
    return null;
  }
};

export const getFeatureFlags = async (): Promise<Record<
  FeatureFlags,
  boolean
> | null> => {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const flags = await db.select().from(feature_flags);
    return flags.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.flag as FeatureFlags]: curr.enabled,
      };
    }, {} as any);
  } catch (err) {
    logger.error("Error getting feature flags:", {
      error: err,
    });
    return null;
  }
};

export const getAppSettings = async (): Promise<Record<
  AppSettings,
  string
> | null> => {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const settings = await db.select().from(app_settings);
    return settings.reduce((acc, curr) => {
      return { ...acc, [curr.name as AppSettings]: curr.value };
    }, {} as any);
  } catch (err) {
    logger.error("Error getting app settings:", {
      error: err,
    });
    return null;
  }
};

export const ensureUserExists = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    logger.debug("Ensuring user exists", {
      userId: user.id,
    });

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // User doesn't exist, create them
    logger.info("Creating user in database:", {
      user: user.id,
    });

    const newUser = await db
      .insert(users)
      .values({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      })
      .returning();

    // Get app settings for defaults
    const settings = await db.select().from(app_settings);
    const userChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, user.id));
    const userMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          inArray(
            messages.chatId,
            userChats.map((chat) => chat.id)
          ),
          eq(messages.role, "user")
        )
      );

    // Create user settings with defaults
    await db.insert(user_settings).values({
      userId: user.id,
      messageCount: userMessages.length,
      freeChats: Number(
        settings.find((s) => s.name === "free_chats")?.value || 0
      ),
      freeMessages: Number(
        settings.find((s) => s.name === "free_messages")?.value || 0
      ),
    });

    return newUser[0];
  } catch (err) {
    logger.error("Error ensuring user exists:", {
      error: err,
    });
    return null;
  }
};

export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const settings = await db
      .select()
      .from(user_settings)
      .where(eq(user_settings.userId, userId));

    return settings[0] || null;
  } catch (err) {
    logger.error("Error getting user settings:", {
      error: err,
    });
    return null;
  }
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  try {
    const { userId } = auth();
    if (!userId) return;

    await db
      .update(user_settings)
      .set(settings)
      .where(eq(user_settings.userId, userId));
  } catch (err) {
    logger.error("Error updating user settings:", {
      error: err,
    });
  }
};
