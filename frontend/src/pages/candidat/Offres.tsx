import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Offre {
  id: string;
  titre: string;
  description: string;
  entreprise: string;
  lieu: string;
  type: string;
  datePublication: string;
}

const Offres: React.FC = () => {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch offres from API
    const mockOffres: Offre[] = [
      {
        id: '1',
        titre: 'Développeur Full Stack',
        description: 'Nous recherchons un développeur full stack expérimenté...',
        entreprise: 'TechCorp',
        lieu: 'Paris',
        type: 'CDI',
        datePublication: '2024-01-15'
      },
      {
        id: '2',
        titre: 'Data Scientist',
        description: 'Rejoignez notre équipe de data science...',
        entreprise: 'DataLab',
        lieu: 'Lyon',
        type: 'CDI',
        datePublication: '2024-01-14'
      }
    ];
    setOffres(mockOffres);
    setIsLoading(false);
  }, []);

  const filteredOffres = offres.filter(offre =>
    offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offre.entreprise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Offres d'emploi</h1>
        <Input
          placeholder="Rechercher une offre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="grid gap-4">
        {filteredOffres.map((offre) => (
          <Card key={offre.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{offre.titre}</CardTitle>
                  <CardDescription className="text-lg">{offre.entreprise}</CardDescription>
                </div>
                <Badge variant="secondary">{offre.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{offre.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{offre.lieu}</span>
                <Button>Voir détails</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Offres;
