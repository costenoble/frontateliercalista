
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { isRepairCategory } from '@/services/backendApi';

const AlterationCartContext = createContext();

export const useAlterationCart = () => useContext(AlterationCartContext);

const CART_STORAGE_KEY = 'alteration-cart';

const getInitialCartState = () => {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            if (parsedCart && Array.isArray(parsedCart.items)) {
                return parsedCart;
            }
        }
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
    }
    return { items: [], customerInfo: null, pickupLocation: null };
};

export const AlterationCartProvider = ({ children }) => {
  const { toast } = useToast();
  
  const [cartState, setCartState] = useState(getInitialCartState);

  const { items: cartItems = [], customerInfo, pickupLocation } = cartState || {};

  useEffect(() => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
  }, [cartState]);

  const addToCart = useCallback(async (item) => {
    try {
      let processedServices = [];
      let totalCost = 0;

      // EXACT SAME RETRIEVAL LOGIC for both Ajustement and Réparation
      if ((item.type === 'Ajustement' || item.type === 'Réparation') && Array.isArray(item.services) && item.services.length > 0) {
        const serviceIds = item.services.map(s => s.service_id);
        const { data: dbServices, error } = await supabase
          .from('alteration_prices')
          .select('id, service, price, category, stripe_price_id')
          .in('id', serviceIds);

        if (error) throw error;

        processedServices = item.services.map(s => {
          const dbService = dbServices?.find(dbs => dbs.id === s.service_id);
          if (!dbService) throw new Error(`Service ${s.service_id} not found in database`);
          const priceAsNumber = Number(dbService.price) || 0;
          const serviceCategory = dbService.category || '';
          return {
            id: s.id || `srv_${Date.now()}_${Math.random()}`,
            service_id: dbService.id,
            service_name: dbService.service,
            category: serviceCategory,
            price: priceAsNumber,
            stripe_price_id: dbService.stripe_price_id,
            type: isRepairCategory(serviceCategory) ? 'Réparation' : 'Ajustement',
            description: s.description || '',
            quantity: Number(s.quantity) || 1
          };
        });

        // Sum of (article.price * article.quantity)
        totalCost = processedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
      } else {
        // Fallback for any other type
        totalCost = 0;
        processedServices = item.services || [];
      }

      // Fetch Collection Point Name
      let collection_point_name = null;
      const cpId = item.collectionPointId || item.collectionPoint?.id || item.collection_point_id;
      if (cpId) {
        const { data: cpData, error: cpError } = await supabase
          .from('collection_points')
          .select('name')
          .eq('id', cpId)
          .single();
        
        if (!cpError && cpData) {
          collection_point_name = cpData.name;
        }
      }

      setCartState(prevState => {
        const safePrevState = prevState || { items: [], customerInfo: null, pickupLocation: null };
        const baseQty = Number(item.quantity) || 1;
        const newItem = { 
          ...item, 
          services: processedServices,
          totalCost: totalCost * baseQty,
          baseUnitCost: totalCost,
          quantity: baseQty,
          id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          collectionPointId: cpId,
          collection_point_id: cpId,
          collection_point_name: collection_point_name || item.locationType || 'Non spécifié'
        };
        
        const newItems = [...(safePrevState.items || []), newItem];
        
        const newCustomerInfo = safePrevState.customerInfo || {
          firstName: item.clientInfo?.firstName || '',
          lastName: item.clientInfo?.lastName || '',
          email: item.clientInfo?.email || '',
          phone: item.clientInfo?.phone || '',
        };

        const newPickupLocation = safePrevState.pickupLocation || {
            locationType: newItem.collection_point_name,
            collectionPointId: cpId,
        };

        return { 
          items: newItems,
          customerInfo: newCustomerInfo,
          pickupLocation: newPickupLocation,
        };
      });
      
      toast({
        title: "Ajouté au panier !",
        description: "Vos articles ont bien été ajoutés.",
      });
    } catch (err) {
      console.error("Error adding to alteration cart:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les informations du service."
      });
    }
  }, [toast]); 

  // Aliases for user requests
  const addArticle = addToCart;

  const removeFromCart = useCallback((itemId) => {
    setCartState(prevState => {
        const safePrevState = prevState || { items: [], customerInfo: null, pickupLocation: null };
        const newItems = (safePrevState.items || []).filter(item => item.id !== itemId);
        
        if (newItems.length === 0) {
            return { items: [], customerInfo: null, pickupLocation: null };
        }
        return { ...safePrevState, items: newItems };
    });
    
    toast({
      title: "Article supprimé",
      description: "L'article a été retiré de votre panier.",
    });
  }, [toast]);

  // Aliases for user requests
  const removeArticle = removeFromCart;

  const updateQuantity = useCallback((itemId, newQuantity) => {
      setCartState(prevState => {
          if (!prevState) return prevState;
          const newItems = prevState.items.map(item => {
              if (item.id === itemId) {
                  const safeQty = Math.max(1, newQuantity);
                  const unitPrice = item.baseUnitCost || (item.totalCost / (item.quantity || 1));
                  return { ...item, quantity: safeQty, totalCost: unitPrice * safeQty, baseUnitCost: unitPrice };
              }
              return item;
          });
          return { ...prevState, items: newItems };
      });
  }, []);

  const clearCart = useCallback(() => {
    setCartState({ items: [], customerInfo: null, pickupLocation: null });
  }, []);

  const getCartTotal = useCallback(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.totalCost || 0), 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    customerInfo,
    pickupLocation,
    addToCart,
    addArticle,
    removeFromCart,
    removeArticle,
    updateQuantity,
    clearCart,
    getCartTotal,
    itemCount: Array.isArray(cartItems) ? cartItems.length : 0,
  }), [cartItems, customerInfo, pickupLocation, addToCart, addArticle, removeFromCart, removeArticle, updateQuantity, clearCart, getCartTotal]);

  return (
    <AlterationCartContext.Provider value={value}>
      {children}
    </AlterationCartContext.Provider>
  );
};
