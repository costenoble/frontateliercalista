import Stripe from "https://esm.sh/stripe@15.12.0?target=deno";

import { corsHeaders } from "../_shared/cors.ts";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-04-10",
});

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { success: false, error: "Method Not Allowed" });
  }

  try {
    const {
      clientName,
      clientEmail,
      items,
      collectionPoint,
      successUrl,
      cancelUrl,
    } = await request.json();

    if (!clientName || !clientEmail) {
      return json(400, {
        success: false,
        error: "Validation Error: 'clientName' and 'clientEmail' are required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return json(400, {
        success: false,
        error: "Validation Error: at least one checkout item is required.",
      });
    }

    const invalidItem = items.find((item) => !item?.stripe_price_id || !Number(item?.quantity));
    if (invalidItem) {
      return json(400, {
        success: false,
        error: "Validation Error: every item needs a stripe_price_id and quantity.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: clientEmail,
      line_items: items.map((item) => ({
        price: item.stripe_price_id,
        quantity: Number(item.quantity) || 1,
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        client_name: clientName,
        client_email: clientEmail,
        collection_point: collectionPoint || "",
      },
    });

    return json(200, {
      success: true,
      url: session.url,
      id: session.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json(500, {
      success: false,
      error: message,
    });
  }
});
