
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAlterationCart } from '@/hooks/useAlterationCart';
import { formatCheckoutPayload } from '@/utils/checkoutValidation';
import { formatCurrency } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createCheckoutSession } from '@/services/checkoutService';
import { 
  ShoppingCart, Trash2, Loader2, ArrowLeft, Plus, Minus, 
  MapPin, User, CheckCircle2, Package, Scissors
} from 'lucide-react';

const CartPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { cartItems: productItems, removeFromCart: removeProduct, updateQuantity: updateProductQty, clearCart: clearProductCart, getCartTotal: getProductTotal } = useCart();
  const { cartItems: alterationItems, removeArticle: removeAlteration, updateQuantity: updateAlterationQty, clearCart: clearAlterationCart } = useAlterationCart();

  const totalItems = (productItems?.length || 0) + (alterationItems?.length || 0);

  // Reliable calculation directly from article.price and quantity
  const aTotalVal = alterationItems.reduce((total, item) => {
    let itemBaseCost = 0;
    if (Array.isArray(item.services) && item.services.length > 0) {
      itemBaseCost = item.services.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
    } else {
      itemBaseCost = Number(item.baseUnitCost) || (Number(item.totalCost) / (Number(item.quantity) || 1)) || 0;
    }
    return total + (itemBaseCost * (Number(item.quantity) || 1));
  }, 0);

  const pTotalVal = parseFloat((getProductTotal() || "0").toString().replace(/[^0-9.-]+/g, "")) || 0;
  const combinedTotal = pTotalVal + aTotalVal;

  useEffect(() => {
    console.log('Cart Items:', { productItems, alterationItems });
    console.log('Services Total Price:', aTotalVal);
    console.log('Combined Total Price:', combinedTotal);
  }, [productItems, alterationItems, aTotalVal, combinedTotal]);

  const derivedClientInfo = alterationItems.find(item => item.clientInfo)?.clientInfo;
  const derivedName = derivedClientInfo ? `${derivedClientInfo.firstName || ''} ${derivedClientInfo.lastName || ''}`.trim() : '';
  const derivedEmail = derivedClientInfo?.email || '';

  const handleClearAll = () => {
    clearProductCart();
    clearAlterationCart();
  };

  const handleCheckout = async () => {
    const derivedPhoto = alterationItems.find(item => item.photo)?.photo || null;
    const selectedCollectionPoint = alterationItems.find(item => item.collectionPointId)?.collectionPointId || 
                                    alterationItems.find(item => item.collectionPoint?.id)?.collectionPoint?.id || 
                                    alterationItems.find(item => item.collection_point_id)?.collection_point_id ||
                                    '';

    const finalPayload = formatCheckoutPayload(
      derivedName,
      derivedEmail,
      productItems,
      alterationItems,
      selectedCollectionPoint,
      derivedPhoto
    );

    if (!finalPayload.clientEmail || typeof finalPayload.clientEmail !== 'string' || finalPayload.clientEmail.trim() === '') {
      toast({ variant: "destructive", title: "Email manquant", description: "L'adresse email du client est requise." });
      return;
    }

    if (!finalPayload.clientName || typeof finalPayload.clientName !== 'string' || finalPayload.clientName.trim() === '') {
      toast({ variant: "destructive", title: "Nom manquant", description: "Le nom complet du client est requis." });
      return;
    }

    if (!finalPayload.items || finalPayload.items.length === 0) {
      toast({ variant: "destructive", title: "Panier vide", description: "Votre panier est vide ou ne contient aucun article facturable." });
      return;
    }

    const hasInvalidStripePriceIds = finalPayload.items.some(item => !item.stripe_price_id);
    if (hasInvalidStripePriceIds) {
      toast({ variant: "destructive", title: "Articles invalides", description: "Certains articles n'ont pas d'identifiant de prix (stripe_price_id)." });
      return;
    }

    if (!finalPayload.collectionPoint || typeof finalPayload.collectionPoint !== 'string' || finalPayload.collectionPoint.trim() === '') {
      toast({ variant: "destructive", title: "Point de collecte manquant", description: "Veuillez sélectionner un point de collecte." });
      return;
    }

    setIsLoading(true);

    try {
      const json = await createCheckoutSession({
        ...finalPayload,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: window.location.href,
      });

      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json.error || "La création de la session a échoué.");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de paiement", description: error.message || "Problème lors du passage en caisse." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Votre Panier - Atelier Calista</title>
        <meta name="description" content="Consultez les articles et services dans votre panier et procédez au paiement." />
      </Helmet>
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20 min-h-screen">
        <div className="flex items-center justify-between mb-10 border-b border-border/40 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-[var(--font-serif)] text-foreground">Votre Panier</h1>
          </div>
          {totalItems > 0 && (
            <Button variant="ghost" onClick={handleClearAll} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="mr-2 h-4 w-4" />
              Vider le panier
            </Button>
          )}
        </div>

        {totalItems === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border/40 shadow-sm flex flex-col items-center">
            <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart size={40} className="text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-[var(--font-serif)] text-foreground mb-3">0 articles</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto font-light">
              Découvrez nos articles de mode ou nos services de retouche sur-mesure.
            </p>
            <div className="flex gap-4">
              <Button asChild className="rounded-full px-8 h-12 text-xs tracking-widest uppercase">
                <Link to="/alterations">Les retouches</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-12 text-xs tracking-widest uppercase">
                <Link to="/alterations">Service Retouche</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product Items */}
              {productItems && productItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-[var(--font-serif)] text-foreground flex items-center gap-2 mb-4 border-b pb-2">
                    <Package className="w-5 h-5" /> Boutique
                  </h3>
                  <div className="space-y-4">
                    {productItems.map((item) => (
                      <div key={item.variant.id} className="bg-card rounded-2xl border border-border/60 shadow-sm p-4 flex gap-4">
                        <img src={item.product.image} alt={item.product.title} className="w-24 h-24 object-cover rounded-xl" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-card-foreground">{item.product.title}</h4>
                            <span className="font-medium text-card-foreground">{item.variant.sale_price_formatted || item.variant.price_formatted}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                          <div className="mt-4 flex items-center justify-between">
                             <div className="flex items-center space-x-3 bg-muted/50 rounded-full p-1 border border-border/60 w-fit">
                              <button onClick={() => updateProductQty(item.variant.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-foreground"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                              <button onClick={() => updateProductQty(item.variant.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-foreground"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeProduct(item.variant.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alteration Items */}
              {alterationItems && alterationItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-[var(--font-serif)] text-foreground flex items-center gap-2 mb-4 border-b pb-2">
                    <Scissors className="w-5 h-5" /> Services Sur Mesure
                  </h3>
                  <div className="space-y-6">
                    {alterationItems.map((item) => {
                      if (!item) return null;
                      const quantity = item.quantity || 1;
                      const isReparation = item.type === 'Réparation';
                      const locationName = item.collection_point_name || item.locationType || 'Non spécifié';
                      
                      let itemBaseCost = 0;
                      if (Array.isArray(item.services) && item.services.length > 0) {
                        itemBaseCost = item.services.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
                      } else {
                        itemBaseCost = Number(item.baseUnitCost) || (Number(item.totalCost) / quantity) || 0;
                      }
                      const itemTotalCost = itemBaseCost * quantity;
                      
                      return (
                        <div key={item.id} className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden group">
                          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                            {item.photo && (
                              <div className="flex-shrink-0 w-full md:w-40 h-40 rounded-xl overflow-hidden bg-muted relative">
                                <img src={item.photo} alt="Aperçu article" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] uppercase tracking-wider text-white rounded-md">Photo jointe</div>
                              </div>
                            )}
                            
                            <div className="flex-grow flex flex-col">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase bg-primary/10 text-primary mb-2">
                                    {String(item.type || 'Service')}
                                  </span>
                                  <h2 className="text-xl font-[var(--font-serif)] text-foreground">
                                    {isReparation ? 'Demande de réparation' : 'Ajustement sur-mesure'}
                                  </h2>
                                </div>
                                <div className="text-right">
                                  {!isReparation && itemTotalCost != null && (
                                    <span className="text-xl font-light text-foreground">{formatCurrency(Math.round(itemTotalCost * 100), { currencyCode: 'EUR' })}</span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-6">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <User className="w-4 h-4 mr-2 opacity-70" />
                                  <span className="font-medium text-foreground mr-1">Client:</span> 
                                  {String(item.clientInfo?.firstName || '')} {String(item.clientInfo?.lastName || '')}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground sm:col-span-2">
                                  <MapPin className="w-4 h-4 mr-2 opacity-70" />
                                  <span className="font-medium text-foreground mr-1">Lieu:</span> 
                                  {locationName}
                                </div>
                              </div>
                              
                              {Array.isArray(item.services) && item.services.length > 0 && (
                                <div className="mb-6 bg-muted/30 rounded-xl p-4 border border-border/40">
                                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Articles sélectionnés</h4>
                                  <ul className="space-y-2">
                                    {item.services.map(service => (
                                      <li key={service.id} className="flex justify-between text-sm items-center">
                                        <span className="flex items-center text-foreground">
                                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-primary/70" />
                                          {String(service.service_name || 'Service')}
                                        </span>
                                        <span className="font-medium text-muted-foreground">
                                          {formatCurrency(Math.round((service.price || 0) * 100), { currencyCode: 'EUR' })}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                                <div className="flex items-center space-x-3 bg-muted/50 rounded-full p-1 border border-border/60">
                                  <button onClick={() => updateAlterationQty(item.id, Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-foreground"><Minus className="h-3.5 w-3.5" /></button>
                                  <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                                  <button onClick={() => updateAlterationQty(item.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-foreground"><Plus className="h-3.5 w-3.5" /></button>
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => removeAlteration(item.id)} className="text-muted-foreground hover:text-destructive">
                                  <Trash2 size={16} className="mr-2" /> Supprimer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border/60 shadow-lg p-6 md:p-8 sticky top-24">
                <h3 className="text-lg font-[var(--font-serif)] text-foreground mb-6 pb-4 border-b border-border/40">Résumé de la commande</h3>
                
                <div className="space-y-4 mb-6">
                  {productItems && productItems.length > 0 && (
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Boutique ({productItems.length})</span>
                      <span>{getProductTotal()}</span>
                    </div>
                  )}
                  {alterationItems && alterationItems.length > 0 && (
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Services ({alterationItems.length})</span>
                      <span>{formatCurrency(Math.round(aTotalVal * 100), { currencyCode: 'EUR' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground text-sm border-t pt-4">
                    <span>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                    <span>{formatCurrency(Math.round(combinedTotal * 100), { currencyCode: 'EUR' })}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-foreground font-medium">Total estimé</span>
                    <span className="text-3xl font-[var(--font-serif)] text-primary">
                      {formatCurrency(Math.round(combinedTotal * 100), { currencyCode: 'EUR' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right mt-2 uppercase tracking-wide">Taxes incluses</p>
                </div>

                <Button 
                  onClick={handleCheckout} 
                  disabled={isLoading || totalItems === 0} 
                  className="w-full rounded-full h-14 text-xs tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform duration-300"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                  Procéder au paiement
                </Button>

                <div className="mt-6 text-center space-y-2 flex flex-col">
                  <Button asChild variant="link" className="text-xs text-muted-foreground hover:text-foreground">
                    <Link to="/alterations">
                      <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Continuer sur les services
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
