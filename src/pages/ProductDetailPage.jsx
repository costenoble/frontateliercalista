import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Loader2, ArrowLeft, CheckCircle, Minus, Plus, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTFmMTRhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

function ProductDetailPage({ setIsCartOpen }) {
  const { id } = useParams();
  const location = useLocation();
  const featuredImage = location.state?.featuredImage;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await getProduct(id);
        
        if (featuredImage && !fetchedProduct.images.some(img => img.url === featuredImage)) {
          fetchedProduct.images.unshift({ url: featuredImage, order: -1, type: 'featured' });
        }
        
        const quantitiesResponse = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: [fetchedProduct.id]
        });

        const variantQuantityMap = new Map();
        quantitiesResponse.variants.forEach(variant => {
          variantQuantityMap.set(variant.id, variant.inventory_quantity);
        });

        const productWithQuantities = {
          ...fetchedProduct,
          variants: fetchedProduct.variants.map(variant => ({
            ...variant,
            inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
          }))
        };

        setProduct(productWithQuantities);

        if (productWithQuantities.variants && productWithQuantities.variants.length > 0) {
          setSelectedVariant(productWithQuantities.variants[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, featuredImage]);

  const handleAddToCart = useCallback(async () => {
    if (product && selectedVariant) {
      const availableQuantity = selectedVariant.inventory_quantity;
      try {
        await addToCart(product, selectedVariant, quantity, availableQuantity);
        setIsCartOpen(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Oh no! Something went wrong.",
          description: error.message,
        });
      }
    }
  }, [product, selectedVariant, quantity, addToCart, toast, setIsCartOpen]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity + amount));
  }, []);

  const handlePrevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  }, [product?.images?.length]);

  const handleNextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
    }
  }, [product?.images?.length]);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    const imageIndex = product.images.findIndex(img => img.url === variant.image_url);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-16 w-16 text-gray-900 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
        <div className="text-center text-red-600 p-8 bg-red-50 rounded-2xl">
          <XCircle className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg font-medium">Error loading product</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const price = selectedVariant?.sale_price_formatted ?? selectedVariant?.price_formatted;
  const originalPrice = selectedVariant?.sale_price_in_cents ? selectedVariant.price_formatted : null;
  const availableStock = selectedVariant ? selectedVariant.inventory_quantity : 0;
  const isStockManaged = selectedVariant?.manage_inventory ?? false;
  const isInStock = !isStockManaged || availableStock > 0;
  const canAddToCart = isInStock && product.purchasable;

  const currentImage = product.images[currentImageIndex]?.url || product.image || placeholderImage;
  const hasMultipleImages = product.images.length > 1;

  return (
    <>
      <Helmet>
        <title>{product.title} - Midcentury Decor</title>
        <meta name="description" content={product.description?.substring(0, 160) || product.title} />
      </Helmet>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors mb-6 font-medium">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-sm aspect-square bg-gray-100">
              <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
              {hasMultipleImages && (
                <>
                  <Button onClick={handlePrevImage} variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full shadow-md"><ChevronLeft size={20} /></Button>
                  <Button onClick={handleNextImage} variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full shadow-md"><ChevronRight size={20} /></Button>
                </>
              )}
            </div>
            {hasMultipleImages && (
              <div className="flex justify-center gap-3 mt-4">
                {product.images.map((image, index) => (
                  <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={image.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-3">{product.title}</h1>
            <p className="text-lg text-gray-600 mb-5">{product.subtitle}</p>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-medium text-gray-900">{price}</span>
              {originalPrice && <span className="text-2xl text-gray-400 line-through">{originalPrice}</span>}
            </div>
            
            {product.variants.length > 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{product.options[0]?.title || 'Style'}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(variant => (
                    <Button key={variant.id} onClick={() => handleVariantSelect(variant)} className={`rounded-full transition-all ${selectedVariant?.id === variant.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                      {variant.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-full p-1">
                <Button onClick={() => handleQuantityChange(-1)} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-gray-600 hover:bg-gray-100"><Minus size={16} /></Button>
                <span className="w-10 text-center text-gray-900 font-medium">{quantity}</span>
                <Button onClick={() => handleQuantityChange(1)} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-gray-600 hover:bg-gray-100"><Plus size={16} /></Button>
              </div>
            </div>

            <div className="mt-auto">
              <Button onClick={handleAddToCart} size="lg" className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full py-6 text-base" disabled={!canAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> {canAddToCart ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              {isStockManaged && isInStock && (
                <p className="text-sm text-green-600 mt-3 flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> {availableStock} in stock
                </p>
              )}
            </div>
            <div className="prose prose-sm text-gray-600 mt-8" dangerouslySetInnerHTML={{ __html: product.description }} />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;