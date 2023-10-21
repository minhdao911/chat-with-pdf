import Stripe from "stripe";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.STRIPE_API_SECRET_KEY!;
console.log("apiKey", apiKey);

export const stripe = new Stripe(apiKey, {
  apiVersion: "2023-10-16",
  typescript: true,
});
