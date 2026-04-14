import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

// URL de ton backend
const API_BASE_URL = 'https://ateliercalista.store';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ConfirmationDepot = () => {
  const query = useQuery();
  const token = query.get('token');

  const [state, setState] = useState({
    loading: true,
    status: 'pending', // ok | invalid | already | error
    name: null,
    order: null,
    amount: null,
  });

  useEffect(() => {
    if (!token) {
      setState({
        loading: false,
        status: 'invalid',
        name: null,
        order: null,
        amount: null,
      });
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/confirm-deposit/${token}`, {
          method: 'GET',
        });

        const data = await res.json();

        // data.status = ok | invalid | already | error
        setState({
          loading: false,
          status: data.status || (res.ok ? 'ok' : 'error'),
          name: data.name || null,
          order: data.order || null,
          amount: data.amount || null,
        });
      } catch (err) {
        console.error('Erreur fetch confirmation dépôt:', err);
        setState({
          loading: false,
          status: 'error',
          name: null,
          order: null,
          amount: null,
        });
      }
    };

    run();
  }, [token]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  let title = "Confirmation du dépôt en cours...";
  let message = "Merci de patienter quelques instants.";
  let Icon = CheckCircle;
  let iconColor = "text-gray-400";

  if (!state.loading) {
    if (state.status === 'ok') {
      title = `Merci ${state.name || ''}, ton vêtement est bien déposé.`;
      message = `Commande #${state.order || ''} (${state.amount || ''}€). L'atelier a été averti.`;
      iconColor = "text-green-500";
      Icon = CheckCircle;
    } else if (state.status === 'already') {
      title = "Dépôt déjà confirmé.";
      message = "Le dépôt de ton vêtement avait déjà été enregistré.";
      iconColor = "text-blue-500";
      Icon = CheckCircle;
    } else if (state.status === 'invalid') {
      title = "Lien invalide ou expiré.";
      message = "Ce lien n'est plus valide. Si besoin, contacte directement l'atelier.";
      iconColor = "text-red-500";
      Icon = AlertTriangle;
    } else {
      title = "Une erreur est survenue.";
      message = "Impossible de confirmer ton dépôt pour le moment.";
      iconColor = "text-orange-500";
      Icon = AlertTriangle;
    }
  }

  return (
    <>
      <Helmet>
        <title>Confirmation de Dépôt - Atelier Calista</title>
        <meta
          name="description"
          content="Confirmation du dépôt de votre vêtement au point de collecte."
        />
      </Helmet>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Icon
              className={`mx-auto h-16 w-16 ${iconColor}`}
              strokeWidth={1.5}
            />
          </motion.div>

          <motion.h1
            className="mt-6 text-3xl font-light text-gray-900"
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mt-2 text-md text-gray-600"
            variants={itemVariants}
          >
            {message}
          </motion.p>

          {state.loading && (
            <motion.p
              className="mt-4 text-sm text-gray-400"
              variants={itemVariants}
            >
              Vérification du lien en cours...
            </motion.p>
          )}

          <motion.div variants={itemVariants} className="pt-6">
            <Button asChild className="rounded-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ConfirmationDepot;