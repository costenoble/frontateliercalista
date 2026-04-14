
import { formatCheckoutItems } from './checkoutHelpers';

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'L\'adresse email est requise.' };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valid: false, error: 'Format d\'email invalide.' };
  }
  return { valid: true };
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Le nom est requis.' };
  }
  if (name.trim().length < 2 || name.trim().length > 100) {
    return { valid: false, error: 'Le nom doit comporter entre 2 et 100 caractères.' };
  }
  return { valid: true };
};

export const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Le panier est vide. Aucun article n\'est présent.' };
  }
  
  for (const item of items) {
    const qty = Number(item.quantity) || 1;
    if (qty < 1) {
      return { valid: false, error: 'La quantité de chaque article doit être d\'au moins 1.' };
    }
  }
  
  return { valid: true };
};

/**
 * Formats the checkout payload strictly matching backend expectations.
 * Ensures all articles have prices and quantities properly populated.
 */
export const formatCheckoutPayload = (clientName, clientEmail, productItems = [], alterationItems = [], collectionPoint, clientPhoto) => {
  const items = formatCheckoutItems(productItems, alterationItems);

  const payload = {
    clientName: clientName?.trim() || '',
    clientEmail: clientEmail?.trim() || '',
    items: items || [],
    collectionPoint: collectionPoint || '',
    clientPhoto: clientPhoto || null
  };

  return payload;
};
