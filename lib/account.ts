import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { subscriptions } from "./db/schema";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export async function checkSubscription() {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

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
}

export const checkAdmin = () => {
  const { sessionClaims } = auth();
  return sessionClaims?.metadata.role === "admin";
};
