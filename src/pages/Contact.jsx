import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AvailabilityCalendar = () => {
    const [availabilitiesByPoint, setAvailabilitiesByPoint] = useState({});
    const [loading, setLoading] = useState(true);
    const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    useEffect(() => {
        const fetchAvailabilities = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('availabilities')
                .select(`
                  id,
                  day_of_week,
                  start_time,
                  end_time,
                  collection_points (
                    name,
                    address
                  )
                `)
                .order('day_of_week')
                .order('start_time');
            
            if (!error && data) {
                const groupedData = data.reduce((acc, curr) => {
                    const pointName = curr.collection_points?.name || 'Point de collecte';
                    const pointAddress = curr.collection_points?.address || '';
                    const { day_of_week, start_time, end_time } = curr;

                    if (!acc[pointName]) {
                        acc[pointName] = {
                            address: pointAddress,
                            days: {}
                        };
                    }

                    if (!acc[pointName].days[day_of_week]) {
                        acc[pointName].days[day_of_week] = [];
                    }

                    acc[pointName].days[day_of_week].push({
                        start: start_time.slice(0, 5),
                        end: end_time.slice(0, 5)
                    });

                    return acc;
                }, {});
                setAvailabilitiesByPoint(groupedData);
            }
            setLoading(false);
        };
        fetchAvailabilities();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8 bg-gray-50 rounded-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (Object.keys(availabilitiesByPoint).length === 0) {
        return null; // Don't render anything if no availabilities
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl bg-gray-50 mb-16"
        >
            <div className="flex items-center justify-center mb-6">
                 <Clock className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-light text-gray-900 text-center">Horaires par point de collecte</h3>
            </div>
            <div className="space-y-8">
                {Object.entries(availabilitiesByPoint).map(([pointName, pointData]) => (
                    <div key={pointName}>
                        <div className="text-center mb-4">
                            <h4 className="text-xl font-medium text-gray-900">{pointName}</h4>
                            {pointData.address && (
                                <p className="text-sm text-gray-500 mt-1">{pointData.address}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                            {DAYS_OF_WEEK.map((day, index) => (
                                <div key={`${pointName}-${index}`} className="p-3 rounded-lg bg-white shadow-sm">
                                    <p className="font-semibold text-gray-800">{day}</p>
                                    {pointData.days[day] ? (
                                        pointData.days[day].map((slot, i) => (
                                            <p key={i} className="text-sm text-primary mt-1">{slot.start} - {slot.end}</p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 mt-1">-</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};


const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
  };
  
  const contactInfo = [
      { icon: Mail, title: 'Email', content: 'contact.ateliercalista@gmail.com', link: 'mailto:contact.ateliercalista@gmail.com' },
      { icon: Phone, title: 'Téléphone', content: '0638292713', link: 'tel:0638292713' },
      { icon: MapPin, title: 'Me trouver ?', content: '11 Rue Denise Vernay, 33100 Bordeaux', link: 'https://www.google.com/maps?q=11+Rue+Denise+Vernay,+33100+Bordeaux' }
  ];

  return (
    <>
      <Helmet>
        <title>Contactez-moi - Atelier Calista</title>
        <meta name="description" content="Contactez l'Atelier Calista pour vos retouches, créations sur-mesure ou pour toute question." />
      </Helmet>

      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-gray-900 mb-6">Pour me contacter</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Vous pouvez me contacter via différents moyens.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
                <motion.a 
                    key={info.title} 
                    href={info.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, delay: index * 0.1 }} 
                    className="flex flex-col items-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                        <info.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{info.title}</h3>
                    <p className="text-gray-600 text-center">{info.content}</p>
                </motion.a>
            ))}
          </div>

          <AvailabilityCalendar />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-2xl bg-primary/10 mb-16 text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-primary mr-3" />
              <h3 className="text-2xl font-light text-gray-900">Prendre rendez-vous</h3>
            </div>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Pour un projet de création sur-mesure, une consultation ou toute autre demande spécifique, réservez un créneau directement dans mon agenda.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <a href="https://calendly.com/contact-ateliercalista" target="_blank" rel="noopener noreferrer">
                Réserver un créneau
              </a>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <img className="w-full h-[600px] object-cover rounded-2xl" alt="A patterned armchair in a well-lit room" src="/assets/contact-atelier.jpg" />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;
