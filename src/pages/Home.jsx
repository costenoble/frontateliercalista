import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkDetailModal from '@/components/WorkDetailModal';
import HowItWorksSection from '@/components/HowItWorksSection';
const myWorkData = [{
  id: 'ourlet-jean',
  title: 'Ourlet de Jean',
  image: '/assets/work-ourlet-jean.jpg',
  description: 'Réalisation d\'un ourlet simple sur un jean brut. La couture a été faite avec un fil de couleur ocre pour respecter le style original du pantalon. Le point utilisé est un point de chaînette pour plus de solidité et une finition authentique.',
  alt: 'Gros plan sur un ourlet de jean'
}, {
  id: 'reprise-taille',
  title: 'Reprise de Taille',
  image: '/assets/work-reprise-taille.jpg',
  description: 'Ajustement de la taille d\'uwa jupe en coton. Les pinces ont été redessinées pour épouser parfaitement la silhouette de la cliente. Une attention particulière a été portée à la symétrie et au confort.',
  alt: 'Esquisses et échantillons de tissus pour un projet de couture'
}, {
  id: 'changement-zip',
  title: 'Changement de Zip',
  image: '/assets/work-changement-zip.jpg',
  description: 'Remplacement d\'une fermeture éclair cassée sur une veste en cuir. Un zip métallique de haute qualité a été posé pour garantir une meilleure durabilité. La couture a été réalisée à la machine avec un fil spécial cuir.',
  alt: 'Panier de couture avec ciseaux, fils et tissus'
}, {
  id: 'transformation-robe',
  title: 'Transformation de Robe',
  image: '/assets/work-transformation-robe.jpg',
  description: 'Une ancienne robe a été transformée en une jupe moderne et un haut assorti. Le tissu a été coupé, réassemblé et ajusté pour créer une tenue entièrement nouvelle et sur-mesure.',
  alt: 'Robe de mariée ajustée sur un mannequin par des mains expertes'
}];
const faqData = [{
  question: "Faut-il prendre rendez-vous pour une retouche ?",
  answer: <>
        Les rendez-vous sont nécessaires uniquement les jeudis et vendredis. Pour déposer vos retouches sur votre lieu de travail, aucun rendez-vous n'est nécessaire. Pour les dépôts à la Maison de Quartier Elsa Triolet, il n'est pas nécessaire de prendre rendez-vous, mais les retouches doivent être déposées pendant les créneaux indiqués.
      </>
}, {
  question: "Quels sont vos horaires d'ouverture ?",
  answer: <>
        <p className="mb-2"><strong>Maison de quartier Elsa Triolet, Bordeaux Brazza</strong></p>
        <ul className="list-disc pl-5 mb-2">
          <li>Les Lundis : de 14h30 à 17h</li>
          <li>Les mercredis : de 14h30 à 19h</li>
        </ul>
        <p className="mb-2"><strong>Quartier Brazza, Bordeaux</strong></p>
        <ul className="list-disc pl-5 mb-2">
          <li>Les jeudis : 10h-19h</li>
          <li>Les vendredis : 10h-18h</li>
        </ul>
        Retrouvez le détail complet des horaires pour chaque adresse directement sur la page <Link to="/contact" className="text-primary hover:underline font-medium">Contact</Link>.
      </>
}, {
  question: "Comment connaître le tarif d'une retouche ?",
  answer: <>
        Tous les tarifs sont indiqués dans la rubrique <Link to="/alterations" className="text-primary hover:underline font-medium">Retouches</Link>. Pour toute demande spécifique ou doute, contactez moi pour un devis rapide.
      </>
}, {
  question: "Combien de temps faut-il pour une retouche simple (ourlet, reprise…) ?",
  answer: "En moyenne, comptez 7 à 10 jours ouvrés pour une retouche simple. Selon le volume de retouches à traiter, ce délai peut légèrement varier."
}, {
  question: "Proposez-vous des créations pour la maison (rideaux, coussins, etc.) ?",
  answer: "Oui, je réalise ce type de créations uniquement sur devis."
}, {
  question: "Proposez-vous des retouches urgentes ?",
  answer: "Oui, merci de me contacter directement avant de déposer vos retouches. Je vous indiquerai les délais possibles en fonction de mon planning. Un supplément de 5€ par retouche est appliqué pour ce service."
}, {
  question: "Qu'est-ce que le Bonus Réparation ?",
  answer: "Le Bonus Réparation est un dispositif qui encourage la réparation et la remise en état des textiles plutôt que leur remplacement. Il permet à mes clients de bénéficier de réductions sur certaines retouches et réparations, y compris pour le linge de maison, favorisant ainsi une mode plus durable."
}];
const AccordionItem = ({
  item,
  isOpen,
  onToggle
}) => {
  return <div className="border-b border-gray-200 py-4" onMouseEnter={onToggle} onMouseLeave={onToggle}>
      <div className="flex justify-between items-center cursor-pointer">
        <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
        <motion.div animate={{
        rotate: isOpen ? 180 : 0
      }} transition={{
        duration: 0.3
      }}>
          {isOpen ? <Minus className="text-primary" /> : <Plus />}
        </motion.div>
      </div>
      <motion.div initial={false} animate={{
      height: isOpen ? 'auto' : 0,
      opacity: isOpen ? 1 : 0,
      marginTop: isOpen ? '1rem' : '0rem'
    }} transition={{
      duration: 0.3
    }} className="overflow-hidden">
        <div className="text-gray-600 leading-relaxed">
          {item.answer}
        </div>
      </motion.div>
    </div>;
};
const Home = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const openModal = useCallback(work => {
    setSelectedWork(work);
  }, []);
  const closeModal = useCallback(() => {
    setSelectedWork(null);
  }, []);
  const toggleFaq = index => {
    setOpenFaq(openFaq === index ? null : index);
  };
  return <>
      <Helmet>
        <title>Atelier Calista - L'art de la retouche</title>
        <meta name="description" content="Découvrez l'art de la retouche sur mesure. Des services de couture pour donner une nouvelle vie à vos vêtements." />
      </Helmet>

      <div className="bg-white">
        <section className="relative min-h-[85vh] flex items-center pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.8
            }}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-gray-900 mb-6">Retoucherie Bordelaise, à portée de main.</h1>
                <motion.p initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2,
                duration: 0.8
              }} className="text-lg text-gray-600 mb-8 max-w-lg">Service de couture et retouches textiles durables à Bordeaux , pour particuliers et entreprises, à l'atelier ou sur votre lieu de travail. </motion.p>
                <Link to="/alterations">
                  <Button className="rounded-full px-8 py-6 text-base">
                    Retouche
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.8,
              delay: 0.2
            }} className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <img className="w-full h-64 object-cover rounded-2xl" alt="Machine à coudre avec des fleurs par la fenêtre" src="/assets/home-hero-sewing.jpg" />
                    <img className="w-full h-48 object-cover rounded-2xl" alt="Détail d'une couture sur un vêtement" src="https://images.unsplash.com/photo-1532106674132-8ee96fd03871" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <img className="w-full h-48 object-cover rounded-2xl" alt="Bobines de fil colorées" src="https://images.unsplash.com/photo-1660733101161-a3bc6e134f48" />
                    <img className="w-full h-64 object-cover rounded-2xl" alt="Vêtement en cours de retouche sur un mannequin" src="https://images.unsplash.com/photo-1544177585-5d5e00788efa" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#EDE5DF] rounded-2xl mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center mb-12">
              <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-4">Mon savoir faire à votre service</h2>
              <p className="text-gray-600 max-w-2xl mx-auto"></p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {myWorkData.map((work, index) => <motion.div key={work.id} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }} className="group cursor-pointer" onClick={() => openModal(work)}>
                    <div className="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 aspect-square">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={work.alt} src={work.image} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-lg font-semibold">Voir le détail</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900">{work.title}</h3>
                    </div>
                  </motion.div>)}
              </div>
          </div>
        </section>

        <HowItWorksSection />
        
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.8
          }} className="text-center bg-[#EDE5DF] rounded-2xl p-10 md:p-16">
              <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-6">Projets Spéciaux & Créations sur Devis</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">Robes de mariée, costumes, rideaux sur-mesure, créations ou retouches complexes à Bordeaux !
