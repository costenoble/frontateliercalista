const STRIPE_PRODUCT_KEYS = [
  "product_id",
  "productId",
  "stripe_product_id",
  "stripeProductId",
];

const STRIPE_PRICE_KEYS = [
  "price_id",
  "priceId",
  "stripe_price_id",
  "stripePriceId",
  "id",
];

const pickFirstString = (source, keys) => {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
};

export const needsStripeResync = (previousArticle, nextArticle) => {
  if (!previousArticle) return true;

  return (
    previousArticle.name?.trim() !== nextArticle.name?.trim() ||
    Number(previousArticle.price) !== Number(nextArticle.price) ||
    previousArticle.type !== nextArticle.type ||
    (previousArticle.category_id || null) !== (nextArticle.category_id || null)
  );
};

export const buildArticleStripePayload = (articleForm, existingArticle = null) => {
  const name = articleForm.name.trim();
  const price = Number(articleForm.price);
  const type = articleForm.type === "Réparation" ? "Réparation" : "Ajustement";
  const categoryId = type === "Ajustement" ? articleForm.category_id : null;

  return {
    name,
    service: name,
    articleName: name,
    price,
    amount: price,
    unit_amount: price,
    type,
    category_id: categoryId,
    categoryId,
    existing_product_id: existingArticle?.stripe_product_id || null,
    stripe_product_id: existingArticle?.stripe_product_id || null,
  };
};

export const extractStripeData = (responseData) => {
  const directProductId = pickFirstString(responseData, STRIPE_PRODUCT_KEYS);
  const directPriceId = pickFirstString(responseData, STRIPE_PRICE_KEYS);
  const nestedArticle = responseData?.article;
  const nestedData = responseData?.data;

  const stripe_product_id =
    directProductId ||
    pickFirstString(nestedArticle, STRIPE_PRODUCT_KEYS) ||
    pickFirstString(nestedData, STRIPE_PRODUCT_KEYS);

  const stripe_price_id =
    directPriceId ||
    pickFirstString(nestedArticle, STRIPE_PRICE_KEYS) ||
    pickFirstString(nestedData, STRIPE_PRICE_KEYS);

  return {
    stripe_product_id: stripe_product_id || null,
    stripe_price_id: stripe_price_id || null,
  };
};

export const syncArticleWithStripe = async (supabase, articleForm, existingArticle = null) => {
  const payload = buildArticleStripePayload(articleForm, existingArticle);
  const { data, error } = await supabase.functions.invoke("create-product", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "Erreur de synchronisation Stripe");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const stripeData = extractStripeData(data);

  if (!stripeData.stripe_price_id) {
    throw new Error("La fonction Stripe n'a pas renvoyé de stripe_price_id.");
  }

  return stripeData;
};
