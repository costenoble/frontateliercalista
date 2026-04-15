import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, MoveHorizontal, MoveVertical, AlertCircle, CassetteTape as Tape } from 'lucide-react';

const measurementGuides = {
  // Use service name as a key, assuming they are unique.
  // In a real app, it would be better to use service IDs.
  'Ourlet pantalon (simple)': {
    title: "Mesurer pour un ourlet de pantalon",
    icon: <Ruler className="w-8 h-8 text-blue-500" />,
    instructions: [
      "Enfilez le pantalon avec les chaussures que vous portez habituellement avec.",
      "Repliez l'excédent de tissu vers l'intérieur jusqu'à obtenir la longueur désirée.",
      "Fixez le pli avec une épingle de sûreté bien à plat.",
      "Mesurez la hauteur de l'ourlet (la partie repliée) en centimètres."
    ],
    tip: "Pour un résultat optimal, demandez à quelqu'un de vous aider à épingler l'ourlet pendant que vous vous tenez droit."
  },
  'Cintrer (reprise simple)': {
    title: "Mesurer pour cintrer un vêtement",
    icon: <MoveHorizontal className="w-8 h-8 text-green-500" />,
    instructions: [
      "Enfilez le vêtement (chemise, veste, robe...).",
      "Pincez l'excédent de tissu de chaque côté au niveau de la taille ou du dos jusqu'à ce que la coupe vous plaise.",
      "Demandez à quelqu'un de placer des épingles le long de la ligne de cintrage souhaitée.",
      "Mesurez la largeur totale de tissu à retirer (somme des deux côtés)."
    ],
    tip: "Assurez-vous de pouvoir bouger et vous asseoir confortablement. Le vêtement doit être ajusté, pas serré."
  },
  'Élargir (avec aisance)': {
    title: "Mesurer pour élargir un vêtement",
    icon: <MoveHorizontal className="w-8 h-8 text-purple-500 transform scale-x-[-1]" />,
    instructions: [
      "Enfilez le vêtement pour identifier les zones trop serrées (taille, hanches, poitrine).",
      "Mesurez l'aisance manquante en centimètres. Utilisez un mètre ruban pour voir de combien vous auriez besoin en plus pour être à l'aise.",
      "Indiquez la valeur totale en cm à ajouter sur la circonférence de la zone concernée.",
      "Vérifiez les coutures existantes ; l'élargissement n'est possible que s'il y a une marge de tissu suffisante à l'intérieur."
    ],
    tip: "L'élargissement est plus complexe. Si vous avez un doute, indiquez simplement la zone qui serre et nous vous conseillerons."
  },
   'Réparation simple (ex: bouton, petite couture)': {
    title: "Indiquer une réparation simple",
    icon: <Tape className="w-8 h-8 text-orange-500" />,
    instructions: [
        "Marquez très précisément l'emplacement de la réparation avec une épingle de sûreté ou un fil de couleur contrastée.",
        "Prenez une photo nette de la zone à réparer, avec l'épingle visible.",
        "Décrivez clairement le problème dans le champ 'Description' du formulaire.",
        "S'il s'agit d'un bouton à remplacer, joignez si possible le bouton d'origine ou un bouton de rechange."
    ],
    tip: "Une bonne photo vaut mille mots. Assurez-vous qu'elle soit bien éclairée et focalisée sur la zone endommagée."
  }
};

const guideItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
};

const MeasurementGuide = ({ selectedServices, allServices }) => {
  const activeGuides = selectedServices
    .map(serviceId => {
      const service = allServices.find(s => s.id === serviceId);
      // Map service.service to a guide if it exists
      // This mapping logic can be improved if service names are not consistent
      if (service && service.service.startsWith('Ourlet')) {
          return measurementGuides['Ourlet pantalon (simple)'];
      }
      if (service && service.service.startsWith('Cintrer')) {
          return measurementGuides['Cintrer (reprise simple)'];
      }
      if (service && service.service.startsWith('Élargir')) {
          return measurementGuides['Élargir (avec aisance)'];
      }
      if (service && service.service.startsWith('Réparation simple')) {
          return measurementGuides['Réparation simple (ex: bouton, petite couture)'];
      }
      return null;
    })
    .filter(Boolean);
    
  // Remove duplicates
  const uniqueGuides = [...new Set(activeGuides)];

  if (uniqueGuides.length === 0) {
    return null;
  }

  return (
    <motion.section 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
      className="mt-12 p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
    >
      <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6 text-center">Comment prendre vos mesures ?</h2>
      <AnimatePresence mode="popLayout">
        {uniqueGuides.map((guide, index) => (
          <motion.div
            layout
            key={guide.title}
            variants={guideItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200/80"
          >
            <div className="flex items-center mb-4">
              <div className="mr-4 bg-white p-3 rounded-full shadow-sm">
                {guide.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{guide.title}</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-gray-700 mb-4">
              {guide.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
            <div className="flex items-start p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{guide.tip}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.section>
  );
};

export default MeasurementGuide;