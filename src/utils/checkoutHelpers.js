
export const formatCheckoutItems = (products = [], alterations = []) => {
  const formattedItems = [];

  // Format products
  products.forEach(item => {
    // Attempt to extract stripe_price_id from the product or variant
    const stripe_price_id = item.variant?.stripe_price_id || item.variant?.id || null;
    
    formattedItems.push({
      stripe_price_id: stripe_price_id,
      quantity: Number(item.quantity) || 1,
      service_name: item.product?.title || 'Produit',
      price: item.variant?.price || 0
    });
  });

  // Format alterations
  alterations.forEach(alt => {
    // Process both Réparation and Ajustement types
    if (alt.type === 'Réparation' || alt.type === 'Ajustement') {
      (alt.services || []).forEach(service => {
        // Use service's stripe_price_id, fallback to its ID if strictly mapped that way
        const stripe_price_id = service.stripe_price_id || service.id || null;
        
        formattedItems.push({
          stripe_price_id: stripe_price_id,
          quantity: Number(alt.quantity) || 1,
          service_name: service.service_name || alt.type,
          price: service.price || 0
        });
      });
    }
  });

  return formattedItems;
};
