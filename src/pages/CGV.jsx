import React from 'react';
import { Helmet } from 'react-helmet';

const CGV = () => {
  return <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Helmet>
        <title>Conditions Générales de Vente - Atelier Calista</title>
        <meta name="description" content="Consultez les Conditions Générales de Vente de l'Atelier Calista pour nos services de retouche." />
      </Helmet>
      
      <h1 className="text-4xl font-light text-gray-900 mb-8 text-center">Conditions Générales de Vente</h1>

      <div className="prose prose-lg max-w-none text-gray-700">
        <p>En vigueur au 18/11/2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 1 - Objet</h2>
      <p>Les présentes conditions régissent les ventes par Atelier Calista, entreprise individuelle immatriculée sous le numéro SIRET 91257108000015, exploitée par Mélina Lory, auto-entrepreneure, de services de retouches et réparations de vêtements.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 2 - Prix</h2>
        <p>Les prix de nos services sont indiqués en euros. La TVA n'est pas applicable, conformément à l'article 293 B du Code général des impôts. Toutes les commandes quelle que soit leur origine sont payables en euros.</p>
        <p>La société Atelier Calista se réserve le droit de modifier ses prix à tout moment, mais le service sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 3 - Commande et Paiement</h2>
        <p>Vous pouvez passer commande sur le site internet https://ateliercalista.fr. Les informations contractuelles sont présentées en langue française et feront l'objet d'une confirmation au plus tard au moment de la validation de votre commande.</p>
        <p>Le fait de valider votre commande implique pour vous l'obligation de payer le prix indiqué. Le règlement de vos achats s'effectue par carte bancaire grâce au système sécurisé Stripe.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 4 - Validation de votre commande</h2>
        <p>Toute commande figurant sur le site Internet suppose l'adhésion aux présentes Conditions Générales. Toute confirmation de commande entraîne votre adhésion pleine et entière aux présentes conditions générales de vente, sans exception ni réserve.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 5 - Délais de service</h2>
        <p>Les délais de réalisation des services sont donnés à titre indicatif. Un délai estimatif vous sera communiqué lors du dépôt de vos articles. Atelier Calista s'engage à faire ses meilleurs efforts pour respecter ces délais mais ne pourra être tenu responsable des retards.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 6 - Rétractation et Retours</h2>
        <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de services pleinement exécutées avant la fin du délai de rétractation, lorsque l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation, ni aux biens ou services nettement personnalisés.</p>
        <p>Nos services étant des prestations personnalisées, aucun retour ou remboursement ne sera possible une fois la prestation réalisée. Pour toute réclamation, veuillez nous contacter directement.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 7 - Garanties Légales</h2>
        <p>Conformément à la loi, Atelier Calista assume les garanties de conformité et relatives aux vices cachés des prestations. Chaque réparation est garantie pour une durée de 3 mois dans le cadre du label Refashion.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 8 - Responsabilité</h2>
        <p>La responsabilité de la société Atelier Calista ne saurait être engagée pour tous les inconvénients ou dommages inhérents à l'utilisation du réseau Internet, notamment une rupture de service, une intrusion extérieure ou la présence de virus informatiques.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 9 - Droit applicable en cas de litiges</h2>
        <p>La langue du présent contrat est la langue française. Les présentes conditions de vente sont soumises à la loi française. En cas de litige, les tribunaux français seront les seuls compétents.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Article 10 - Informations sur l'entreprise</h2>
        <p>
          Atelier Calista, entreprise individuelle immatriculée sous le numéro SIRET 91257108000015, exploitée par Mélina Lory, auto-entrepreneure.<br />
          Adresse : 11 Rue Denise Vernay, 33100 Bordeaux, France<br />
          Email : <a href="mailto:contact-ateliercalista@gmail.com">contact-ateliercalista@gmail.com</a>
        </p>
      </div>
    </div>;
};
export default CGV;