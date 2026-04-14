import React from 'react';
import { Helmet } from 'react-helmet';

const PolitiqueConfidentialite = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Helmet>
        <title>Politique de Confidentialité (RGPD) - Atelier Calista</title>
        <meta name="description" content="Notre politique de confidentialité explique comment l'Atelier Calista collecte, utilise et protège vos données personnelles." />
      </Helmet>
      
      <h1 className="text-4xl font-light text-gray-900 mb-8 text-center">Politique de Confidentialité (RGPD)</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p>Dernière mise à jour : 18/11/2025</p>

        <p>
          Le responsable du traitement des données est Atelier Calista, entreprise individuelle immatriculée sous le numéro SIRET 91257108000015, exploitée par Mélina Lory, auto-entrepreneure.
        </p>
        <p>
          Atelier Calista, soucieuse des droits des individus, notamment au regard des traitements automatisés et dans une volonté de transparence avec ses clients, a mis en place une politique reprenant l’ensemble de ces traitements, des finalités poursuivies par ces derniers ainsi que des moyens d’actions à la disposition des individus afin qu’ils puissent au mieux exercer leurs droits.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Collecte des données personnelles</h2>
        <p>
          Les données personnelles que nous collectons sont les suivantes :
        </p>
        <ul>
          <li><strong>Informations de contact :</strong> Nom, prénom, adresse email, lors de la soumission d'un formulaire de commande ou de contact.</li>
          <li><strong>Informations de commande :</strong> Services choisis, notes, photos des vêtements (pour les réparations).</li>
          <li><strong>Données de paiement :</strong> Les informations de paiement sont traitées directement par notre prestataire sécurisé Stripe et ne sont pas stockées sur nos serveurs.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Finalité du traitement des données</h2>
        <p>
          Vos données sont collectées pour les finalités suivantes :
        </p>
        <ul>
          <li>Gérer et traiter vos commandes de retouches.</li>
          <li>Communiquer avec vous concernant votre commande.</li>
          <li>Assurer le suivi client et répondre à vos demandes.</li>
          <li>Traiter le paiement de votre commande via notre prestataire.</li>
        </ul>
        <p>Nous ne vendons, ni ne louons, ni ne partageons vos données personnelles avec des tiers à des fins de marketing sans votre consentement explicite.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Durée de conservation des données</h2>
        <p>
          Vos données sont conservées pendant la durée nécessaire à la gestion de la relation commerciale. Les données relatives aux commandes sont conservées pour une durée conforme aux obligations légales (notamment comptables et fiscales).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Vos droits sur vos données</h2>
        <p>
          Conformément au Règlement (UE) 2016/679 (RGPD), vous disposez des droits suivants concernant vos données personnelles :
        </p>
        <ul>
          <li>Droit d'accès, de rectification, de mise à jour et de complétude de vos données.</li>
          <li>Droit d'effacement (« droit à l'oubli ») de vos données.</li>
          <li>Droit de retirer à tout moment votre consentement.</li>
          <li>Droit à la limitation du traitement de vos données.</li>
          <li>Droit à la portabilité des données que vous nous avez fournies.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Comment exercer vos droits</h2>
        <p>
          Pour exercer l'un de ces droits, vous pouvez nous contacter par email à l'adresse suivante : <a href="mailto:contact-ateliercalista@gmail.com">contact-ateliercalista@gmail.com</a>, ou par courrier à l'adresse postale mentionnée dans nos mentions légales, en joignant une copie d'un titre d'identité.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact</h2>
        <p>
          Pour toute question relative à la présente politique de confidentialité ou pour toute demande relative à vos données personnelles, vous pouvez nous contacter à : <a href="mailto:contact-ateliercalista@gmail.com">contact-ateliercalista@gmail.com</a>.
        </p>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;