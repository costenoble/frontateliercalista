import React from 'react';
import { Helmet } from 'react-helmet';
const MentionsLegales = () => {
  return <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Helmet>
        <title>Mentions Légales - Atelier Calista</title>
        <meta name="description" content="Consultez les mentions légales de l'Atelier Calista : identité, hébergement, et conditions." />
      </Helmet>
      
      <h1 className="text-4xl font-light text-gray-900 mb-8 text-center">Mentions Légales</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Identité de l'entreprise</h2>
        <p>
          Atelier Calista, entreprise individuelle immatriculée sous le numéro SIRET 91257108000015, exploitée par Mélina Lory, auto-entrepreneure.<br />
          <strong>Adresse du siège social :</strong> 11 Rue Denise Vernay Bordeaux, France<br />
          <strong>Adresse e-mail :</strong> <a href="mailto:contact-ateliercalista@gmail.com">contact-ateliercalista@gmail.com</a><br />
          <strong>Responsable de la publication :</strong> Mélina Lory
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Hébergement du site</h2>
        <p>
          Ce site est hébergé par Hostinger.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Conditions de remboursement</h2>
        <p>
          Les services de retouche étant des prestations personnalisées et réalisées sur demande, ils ne sont pas éligibles au remboursement une fois la prestation commencée ou terminée, conformément à la législation en vigueur sur les biens personnalisés. En cas d'insatisfaction, nous vous invitons à nous contacter pour trouver une solution amiable.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Responsabilité</h2>
        <p>
          Atelier Calista s'efforce de fournir une information aussi précise que possible sur son site. Toutefois, l'entreprise ne pourra être tenue pour responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
        </p>
        <p>
          Atelier Calista décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Droit applicable et attribution de juridiction</h2>
        <p>Tout litige en relation avec l’utilisation du site https://ateliercalista.fr est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Bordeaux.</p>
      </div>
    </div>;
};
export default MentionsLegales;