import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Postuler: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Postuler à l'offre {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Formulaire de candidature à venir...</p>
          <Button className="mt-4">Soumettre ma candidature</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Postuler;
