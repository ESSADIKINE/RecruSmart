import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contactez-nous</h1>
      <p className="text-lg mb-4">
        Vous avez des questions ? Nous sommes là pour vous aider !
      </p>
      <div className="space-y-4">
        <p><strong>Email :</strong> contact@recrusmart.com</p>
        <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
        <p><strong>Adresse :</strong> 123 Rue de l'Innovation, 75001 Paris</p>
      </div>
    </div>
  );
};

export default Contact;
