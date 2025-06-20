import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MesOffres: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Offres</h1>
        <Button>Créer une nouvelle offre</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste de mes offres</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Liste des offres à venir...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MesOffres;
