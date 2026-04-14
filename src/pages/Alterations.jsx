
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAlterationCart } from '@/hooks/useAlterationCart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Check, Loader2, MapPin, Wrench, Scissors, ChevronRight, UploadCloud, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAlterationCatalog, filterCatalogByType } from '@/services/backendApi';

const Alterations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addArticle } = useAlterationCart();

  // Navigation & Selections
  const [step, setStep] = useState(1);
  const [selectedCollectionPointId, setSelectedCollectionPointId] = useState('');
  const [serviceType, setServiceType] = useState('');
  
  // Selection Data
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedArticles, setSelectedArticles] = useState([]);

  // Réparation Data
  const [repairDescription, setRepairDescription] = useState('');
  const [repairPhoto, setRepairPhoto] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Data & Status
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load of categories and collection points
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, collectionPointsRes] = await Promise.all([
          supabase.from('alteration_categories').select('*').order('display_order'),
          supabase.from('collection_points').select('*').order('name')
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (collectionPointsRes.error) throw collectionPointsRes.error;

        setCategories(categoriesRes.data || []);
        setCollectionPoints(collectionPointsRes.data || []);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les données requises.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Fetch articles dynamically based on selected serviceType
  useEffect(() => {
    if (!serviceType) return;

    const fetchArticlesForType = async () => {
      try {
        const catalog = await fetchAlterationCatalog(categories);
        const data = filterCatalogByType(catalog, serviceType);
        
        setArticles(data || []);
        setSelectedCategoryId('');
        setSelectedArticles([]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les articles pour ce service.'
        });
      }
    };

    fetchArticlesForType();
  }, [categories, serviceType, toast]);

  const handleCollectionPointSelect = (pointId) => {
    setSelectedCollectionPointId(pointId);
    setTimeout(() => setStep(2), 300);
  };

  const handleServiceSelect = (selectedService) => {
    setServiceType(selectedService);
    setTimeout(() => setStep(3), 300);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? '' : categoryId);
  };

  const handleArticleToggle = (articleId) => {
    setSelectedArticles((prev) => {
      if (prev.includes(articleId)) {
        return prev.filter((id) => id !== articleId);
      }
      return [...prev, articleId];
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Fichier trop volumineux',
          description: 'La taille de l\'image ne doit pas dépasser 5 Mo.'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRepairPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoToStep4 = () => {
    if (selectedArticles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Sélection requise',
        description: 'Veuillez sélectionner au moins un article.'
      });
      return;
    }

    if (serviceType === 'Réparation') {
      if (!repairDescription.trim() || !repairPhoto) {
        toast({
          variant: 'destructive',
          title: 'Informations requises',
          description: 'Veuillez décrire le problème et fournir une photo de l\'article.'
        });
        return;
      }
    }
    
    setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedArticlesData = articles.filter(a => selectedArticles.includes(a.id));

      const cartItem = {
        type: serviceType,
        collectionPointId: selectedCollectionPointId, 
        collection_point_id: selectedCollectionPointId, 
        clientInfo: {
          firstName: formData.name,
          lastName: '',
          email: formData.email,
          phone: formData.phone
        },
        notes: serviceType === 'Réparation' ? repairDescription : `Demande d'${serviceType.toLowerCase()} pour les articles sélectionnés`,
        photo: serviceType === 'Réparation' ? repairPhoto : null,
        services: selectedArticlesData.map(a => ({ 
          service_id: a.id, 
          service_name: a.name, 
          price: Number(a.price), 
          category: a.category_id,
          quantity: 1, 
          description: `${serviceType} standard`
        })),
        quantity: 1
      };

      await addArticle(cartItem);
      
      setStep(1);
      setSelectedCollectionPointId('');
      setServiceType('');
      setSelectedCategoryId('');
      setSelectedArticles([]);
      setRepairDescription('');
      setRepairPhoto(null);
      setFormData({ name: '', email: '', phone: '' });

      navigate('/cart');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout au panier.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategoryArticles = serviceType === 'Réparation' 
    ? articles 
    : articles.filter((a) => a.category_id === selectedCategoryId);

  const slideVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: "easeIn" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg font-light tracking-[0.2em] uppercase">Chargement</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Service sur Mesure - Atelier Calista</title>
        <meta name="description" content="Réservez vos réparations et ajustements avec l'élégance de l'Atelier Calista." />
      </Helmet>

      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 flex flex-col items-center">
        
        <div className="w-full max-w-4xl premium-card p-8 md:p-14">
          
          <div className="flex items-center mb-12 relative">
            {step > 1 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="absolute left-0 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="w-full text-center px-12">
              <h1 className="text-lg md:text-xl lg:text-2xl font-[var(--font-serif)] font-[var(--font-serif-weight)] text-foreground leading-tight tracking-[0.02em]">
                {step === 1 && 'Choisissez votre point de collecte'}
                {step === 2 && 'De quel service avez-vous besoin ?'}
                {step === 3 && 'Sélectionnez vos articles'}
                {step === 4 && 'Vos coordonnées'}
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-6">
                <span className="h-px w-8 bg-primary/40"></span>
                <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-light">
                  Étape {step} sur 4
                </p>
                <span className="h-px w-8 bg-primary/40"></span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mb-16 max-w-xs mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-[2px] flex-1 transition-all duration-700 ${
                  s <= step ? 'bg-primary' : 'bg-border/40'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  variants={slideVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {collectionPoints.length === 0 ? (
                    <div className="col-span-1 sm:col-span-2 text-center py-12">
                      <p className="text-muted-foreground">Aucun point de collecte disponible pour le moment.</p>
                    </div>
                  ) : (
                    collectionPoints.map((point) => (
                      <button
                        key={point.id}
                        onClick={() => handleCollectionPointSelect(point.id)}
                        className={`flex flex-col items-start justify-center p-8 text-left rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden
                          ${selectedCollectionPointId === point.id 
                            ? 'border-primary bg-primary/[0.03] luxury-shadow scale-[1.02]' 
                            : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/[0.02]'}`}
                      >
                        <div className={`p-4 rounded-full mb-6 transition-all duration-500 ${selectedCollectionPointId === point.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}`}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-[var(--font-serif)] text-foreground mb-2 tracking-wide">{point.name}</h3>
                        <p className="text-muted-foreground font-light text-sm leading-relaxed">{point.address}</p>
                        {selectedCollectionPointId === point.id && (
                          <div className="absolute top-4 right-4 text-primary">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  variants={slideVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                >
                  <button
                    onClick={() => handleServiceSelect('Réparation')}
                    className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden
                      ${serviceType === 'Réparation' 
                        ? 'border-primary bg-primary/[0.03] luxury-shadow scale-[1.02]' 
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/[0.02]'}`}
                  >
                    <div className={`p-6 rounded-full mb-8 transition-all duration-500 ${serviceType === 'Réparation' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}`}>
                      <Wrench className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-[var(--font-serif)] text-foreground mb-3 tracking-wide">Réparation</h3>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed max-w-[200px]">Redonnez vie à vos pièces favorites avec nos artisans.</p>
                    {serviceType === 'Réparation' && (
                      <div className="absolute top-4 right-4 text-primary">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => handleServiceSelect('Ajustement')}
                    className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden
                      ${serviceType === 'Ajustement' 
                        ? 'border-primary bg-primary/[0.03] luxury-shadow scale-[1.02]' 
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/[0.02]'}`}
                  >
                    <div className={`p-6 rounded-full mb-8 transition-all duration-500 ${serviceType === 'Ajustement' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}`}>
                      <Scissors className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-[var(--font-serif)] text-foreground mb-3 tracking-wide">Ajustement</h3>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed max-w-[200px]">Le sur-mesure pour une silhouette parfaitement sublimée.</p>
                    {serviceType === 'Ajustement' && (
                      <div className="absolute top-4 right-4 text-primary">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" 
                  variants={slideVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  className="space-y-10"
                >
                  {serviceType === 'Ajustement' && (
                    <div className="flex flex-wrap gap-4 justify-center">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`px-8 py-3 rounded-full text-xs tracking-widest uppercase font-medium transition-all duration-300 border
                            ${selectedCategoryId === category.id 
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                              : 'bg-transparent border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 max-w-2xl mx-auto">
                    {serviceType === 'Ajustement' && !selectedCategoryId ? (
                      <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-3xl">
                        <p className="text-muted-foreground font-light italic">
                          Veuillez sélectionner une catégorie pour voir les articles disponibles.
                        </p>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        {currentCategoryArticles.length === 0 ? (
                          <p className="text-muted-foreground text-center py-12 font-light">
                            Aucun article trouvé pour cette sélection.
                          </p>
                        ) : (
                          currentCategoryArticles.map((article) => (
                            <div 
                              key={article.id} 
                              onClick={() => handleArticleToggle(article.id)}
                              className={`flex items-center space-x-6 p-6 bg-card border-2 rounded-2xl transition-all duration-300 cursor-pointer group
                                ${selectedArticles.includes(article.id) 
                                  ? 'border-primary bg-primary/[0.02] shadow-sm' 
                                  : 'border-border/60 hover:border-primary/30 hover:shadow-md'}`}
                            >
                              <Checkbox
                                id={`article-${article.id}`}
                                checked={selectedArticles.includes(article.id)}
                                onCheckedChange={() => handleArticleToggle(article.id)}
                                className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={`article-${article.id}`}
                                  className="text-lg font-light text-foreground cursor-pointer pointer-events-none group-hover:text-primary transition-colors"
                                >
                                  {article.name}
                                </Label>
                              </div>
                              <span className="font-[var(--font-serif)] text-2xl text-primary font-light">
                                {Number(article.price).toFixed(2)} €
                              </span>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </div>

                  {serviceType === 'Réparation' && (
                    <div className="max-w-xl mx-auto space-y-8 mt-12 pt-10 border-t border-border/40">
                      <h4 className="text-center font-[var(--font-serif)] text-lg mb-6">Détails de la réparation</h4>
                      
                      <div className="space-y-3">
                        <Label htmlFor="repairDescription" className="text-xs tracking-wider uppercase text-muted-foreground font-medium pl-1">
                          Description du problème <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="repairDescription"
                          value={repairDescription}
                          onChange={(e) => setRepairDescription(e.target.value)}
                          placeholder="Ex: Doublure déchirée, fermeture éclair cassée..."
                          required
                          className="min-h-[120px] text-sm resize-none bg-muted/[0.03] border-border/60 focus:border-primary/60 transition-all duration-300 rounded-xl p-4 leading-relaxed text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs tracking-wider uppercase text-muted-foreground font-medium pl-1">
                          Photo de l'article <span className="text-destructive">*</span>
                        </Label>
                        <div className="mt-2">
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/60 rounded-xl cursor-pointer bg-muted/[0.03] hover:bg-muted/[0.05] hover:border-primary/50 transition-all duration-300 overflow-hidden relative group">
                            {repairPhoto ? (
                              <>
                                <img src={repairPhoto} alt="Aperçu" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <UploadCloud className="w-8 h-8 text-white drop-shadow-md mb-2" />
                                  <span className="text-white font-medium drop-shadow-md text-sm">Changer la photo</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-10 h-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Cliquez pour uploader</span> ou glissez-déposez</p>
                                <p className="text-xs text-muted-foreground/70">PNG, JPG, JPEG (Max 5Mo)</p>
                              </div>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handlePhotoUpload} 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-10 flex justify-center">
                    <Button 
                      className="w-full max-w-md h-16 text-xs tracking-[0.3em] uppercase font-light rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-500 shadow-xl shadow-primary/20 group" 
                      onClick={handleGoToStep4}
                    >
                      Continuer ({selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''})
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4" 
                  variants={slideVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit"
                  className="max-w-md mx-auto"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] tracking-wider uppercase text-muted-foreground font-medium pl-1">Nom complet</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="Jean Dupont"
                          required
                          className="h-12 text-sm bg-muted/[0.03] border-border/60 focus:border-primary/60 transition-all duration-300 rounded-xl px-4 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] tracking-wider uppercase text-muted-foreground font-medium pl-1">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="jean@exemple.com"
                          required
                          className="h-12 text-sm bg-muted/[0.03] border-border/60 focus:border-primary/60 transition-all duration-300 rounded-xl px-4 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] tracking-wider uppercase text-muted-foreground font-medium pl-1">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="06 12 34 56 78"
                          required
                          className="h-12 text-sm bg-muted/[0.03] border-border/60 focus:border-primary/60 transition-all duration-300 rounded-xl px-4 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        className="w-full h-14 text-xs tracking-[0.2em] uppercase font-medium rounded-full relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary text-primary-foreground" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Ajout en cours...
                          </div>
                        ) : (
                          <>
                            <span className="relative z-10 flex items-center">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Ajouter au panier
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </>
  );
};

export default Alterations;
