import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UploadCv: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload de CV</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Interface d'upload de CV à venir...</p>
          <Button className="mt-4">Choisir un fichier</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadCv;