Je mets mon expérience auprès de créateurs et boutiques spécialisées dans le mariage et le costume au service de vos projets uniques.</p>
              <Link to="/contact">
                <Button className="rounded-full px-8 py-6 text-base">
                  Me Contacter
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-[#EDE5DF] rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="text-center mb-12">
                <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-4">Questions Fréquentes</h2>
                <p className="text-gray-600">
                  Vous avez des questions ? Trouvez vos réponses ici.
                </p>
              </motion.div>
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                {faqData.map((item, index) => <AccordionItem key={index} item={item} isOpen={openFaq === index} onToggle={() => toggleFaq(index)} />)}
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true,
            amount: 0.3
          }} transition={{
            duration: 0.8
          }} className="text-center bg-[#EDE5DF] rounded-2xl p-10 md:p-16 flex flex-col items-center">
              <img src="/assets/logo-souliers-marie.png" alt="Les souliers de Marie logo" className="h-20 md:h-24 object-contain mb-8" />
              <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-6">Les Souliers de Marie – Partenaire entretien & réparation</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">Atelier Calista collabore avec Les Souliers de Marie pour vous proposer la collecte et la réparation de vos chaussures directement sur votre lieu de travail.</p>
              <a href="https://www.conciergeriecordo.com" target="_blank" rel="noopener noreferrer">
                <Button className="rounded-full px-8 py-6 text-base">
                  Découvrir Les Souliers de Marie
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
      {selectedWork && <WorkDetailModal work={selectedWork} onClose={closeModal} />}
    </>;
};
export default Home;
