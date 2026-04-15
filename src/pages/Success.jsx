import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAlterationCart } from '@/hooks/useAlterationCart';

const Success = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();
  const { clearCart: clearProductCart } = useCart();
  const { clearCart: clearAlterationCart } = useAlterationCart();

  useEffect(() => {
    clearProductCart();
    clearAlterationCart();
  }, [clearAlterationCart, clearProductCart]);

  const closeModalAndRedirect = () => {
    setIsModalOpen(false);
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Paiement Réussi - Atelier Calista</title>
        <meta name="description" content="Merci pour votre commande. Votre paiement a été effectué avec succès." />
      </Helmet>
      
      <div className="bg-gray-100 min-h-[70vh] flex items-center justify-center p-4">
        <p className="text-gray-500">Redirection après paiement réussi...</p>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeModalAndRedirect}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full text-center p-8 sm:p-12 relative"
              onClick={e => e.stopPropagation()}
            >
               <Button onClick={closeModalAndRedirect} variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full">
                <X size={24} />
              </Button>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 mb-4"
              >
                Merci pour votre commande !
              </motion.h1>
    
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-gray-600 mb-8"
              >
                Votre paiement a été effectué avec succès et votre commande est en cours de traitement. Vous recevrez un e-mail de confirmation sous peu.
              </motion.p>
    
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button onClick={closeModalAndRedirect} className="rounded-full px-8 py-6 text-base w-full sm:w-auto">
                  Retour à l'accueil
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Success;
