import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Questions Fréquemment Posées</h1>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Comment postuler à une offre ?</h3>
          <p>Créez un compte candidat, complétez votre profil et cliquez sur "Postuler" sur l'offre qui vous intéresse.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Comment publier une offre d'emploi ?</h3>
          <p>Créez un compte recruteur et utilisez l'interface de création d'offre dans votre tableau de bord.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Comment fonctionne le scoring ?</h3>
          <p>Notre IA analyse automatiquement les CV et les compare aux exigences de l'offre pour attribuer un score.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
