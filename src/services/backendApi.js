import { supabase } from "@/lib/customSupabaseClient";

const DEFAULT_BACKEND_ORIGIN = "https://ateliercalista.store";
const rawBackendUrl =
  import.meta.env.VITE_BACKEND_API_URL || DEFAULT_BACKEND_ORIGIN;
const normalizedBackendUrl = rawBackendUrl.replace(/\/+$/, "");

export const BACKEND_API_URL = normalizedBackendUrl.endsWith("/api")
  ? normalizedBackendUrl
  : `${normalizedBackendUrl}/api`;

const REPAIR_CATEGORY_LABELS = ["réparation", "reparation"];

const normalizeString = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const isRepairCategory = (category) =>
  REPAIR_CATEGORY_LABELS.includes(normalizeString(category));

const parseJsonSafely = async (response) => {
  const rawText = await response.text();

  if (!rawText) return {};

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("La reponse du serveur n'est pas un JSON valide.");
  }
};

const fetchBackend = async (path, payload) => {
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.error || `Erreur serveur (${response.status})`);
  }

  return data;
};

export const createBackendProduct = async ({ category, service, price }) =>
  fetchBackend("/create-product", { category, service, price });

export const updateBackendProduct = async ({
  service_id,
  category,
  service,
  price,
  stripe_product_id,
  stripe_price_id,
}) =>
  fetchBackend("/update-product", {
    service_id,
    category,
    service,
    price,
    stripe_product_id,
    stripe_price_id,
  });

export const deleteBackendProduct = async ({ service_id, stripe_product_id }) =>
  fetchBackend("/delete-product", { service_id, stripe_product_id });

export const createBackendCheckoutSession = async (payload) =>
  fetchBackend("/create-checkout-session", payload);

export const normalizeAlterationPrice = (row, categories = []) => {
  const categoryName = row?.category || "";
  const matchedCategory =
    categories.find(
      (category) => normalizeString(category.name) === normalizeString(categoryName),
    ) || null;

  const isRepair = isRepairCategory(categoryName);

  return {
    id: row?.id,
    legacy_service_id: row?.id,
    name: row?.service || "",
    service: row?.service || "",
    price: Number(row?.price) || 0,
    type: isRepair ? "Réparation" : "Ajustement",
    category_id: isRepair ? null : matchedCategory?.id || null,
    category_name: isRepair ? "Réparation" : matchedCategory?.name || categoryName || "",
    stripe_product_id: row?.stripe_product_id || null,
    stripe_price_id: row?.stripe_price_id || null,
    created_at: row?.created_at || null,
    updated_at: row?.updated_at || null,
  };
};

export const fetchAlterationCatalog = async (categories = []) => {
  const { data, error } = await supabase
    .from("alteration_prices")
    .select("*")
    .order("category")
    .order("service");

  if (error) throw error;

  return (data || []).map((row) => normalizeAlterationPrice(row, categories));
};

export const filterCatalogByType = (catalog, type) =>
  (catalog || []).filter((item) =>
    type === "Réparation" ? item.type === "Réparation" : item.type === "Ajustement",
  );
