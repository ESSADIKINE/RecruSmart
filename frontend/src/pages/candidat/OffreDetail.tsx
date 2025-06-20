import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OffreDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Détails de l'offre {id}</CardTitle>
          <Badge variant="secondary">CDI</Badge>
        </CardHeader>
        <CardContent>
          <p>Détails de l'offre à venir...</p>
          <Button className="mt-4">Postuler</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffreDetail;
