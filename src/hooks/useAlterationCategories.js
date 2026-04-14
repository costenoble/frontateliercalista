
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  createBackendProduct,
  deleteBackendProduct,
  fetchAlterationCatalog,
  filterCatalogByType,
  updateBackendProduct,
} from '@/services/backendApi';

export const useAlterationCategories = () => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const resolveCategoryName = useCallback((serviceData = {}, fallbackArticle = null) => {
    if (serviceData.type === 'Réparation' || fallbackArticle?.type === 'Réparation') {
      return 'Réparation';
    }

    if (serviceData.category) return serviceData.category;

    const selectedCategoryId = serviceData.category_id || fallbackArticle?.category_id;
    if (!selectedCategoryId) return fallbackArticle?.category_name || '';

    return categories.find((category) => category.id === selectedCategoryId)?.name || '';
  }, [categories]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('alteration_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      
      setCategories(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data || [];
      });

      return data || [];
      
    } catch (err) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les catégories.' });
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchArticlesByType = useCallback(async (type = null) => {
    setLoading(true);
    try {
      const categoriesData = categories.length > 0 ? categories : await fetchCategories();
      const catalog = await fetchAlterationCatalog(categoriesData);
      const data = type ? filterCatalogByType(catalog, type) : catalog;
      
      setArticles(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching articles:', err);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les articles.' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [categories, fetchCategories, toast]);

  const createCategory = useCallback(async (categoryData) => {
    try {
      const { error: createError } = await supabase.from('alteration_categories').insert([categoryData]);
      if (createError) throw createError;
      toast({ title: 'Succès', description: 'Catégorie créée avec succès.' });
      await fetchCategories();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      const { error: updateError } = await supabase
        .from('alteration_categories')
        .update({ ...categoryData, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (updateError) throw updateError;
      toast({ title: 'Succès', description: 'Catégorie mise à jour.' });
      await fetchCategories();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id) => {
    try {
      const { error: deleteError } = await supabase.from('alteration_categories').delete().eq('id', id);
      if (deleteError) throw deleteError;
      toast({ title: 'Succès', description: 'Catégorie supprimée.' });
      await fetchCategories();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories]);

  const createService = useCallback(async (serviceData) => {
    try {
      const serviceName = serviceData.service || serviceData.name || '';
      const categoryName = resolveCategoryName(serviceData);
      const price = Number(serviceData.price) || 0;

      if (!serviceName.trim() || price <= 0) {
        throw new Error('Nom de service ou prix invalide.');
      }

      await createBackendProduct({
        category: categoryName,
        service: serviceName.trim(),
        price,
      });

      toast({ title: 'Succès', description: 'Service ajouté.' });
      await fetchArticlesByType();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchArticlesByType, resolveCategoryName]);

  const updateService = useCallback(async (id, serviceData) => {
    try {
      const existingArticle = articles.find((article) => article.id === id);
      if (!existingArticle?.stripe_product_id || !existingArticle?.stripe_price_id) {
        throw new Error('Impossible de retrouver les identifiants Stripe de ce service.');
      }

      const serviceName = serviceData.service || serviceData.name || existingArticle.name || '';
      const categoryName = resolveCategoryName(serviceData, existingArticle);
      const price = Number(serviceData.price ?? existingArticle.price) || 0;

      if (!serviceName.trim() || price <= 0) {
        throw new Error('Nom de service ou prix invalide.');
      }

      await updateBackendProduct({
        service_id: id,
        category: categoryName,
        service: serviceName.trim(),
        price,
        stripe_product_id: existingArticle.stripe_product_id,
        stripe_price_id: existingArticle.stripe_price_id,
      });

      toast({ title: 'Succès', description: 'Service mis à jour.' });
      await fetchArticlesByType();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, fetchArticlesByType, resolveCategoryName]);

  const deleteService = useCallback(async (id) => {
    try {
      const existingArticle = articles.find((article) => article.id === id);
      if (!existingArticle?.stripe_product_id) {
        throw new Error('Impossible de retrouver le produit Stripe de ce service.');
      }

      await deleteBackendProduct({
        service_id: id,
        stripe_product_id: existingArticle.stripe_product_id,
      });

      toast({ title: 'Succès', description: 'Service supprimé.' });
      await fetchArticlesByType();
      return true;
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, fetchArticlesByType]);

  return {
    categories,
    articles,
    loading,
    error,
    fetchCategories,
    fetchArticlesByType,
    createCategory,
    updateCategory,
    deleteCategory,
    createService,
    updateService,
    deleteService
  };
};
