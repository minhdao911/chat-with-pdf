import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const returnUrl = process.env.NEXT_BASE_URL;
const priceId = process.env.STRIPE_PRICE_ID;

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("unauthorized", { status: 401 });
    }

    const _userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId,
        return_url: returnUrl,
      });
      return NextResponse.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: returnUrl,
      cancel_url: returnUrl,
      metadata: {
        userId: user.id,
      },
    });
    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error("error when creating checkout session", err);
    return new NextResponse("internal server error", { status: 500 });
  }
}
