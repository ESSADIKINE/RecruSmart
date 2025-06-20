import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OffreDetailRecruteur: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Détails de l'offre {id} (Recruteur)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Détails de l'offre pour le recruteur à venir...</p>
          <div className="flex gap-2 mt-4">
            <Button>Modifier</Button>
            <Button variant="outline">Voir les candidats</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffreDetailRecruteur;
