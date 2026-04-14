import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des commandes depuis localStorage
    const loadOrders = () => {
      try {
        const storedOrders = localStorage.getItem('user-orders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simuler un délai de chargement
    setTimeout(loadOrders, 500);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Livrée';
      case 'shipped':
        return 'Expédiée';
      case 'processing':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  return (
    <>
      <Helmet>
        <title>Mes Commandes - Midcentury Decor</title>
        <meta name="description" content="Consultez l'historique de vos commandes et suivez vos livraisons." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-light text-gray-900 mb-2">Mes commandes</h1>
            <p className="text-gray-600 mb-8">Suivez et gérez vos commandes</p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full"
              />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-sm p-12 text-center"
            >
              <Package size={64} className="mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-light text-gray-900 mb-3">Aucune commande</h2>
              <p className="text-gray-600 mb-8">Vous n'avez pas encore passé de commande.</p>
              <Button asChild className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8 py-6">
                <Link to="/shop">Découvrir nos produits</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Commande #{order.orderNumber}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>{order.date}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-4">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-grow">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">{item.price}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard size={18} />
                        <span className="text-sm">Total: <span className="font-semibold text-gray-900">{order.total}</span></span>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="text-gray-900 hover:bg-gray-100 rounded-full"
                        onClick={() => {
                          // Placeholder pour voir les détails
                          alert('🚧 La page de détails de commande arrive bientôt ! 🚀');
                        }}
                      >
                        Voir les détails
                        <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;