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

const normalizeType = (value?: string) =>
  value === "Réparation" ? "Réparation" : "Ajustement";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { success: false, error: "Method Not Allowed" });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return json(401, { success: false, error: "Missing Authorization header" });
    }

    const {
      name,
      service,
      articleName,
      type,
      category_id,
      categoryId,
      price,
      amount,
      unit_amount,
      existing_product_id,
      stripe_product_id,
    } = await request.json();

    const articleType = normalizeType(type);
    const resolvedName = String(name || service || articleName || "").trim();
    const resolvedCategoryId = category_id || categoryId || null;
    const numericPrice = Number(price ?? amount ?? unit_amount);

    if (!resolvedName) {
      return json(400, { success: false, error: "Validation Error: 'name' is required." });
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return json(400, { success: false, error: "Validation Error: 'price' must be greater than 0." });
    }

    if (articleType === "Ajustement" && !resolvedCategoryId) {
      return json(400, {
        success: false,
        error: "Validation Error: 'category_id' is required when service type is 'Ajustement'.",
      });
    }

    const productId = String(existing_product_id || stripe_product_id || "").trim();

    const product = productId
      ? await stripe.products.update(productId, {
          name: resolvedName,
          metadata: {
            type: articleType,
            category_id: resolvedCategoryId ?? "",
          },
        })
      : await stripe.products.create({
          name: resolvedName,
          metadata: {
            type: articleType,
            category_id: resolvedCategoryId ?? "",
          },
        });

    const priceObject = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(numericPrice * 100),
      currency: "eur",
      metadata: {
        type: articleType,
        category_id: resolvedCategoryId ?? "",
      },
    });

    return json(200, {
      success: true,
      product_id: product.id,
      price_id: priceObject.id,
      article: {
        stripe_product_id: product.id,
        stripe_price_id: priceObject.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json(500, {
      success: false,
      error: message,
    });
  }
});
