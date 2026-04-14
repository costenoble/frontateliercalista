
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, LogOut, Loader2, Edit2, Ruler, Info, Wrench, MapPin, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlterationCategories } from '@/hooks/useAlterationCategories';
import CollectionPointForm from '@/components/CollectionPointForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createBackendProduct,
  deleteBackendProduct,
  fetchAlterationCatalog,
  updateBackendProduct,
} from '@/services/backendApi';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const AdminDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collectionPoints, setCollectionPoints] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [articles, setArticles] = useState([]);
  
  const [newAvailability, setNewAvailability] = useState({
    collection_point_id: '',
    day_of_week: 'Lundi',
    start_time: '',
    end_time: ''
  });

  const [loadingData, setLoadingData] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Categories hook
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAlterationCategories();

  // Category Forms State
  const [categoryForm, setCategoryForm] = useState({ name: '', display_order: 0 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Articles Form State
  const [articleForm, setArticleForm] = useState({ name: '', price: '', type: 'Ajustement', category_id: '' });
  const [editingArticle, setEditingArticle] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Collection Points State
  const [isCollectionPointModalOpen, setIsCollectionPointModalOpen] = useState(false);
  const [editingCollectionPoint, setEditingCollectionPoint] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const categoriesData = await fetchCategories();

      const { data: pointsData, error: pointsError } = await supabase
        .from('collection_points')
        .select('*')
        .order('name');
      if (pointsError) throw pointsError;
      setCollectionPoints(pointsData);

      const { data: availabilitiesData, error: availabilitiesError } = await supabase
        .from('availabilities')
        .select(`
          *,
          collection_points (
            id,
            name
          )
        `)
        .order('day_of_week')
        .order('start_time');
      if (availabilitiesError) throw availabilitiesError;
      const sortedAvailabilities = availabilitiesData.sort((a, b) => {
        const dayDiff = DAYS_OF_WEEK.indexOf(a.day_of_week) - DAYS_OF_WEEK.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;

        const pointA = a.collection_points?.name || '';
        const pointB = b.collection_points?.name || '';
        return pointA.localeCompare(pointB);
      });
      setAvailabilities(sortedAvailabilities);

      const articlesData = await fetchAlterationCatalog(categoriesData);
      setArticles(articlesData);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de chargement", description: error.message });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleSaveCollectionPoint = async (formData) => {
    setIsAdding(true);
    try {
      if (editingCollectionPoint) {
        const { error } = await supabase
          .from('collection_points')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingCollectionPoint.id);
        
        if (error) throw error;
        toast({ title: "Succès", description: "Point de collecte mis à jour." });
      } else {
        const { error } = await supabase
          .from('collection_points')
          .insert([{ ...formData, created_at: new Date().toISOString() }]);
          
        if (error) throw error;
        toast({ title: "Succès", description: "Nouveau point de collecte ajouté." });
      }
      setIsCollectionPointModalOpen(false);
      setEditingCollectionPoint(null);
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setIsAdding(false);
    }
  };

  const openCollectionPointModal = (point = null) => {
    setEditingCollectionPoint(point);
    setIsCollectionPointModalOpen(true);
  };

  const handleAddAvailability = async () => {
      if (!newAvailability.collection_point_id || !newAvailability.day_of_week || !newAvailability.start_time || !newAvailability.end_time) {
          toast({ variant: "destructive", title: "Champs requis", description: "Tous les champs sont obligatoires." });
          return;
      }
      setIsAdding(true);
      const { error } = await supabase.from('availabilities').insert([{
        ...newAvailability,
        created_at: new Date().toISOString()
      }]);
      if (error) {
          toast({ variant: "destructive", title: "Erreur d'ajout", description: error.message });
      } else {
          toast({ title: "Succès", description: "Nouvelle disponibilité ajoutée." });
          fetchData();
          setNewAvailability({ collection_point_id: '', day_of_week: 'Lundi', start_time: '', end_time: '' });
      }
      setIsAdding(false);
  };

  const handleDelete = async (table, id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast({ variant: "destructive", title: "Erreur de suppression", description: error.message });
    } else {
      toast({ title: "Succès", description: "Élément supprimé." });
      fetchData();
    }
  };

  const handleSaveArticle = async () => {
    const sanitizedName = articleForm.name.trim();

    if (!sanitizedName) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom de l'article est requis." });
      return;
    }
    
    const numericPrice = parseFloat(articleForm.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Un prix valide (supérieur à 0) est requis." });
      return;
    }

    if (articleForm.type === 'Ajustement' && !articleForm.category_id) {
      toast({ variant: "destructive", title: "Erreur", description: "La catégorie est requise pour un ajustement." });
      return;
    }
    
    setIsAdding(true);
    try {
      const selectedCategory = categories.find((category) => category.id === articleForm.category_id);
      const categoryName = articleForm.type === 'Réparation'
        ? 'Réparation'
        : selectedCategory?.name || '';

      if (editingArticle) {
        await updateBackendProduct({
          service_id: editingArticle.id,
          category: categoryName,
          service: sanitizedName,
          price: numericPrice,
          stripe_product_id: editingArticle.stripe_product_id,
          stripe_price_id: editingArticle.stripe_price_id,
        });
        toast({ title: "Succès", description: "Article mis à jour avec succès." });
      } else {
        await createBackendProduct({
          category: categoryName,
          service: sanitizedName,
          price: numericPrice,
        });
        toast({ title: "Succès", description: `Article ${articleForm.type} créé et lié à Stripe avec succès.` });
      }
      setIsArticleModalOpen(false);
      setArticleForm({ name: '', price: '', type: 'Ajustement', category_id: '' });
      setEditingArticle(null);
      fetchData();
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur Base de données", description: err.message || "Impossible d'enregistrer l'article." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveCategory = async () => {
    setIsAdding(true);
    let success = false;
    if (editingCategory) {
      success = await updateCategory(editingCategory.id, categoryForm);
    } else {
      success = await createCategory(categoryForm);
    }
    if (success) {
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', display_order: 0 });
      setEditingCategory(null);
    }
    setIsAdding(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;
    await deleteCategory(id);
  };

  const handleDeleteArticle = async (article) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      await deleteBackendProduct({
        service_id: article.id,
        stripe_product_id: article.stripe_product_id,
      });
      toast({ title: "Succès", description: "Article supprimé." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de suppression", description: error.message });
    }
  };

  const openArticleModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setArticleForm({ 
        name: article.name, 
        price: article.price, 
        type: article.type, 
        category_id: article.category_id || '' 
      });
    } else {
      setEditingArticle(null);
      setArticleForm({ name: '', price: '', type: 'Ajustement', category_id: '' });
    }
    setIsArticleModalOpen(true);
  };

  if (authLoading || loadingData) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  const ajustementArticles = articles.filter(a => a.type === 'Ajustement');
  const reparationArticles = articles.filter(a => a.type === 'Réparation');

  const groupedAjustements = ajustementArticles.reduce((acc, article) => {
    const catId = article.category_id || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(article);
    return acc;
  }, {});

  const groupedAvailabilities = availabilities.reduce((acc, availability) => {
    const pointName = availability.collection_points?.name || 'Point de collecte';
    if (!acc[pointName]) acc[pointName] = [];
    acc[pointName].push(availability);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <Button onClick={handleSignOut} variant="outline">
          <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
        </Button>
      </header>

      {/* Collection Points Section */}
      <motion.div layout className="bg-white rounded-xl shadow-md mb-10 border border-gray-100 overflow-hidden">
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 text-white mr-3" />
            <h2 className="text-xl font-bold text-white">Points de Collecte</h2>
          </div>
          <Button onClick={() => openCollectionPointModal()} className="bg-white text-emerald-700 hover:bg-gray-100 shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Nouveau Point
          </Button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Nom</th>
                <th scope="col" className="px-6 py-4 font-semibold">Adresse</th>
                <th scope="col" className="px-6 py-4 font-semibold">Type de lieu</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collectionPoints.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">Aucun point de collecte trouvé.</td></tr>
              ) : (
                collectionPoints.map(point => (
                  <tr key={point.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{point.name}</td>
                    <td className="px-6 py-4 text-gray-600">{point.address}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-200">
                        {point.location_type || 'Non spécifié'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-700" onClick={() => openCollectionPointModal(point)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete('collection_points', point.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div layout className="bg-white rounded-xl shadow-md mb-10 border border-gray-100 overflow-hidden">
        <div className="bg-amber-600 px-6 py-4 flex items-center">
          <Clock className="h-6 w-6 text-white mr-3" />
          <h2 className="text-xl font-bold text-white">Disponibilités</h2>
        </div>
        <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Point de collecte</label>
            <Select
              value={newAvailability.collection_point_id}
              onValueChange={(value) => setNewAvailability((prev) => ({ ...prev, collection_point_id: value }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Choisir un point" />
              </SelectTrigger>
              <SelectContent>
                {collectionPoints.map((point) => (
                  <SelectItem key={point.id} value={point.id}>
                    {point.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jour</label>
            <Select
              value={newAvailability.day_of_week}
              onValueChange={(value) => setNewAvailability((prev) => ({ ...prev, day_of_week: value }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Début</label>
            <Input
              type="time"
              value={newAvailability.start_time}
              onChange={(e) => setNewAvailability((prev) => ({ ...prev, start_time: e.target.value }))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Fin</label>
            <Input
              type="time"
              value={newAvailability.end_time}
              onChange={(e) => setNewAvailability((prev) => ({ ...prev, end_time: e.target.value }))}
              className="h-10"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
          <Button
            onClick={handleAddAvailability}
            disabled={isAdding || collectionPoints.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Ajouter un créneau
          </Button>
        </div>
        <div className="p-6 space-y-6">
          {Object.keys(groupedAvailabilities).length === 0 ? (
            <p className="text-sm text-gray-500 italic">Aucune disponibilité enregistrée.</p>
          ) : (
            Object.entries(groupedAvailabilities).map(([pointName, pointAvailabilities]) => (
              <div key={pointName} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">{pointName}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {pointAvailabilities.map((availability) => (
                    <div key={availability.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{availability.day_of_week}</span>
                        {' · '}
                        {availability.start_time?.slice(0, 5)} - {availability.end_time?.slice(0, 5)}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => handleDelete('availabilities', availability.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Services</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <Info className="h-4 w-4 mr-1 inline" />
            Ajoutez un article (Ajustement ou Réparation). Il sera créé automatiquement sur Stripe pour permettre les paiements.
          </p>
        </div>
        <Button onClick={() => openArticleModal()} className="bg-primary hover:bg-primary/90 text-white shadow-md">
          <Plus className="h-4 w-4 mr-2" /> Nouvel Article
        </Button>
      </div>
      
      <AnimatePresence>
        <motion.div layout className="bg-white rounded-xl shadow-md mb-10 border border-gray-100 overflow-hidden">
          <div className="bg-slate-700 px-6 py-4 flex items-center">
            <Wrench className="h-6 w-6 text-white mr-3" />
            <h2 className="text-xl font-bold text-white">Réparations</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Nom</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Prix</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reparationArticles.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">Aucune réparation trouvée.</td></tr>
                ) : (
                  reparationArticles.map(article => (
                    <tr key={article.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{article.name}</td>
                      <td className="px-6 py-4">{article.price} €</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-slate-700" onClick={() => openArticleModal(article)}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handleDeleteArticle(article)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div layout className="bg-white rounded-xl shadow-md mb-10 border border-gray-100 overflow-hidden">
          <div className="bg-[#bc6c5a] px-6 py-4 flex items-center">
            <Ruler className="h-6 w-6 text-white mr-3" />
            <h2 className="text-xl font-bold text-white">Ajustements</h2>
          </div>
          <div className="p-6 space-y-8">
            {categories.map(category => {
              const categoryArticles = groupedAjustements[category.id];
              if (!categoryArticles || categoryArticles.length === 0) return null;
              return (
                <div key={category.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                  </div>
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-white border-b">
                      <tr>
                        <th className="px-6 py-3">Nom</th>
                        <th className="px-6 py-3">Prix</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryArticles.map(article => (
                        <tr key={article.id} className="bg-white border-b last:border-0 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{article.name}</td>
                          <td className="px-6 py-4">{article.price} €</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-[#bc6c5a]" onClick={() => openArticleModal(article)}><Edit2 className="h-3.5 w-3.5" /></Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handleDeleteArticle(article)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Collection Point Modal */}
        <Dialog open={isCollectionPointModalOpen} onOpenChange={setIsCollectionPointModalOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
            <div className="p-5 sm:p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                  {editingCollectionPoint ? "Modifier le point de collecte" : "Ajouter un point de collecte"}
                </DialogTitle>
              </DialogHeader>
              <CollectionPointForm 
                initialData={editingCollectionPoint} 
                onSubmit={handleSaveCollectionPoint} 
                onCancel={() => {
                  setIsCollectionPointModalOpen(false);
                  setEditingCollectionPoint(null);
                }} 
                isLoading={isAdding} 
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Shared Article Modal */}
        <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
            <div className="p-5 sm:p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                  {editingArticle ? "Modifier l'article" : "Ajouter un article"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Type de service</label>
                  <Select value={articleForm.type} onValueChange={(val) => setArticleForm({...articleForm, type: val})}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ajustement" className="py-2">Ajustement</SelectItem>
                      <SelectItem value="Réparation" className="py-2">Réparation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {articleForm.type === 'Ajustement' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <Select value={articleForm.category_id} onValueChange={(val) => setArticleForm({...articleForm, category_id: val})}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="py-2">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nom de l'article</label>
                  <Input value={articleForm.name} onChange={e => setArticleForm({...articleForm, name: e.target.value})} placeholder="Ex: Ourlet simple" className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Prix (€)</label>
                  <Input type="number" step="0.01" value={articleForm.price} onChange={e => setArticleForm({...articleForm, price: e.target.value})} className="h-10" />
                </div>
                <div className="pt-2">
                  <Button onClick={handleSaveArticle} disabled={isAdding} className="w-full h-10 font-semibold bg-primary hover:bg-primary/90 text-white">
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : editingArticle ? "Mettre à jour" : "Créer l'article"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Categories Section */}
        <motion.div layout className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Catégories</h2>
            <Button variant="outline" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', display_order: 0 }); setIsCategoryModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Catégorie
            </Button>
          </div>
          {categoriesLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg group">
                  <span className="font-medium text-gray-900">{category.name} <span className="text-xs text-gray-400 ml-2">Ordre: {category.display_order}</span></span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 text-[#bc6c5a]" onClick={() => {
                      setEditingCategory(category);
                      setCategoryForm({ name: category.name, display_order: category.display_order });
                      setIsCategoryModalOpen(true);
                    }}><Edit2 className="h-3.5 w-3.5"/></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
