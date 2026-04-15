import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <>
      <Helmet>
        <title>À Propos - Atelier Calista</title>
        <meta name="description" content="Découvrez l'histoire et la passion derrière l'Atelier Calista, votre couturière à Bordeaux." />
      </Helmet>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-[#EDE5DF] rounded-2xl mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }} className="text-5xl md:text-6xl font-light text-gray-900">
              L'histoire derrière chaque fil
            </motion.h1>
            <motion.p initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Je m'appelle Mélina et ce sont mes premiers pas dans la couture chez Yves Saint Laurent qui ont façonné mon regard sur le métier : exigence, minutie — un savoir-faire d'exception qui m'accompagne encore aujourd'hui.

Diplômée en stylisme-modélisme, j'ai ensuite travaillé plusieurs années dans le retail, où j'ai renforcé mon sens du service et de la relation client.
Puis l'évidence : revenir à ce que j'aime vraiment. Redonner vie aux vêtements.</motion.p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
                opacity: 0,
                x: -20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.8
              }}>
                <img className="rounded-2xl shadow-lg w-full h-auto object-cover" alt="Atelier de couture avec machine à coudre et tissus" src="https://images.unsplash.com/photo-1702846196370-f717f45999fa" />
              </motion.div>
              <motion.div initial={{
                opacity: 0,
                x: 20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.8
              }}>
                <h2 className="text-4xl font-light text-gray-900">Au cœur de l'atelier</h2>
                <p className="mt-4 text-lg text-gray-600">À Bordeaux, j'accompagne particuliers et entreprises avec un service de retouches précis, soigné et fiable. Chaque pièce est travaillée avec attention, pour retrouver confort, ajustement et longévité.

Atelier Calista est labellisé Bonus Réparation :
vous bénéficiez de réductions sur certaines réparations textiles et linge de maison.
Un geste simple pour une mode plus responsable.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Realized with Care Section (Moved from Home.jsx) - Now first of the swapped sections */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
                opacity: 0,
                x: -20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.8
              }}>
                <img className="w-full h-[500px] object-cover rounded-2xl" alt="Vue de l'atelier de couture avec des tissus et outils" src="https://images.unsplash.com/photo-1626541219447-9e00f8707d14" />
              </motion.div>

              <motion.div initial={{
                opacity: 0,
                x: 20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.8
              }}>
                <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-6">Projets sur mesure</h2>
                <p className="text-lg text-gray-600 mb-6">Je réalise également des créations sur-mesure : rideaux - housse de coussin - vêtements adulte/enfant - accessoires. Des retouches complexes : robes de mariée - costumes. 
Mon expérience auprès de marques et créateurs spécialisés dans le mariage me permet d'assurer un travail précis, créatif et parfaitement ajusté. Je propose aussi des cours de couture à la Maison de Quartier Elsa Triolet, au cœur du quartier Brazza.</p>
                <p className="text-lg text-gray-600 mb-8" />
                <Link to="/contact">
                  <Button className="rounded-full px-8 py-6">
                    Me Contacter
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section - Now second of the swapped sections */}
        <section className="py-20 mx-4 sm:mx-6 lg:mx-8 bg-[#EDE5DF] rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-light text-gray-900">Une passion pour la couture, un savoir-faire à préserver</h2>
            <p className="mt-4 text-lg text-gray-600" />
            <div className="mt-12 flex justify-center">
              <motion.div initial={{
                opacity: 0,
                scale: 0.9
              }} whileInView={{
                opacity: 1,
                scale: 1
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.6
              }} className="text-center">
                <img className="mx-auto h-40 w-40 object-cover rounded-2xl" alt="Mélina souriante, assise devant une machine à coudre, se concentrant sur son travail." src="/assets/about-melina.jpg" />
                <h3 className="mt-6 text-2xl font-medium text-gray-900">Mélina</h3>
                <p className="text-md text-gray-600">Gérante & Couturière</p>
                <p className="mt-2 text-md text-gray-500 max-w-xs mx-auto">Ma vision : Préserver, Sublimer,  Transmettre. Parce que vos vêtements ont une histoire — et méritent de continuer à vivre</p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
