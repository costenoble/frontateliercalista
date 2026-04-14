
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Plus, Minus, Loader2, MapPin } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAlterationCart } from '@/hooks/useAlterationCart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { validateEmail, validateName, validateItems, formatCheckoutPayload } from '@/utils/checkoutValidation';
import { formatCurrency } from '@/api/EcommerceApi';
import { createCheckoutSession } from '@/services/checkoutService';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { cartItems: productItems, removeFromCart: removeProduct, updateQuantity: updateProductQty, getCartTotal: getProductTotal } = useCart();
  const { cartItems: alterationItems, removeArticle: removeAlteration, updateQuantity: updateAlterationQty } = useAlterationCart();

  const totalItems = productItems.length + alterationItems.length;

  const derivedClientInfo = alterationItems.find(item => item.clientInfo)?.clientInfo;
  const derivedName = derivedClientInfo ? `${derivedClientInfo.firstName || ''} ${derivedClientInfo.lastName || ''}`.trim() : '';
  const derivedEmail = derivedClientInfo?.email || '';

  const handleCheckout = useCallback(async () => {
    const itemsValidation = validateItems([...productItems, ...alterationItems]);
    if (!itemsValidation.valid) {
      toast({ title: 'Erreur', description: itemsValidation.error, variant: 'destructive' });
      return;
    }

    if (alterationItems.length > 0) {
      const nameValidation = validateName(derivedName);
      if (!nameValidation.valid) {
        toast({ title: 'Informations manquantes', description: 'Veuillez renseigner vos informations client (Étape 4) pour les retouches.', variant: 'destructive' });
        return;
      }

      const emailValidation = validateEmail(derivedEmail);
      if (!emailValidation.valid) {
        toast({ title: 'Email manquant', description: 'Veuillez renseigner un email valide (Étape 4) pour les retouches.', variant: 'destructive' });
        return;
      }
    }

    setIsLoading(true);
    try {
      const selectedCollectionPoint = alterationItems.find(item => item.collectionPointId)?.collectionPointId || 
                                      alterationItems.find(item => item.collectionPoint?.id)?.collectionPoint?.id || 
                                      alterationItems.find(item => item.collection_point_id)?.collection_point_id ||
                                      '';

      const payload = formatCheckoutPayload(
        derivedName, 
        derivedEmail, 
        productItems, 
        alterationItems, 
        selectedCollectionPoint, 
        null
      );

      const json = await createCheckoutSession({
        ...payload,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: window.location.href,
      });

      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || "Session de paiement introuvable.");
      }
    } catch (error) {
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Problème lors de l\'initialisation.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [productItems, alterationItems, derivedName, derivedEmail, toast]);

  const combinedTotalStr = (() => {
    const pTotal = parseFloat((getProductTotal() || "0").toString().replace(/[^0-9.-]+/g, "")) || 0;
    
    // Calculate reliable alteration total by iterating services array
    const aTotal = alterationItems.reduce((total, item) => {
      let itemBaseCost = 0;
      if (Array.isArray(item.services) && item.services.length > 0) {
        itemBaseCost = item.services.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
      } else {
        itemBaseCost = Number(item.baseUnitCost) || (Number(item.totalCost) / (Number(item.quantity) || 1)) || 0;
      }
      return total + (itemBaseCost * (Number(item.quantity) || 1));
    }, 0);

    return formatCurrency(Math.round((pTotal + aTotal) * 100), { currencyCode: 'EUR' });
  })();

  const hasOnlyAlterationItems = productItems.length === 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-light text-foreground">Panier</h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                <X />
              </Button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              {totalItems === 0 ? (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <ShoppingCartIcon size={48} className="mb-4 opacity-50" />
                  <p>0 articles dans le panier.</p>
                  <Button asChild variant="link" className="mt-4" onClick={() => setIsCartOpen(false)}>
                    <Link to="/alterations">Découvrir nos services</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {productItems.map(item => (
                    <div key={item.variant.id} className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card">
                      <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-md" />
                      <div className="flex-grow">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Boutique</span>
                        <h3 className="font-medium text-card-foreground leading-tight">{item.product.title}</h3>
                        {item.variant.title && <p className="text-sm text-muted-foreground">{item.variant.title}</p>}
                        <p className="text-sm text-card-foreground font-medium mt-1">
                          {item.variant.sale_price_formatted || item.variant.price_formatted}
                        </p>
                        <div className="flex items-center border border-border rounded-full mt-3 w-fit">
                          <Button onClick={() => updateProductQty(item.variant.id, item.quantity - 1)} size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Minus size={14} /></Button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <Button onClick={() => updateProductQty(item.variant.id, item.quantity + 1)} size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Plus size={14} /></Button>
                        </div>
                      </div>
                      <Button onClick={() => removeProduct(item.variant.id)} size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full">
                        <X size={16} />
                      </Button>
                    </div>
                  ))}

                  {alterationItems.map(item => {
                    const isRep = item.type === 'Réparation';
                    const quantity = Number(item.quantity) || 1;
                    
                    let itemBaseCost = 0;
                    if (Array.isArray(item.services) && item.services.length > 0) {
                      itemBaseCost = item.services.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
                    } else {
                      itemBaseCost = Number(item.baseUnitCost) || (Number(item.totalCost) / quantity) || 0;
                    }
                    const itemTotalCost = itemBaseCost * quantity;
                    const locationName = item.collection_point_name || item.locationType || 'Non spécifié';

                    return (
                    <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card">
                      {item.photo ? (
                        <img src={item.photo} alt="Aperçu" className="w-20 h-20 object-cover rounded-md" />
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                           <ShoppingCartIcon className="text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div className="flex-grow">
                        <span className="text-[10px] uppercase text-primary font-semibold tracking-wider">{item.type}</span>
                        <h3 className="font-medium text-card-foreground leading-tight">
                          {isRep ? 'Réparation standard' : item.services?.map(s => s.service_name).join(', ')}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-[120px]">{locationName}</span>
                        </div>
                        {!isRep && itemTotalCost != null && (
                          <p className="text-sm text-card-foreground font-medium mt-1">
                            {formatCurrency(Math.round(itemTotalCost * 100), { currencyCode: 'EUR' })}
                          </p>
                        )}
                        <div className="flex items-center border border-border rounded-full mt-3 w-fit">
                          <Button onClick={() => updateAlterationQty(item.id, item.quantity - 1)} size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Minus size={14} /></Button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <Button onClick={() => updateAlterationQty(item.id, item.quantity + 1)} size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Plus size={14} /></Button>
                        </div>
                      </div>
                      <Button onClick={() => removeAlteration(item.id)} size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full">
                        <X size={16} />
                      </Button>
                    </div>
                  )})}
                </>
              )}
            </div>
            
            {totalItems > 0 && (
              <div className="p-6 border-t border-border bg-background pb-[80px]">
                <div className="flex justify-between items-center mb-4 text-foreground">
                  <span className="text-lg font-medium">Sous-total</span>
                  <span className="text-2xl font-medium">{combinedTotalStr}</span>
                </div>
                <Button onClick={handleCheckout} disabled={isLoading || totalItems === 0} className="w-full rounded-full py-6 text-base">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Procéder au paiement
                </Button>
                <div className="mt-4 text-center">
                  <Button asChild variant="link" className="text-xs text-muted-foreground" onClick={() => setIsCartOpen(false)}>
                     <Link to="/cart">Voir le panier détaillé</Link>
                  </Button>
                </div>
                {hasOnlyAlterationItems && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Paiement gere par le backend existant.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;
