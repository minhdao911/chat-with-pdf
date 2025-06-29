"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { app_settings, feature_flags, subscriptions } from "./db/schema";
import { AppSettings, FeatureFlags } from "@types";

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
    return false;
  }
}

export const getUserMetadata = async () => {
  try {
    const { sessionClaims } = auth();
    return sessionClaims?.metadata;
  } catch (err) {
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
    return null;
  }
};
