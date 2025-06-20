import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProfilCandidat: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Mon Profil Candidat</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Informations du profil à venir...</p>
          <Button className="mt-4">Modifier mon profil</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilCandidat;
