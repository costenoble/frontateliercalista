import { createBackendCheckoutSession } from "@/services/backendApi";

export const createCheckoutSession = async (payload) =>
  createBackendCheckoutSession(payload);
