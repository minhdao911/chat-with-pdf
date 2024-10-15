import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET!
    );
  } catch (err) {
    console.error("stripe webhook error", err);
    return new NextResponse("webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // new subcription created
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    if (!session.metadata?.userId) {
      console.error("stripe webhook error: no userid");
      return new NextResponse("no userid", { status: 400 });
    }
    await db.insert(subscriptions).values({
      userId: session.metadata.userId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  // invoice payment succeed
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    await db
      .update(subscriptions)
      .set({
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }

  return new NextResponse(null, { status: 200 });
}
