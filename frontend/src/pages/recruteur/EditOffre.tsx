import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EditOffre: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Modifier l'offre {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Formulaire de modification à venir...</p>
          <Button className="mt-4">Sauvegarder les modifications</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditOffre;
