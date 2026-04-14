
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Ruler, MoveHorizontal, AlertCircle } from 'lucide-react';

const guidesData = {
  raccourcir: {
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
  cintrer: {
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
  elargir: {
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
};

const guideVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
};

const StandaloneMeasurementGuide = React.memo(() => {
  const [activeGuide, setActiveGuide] = useState(null);

  const toggleGuide = useCallback((guideKey) => {
    setActiveGuide(prev => prev === guideKey ? null : guideKey);
  }, []);

  const GuideContent = useCallback(({ guideKey }) => {
    const guide = guidesData[guideKey];
    if (!guide) return null;

    return (
      <motion.div
        key={guideKey}
        variants={guideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mt-6 mb-4 p-6 bg-gray-50 rounded-xl border border-gray-200/80"
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
    );
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8 }}
      className="mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100"
    >
      <h2 className="text-3xl font-light text-gray-900 mb-6 text-center">Comment prendre vos mesures ?</h2>
      <p className="text-center text-gray-600 mb-8">
        Sélectionnez une catégorie pour afficher notre guide pas-à-pas.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
            variant={activeGuide === 'raccourcir' ? 'default' : 'outline'} 
            onClick={() => toggleGuide('raccourcir')}
            className="rounded-full"
        >
            Raccourcir
        </Button>
        <Button 
            variant={activeGuide === 'cintrer' ? 'default' : 'outline'} 
            onClick={() => toggleGuide('cintrer')}
            className="rounded-full"
        >
            Cintrer
        </Button>
        <Button 
            variant={activeGuide === 'elargir' ? 'default' : 'outline'} 
            onClick={() => toggleGuide('elargir')}
            className="rounded-full"
        >
            Élargir
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {activeGuide && <GuideContent guideKey={activeGuide} />}
      </AnimatePresence>
    </motion.section>
  );
});

StandaloneMeasurementGuide.displayName = "StandaloneMeasurementGuide";

export default StandaloneMeasurementGuide;
