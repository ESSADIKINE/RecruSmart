import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">À propos de RecruSmart</h1>
      <p className="text-lg mb-4">
        RecruSmart est une plateforme innovante qui connecte les candidats talentueux 
        avec les entreprises à la recherche de nouveaux collaborateurs.
      </p>
      <p className="text-lg mb-4">
        Notre mission est de simplifier le processus de recrutement en utilisant 
        l'intelligence artificielle pour analyser les CV et faire correspondre 
        les meilleurs candidats aux offres d'emploi.
      </p>
    </div>
  );
};

export default About;
