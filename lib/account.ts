"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { feature_flags, subscriptions } from "./db/schema";
import { FeatureFlags } from "@constants";

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

export const checkAdmin = async () => {
  try {
    const { sessionClaims } = auth();
    return sessionClaims?.metadata.role === "admin";
  } catch (err) {
    return false;
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
