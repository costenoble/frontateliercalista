import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const steps = [
  {
    step: 1,
    label: "Étape 1 — Choix de la formule",
    title: "Vous choisissez votre formule",
    description: "Sur la page « Retouches », vous choisissez la formule qui correspond à votre besoin : ourlets, reprise de taille, réparation, ajustement spécifique… Tout est clairement expliqué pour vous guider.",
  },
  {
    step: 2,
    label: "Étape 2 — Dépôt du vêtement",
    title: "Vous déposez votre vêtement",
    description: "Vous sélectionnez votre point de collecte, vous validez le paiement, puis Mélina s'occupe du reste. N'oubliez pas de cliquer sur le lien « Je dépose mon vêtement » reçu par e-mail : cela permet à Mélina d'être informée que votre vêtement est bien arrivé au point de collecte choisi.",
  },
  {
    step: 3,
    label: "Étape 3 — La magie de l'atelier",
    title: "La magie opère à l'Atelier Calista",
    description: "Votre vêtement est pris en charge au sein de l'Atelier Calista. Mélina réalise les retouches, ajustements et réparations avec soin, en respectant votre demande et la finition souhaitée.",
  },
  {
    step: 4,
    label: "Étape 4 — Récupération du vêtement",
    title: "Vous récupérez votre vêtement",
    description: "Une fois l'ajustement et/ou la réparation terminée, vous recevez un e-mail vous indiquant le jour de récupération. Vous pourrez alors venir chercher votre vêtement au même point de collecte que celui choisi au départ.",
  },
];

const StepContent = ({ step, setActiveStep }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-40% 0px -60% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveStep(step.step);
    }
  }, [isInView, setActiveStep, step.step]);

  return (
    <div ref={ref} className="min-h-[70vh] flex items-center">
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full bg-white/80 border border-gray-200 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
        >
            <p className="text-base uppercase tracking-widest text-gray-400 mb-4">{step.label}</p>
            <h3 className="text-4xl md:text-5xl font-light text-gray-800 mb-6">{step.title}</h3>
            <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
      </motion.div>
    </div>
  );
};

const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(1);
  const otherSteps = steps.filter(s => s.step !== activeStep);

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Desktop View */}
        <div className="hidden lg:grid lg:grid-cols-2">
          <div className="lg:col-span-1 pr-12 bg-[#A8766A] rounded-3xl"> {/* Changed background color to #A8766A */}
            <div className="sticky top-28 h-[calc(100vh-7rem)] flex flex-col justify-center text-white pl-5"> {/* Added pl-5 */}
              <div>
                <p className="text-2xl uppercase tracking-widest text-white mb-10">Comment ça marche ?</p>
                <div className="relative h-48 mb-12">
                     <AnimatePresence mode="wait">
                        <motion.h2 
                            key={activeStep}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="font-light text-7xl text-white absolute inset-0 leading-tight"
                        >
                            {steps[activeStep - 1]?.title}
                        </motion.h2>
                    </AnimatePresence>
                </div>
                <div className="flex">
                    <div className="w-px bg-white/50 mr-8"></div>
                    <ul className="space-y-4">
                        {otherSteps.map((step) => (
                          <motion.li 
                            key={step.step}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-gray-200 text-xl font-light">
                            {step.title}
                          </motion.li>
                        ))}
                    </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 pl-12">
            {steps.map((step) => (
              <StepContent key={step.step} step={step} setActiveStep={setActiveStep} />
            ))}
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
            <div className="text-center mb-16">
                 <h2 className="text-4xl font-light text-gray-800 mb-4">Comment ça marche ?</h2>
                 <p className="text-gray-600 max-w-2xl mx-auto">
                    De la première prise de contact à la remise de votre vêtement, découvrez le processus de création et de retouche sur-mesure.
                 </p>
            </div>
            <div className="space-y-10">
                {steps.map((step) => (
                  <div key={step.step} className="bg-white/80 border border-gray-200 rounded-3xl p-8">
                      <p className="text-base uppercase tracking-widest text-gray-400 mb-3">{step.label}</p>
                      <h3 className="text-3xl font-light text-gray-800 mb-4">{step.title}</h3>
                      <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;