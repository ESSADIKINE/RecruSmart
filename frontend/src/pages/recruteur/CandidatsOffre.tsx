import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CandidatsOffre: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Candidats pour l'offre {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Liste des candidats à venir...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatsOffre;
