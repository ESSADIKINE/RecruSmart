# Intégration Service-Intelligence pour les Notifications Top Candidates

## Événement d'entrée : `Recruitment.Scoring.Demande`

Le service-intelligence reçoit déjà cet événement avec les données suivantes :
```json
{
  "offreId": "68513b6edf54e6694b1e141a",
  "top": 5,
  "token": "Bearer ...",
  "offre": {
    "titre": "Développeur Full Stack",
    "description": "...",
    // ... autres propriétés de l'offre
  },
  "candidats": [
    {
      "utilisateurId": "68518298224e8d7f063f495f",
      "email": "candidat1@gmail.com",
      "score": 0,
      // ... autres propriétés du candidat
    }
    // ... autres candidats
  ]
}
```

## Modifications requises dans le Service-Intelligence

### 1. Après le calcul des scores

Une fois que le service-intelligence a calculé tous les scores et les a mis à jour via l'API du service-offre, il doit :

1. **Trier les candidats par score décroissant**
2. **Sélectionner les N meilleurs** (où N = `top` du payload)
3. **Publier un nouvel événement** `Recruitment.Notification.TopCandidates`

### 2. Nouvel événement à publier

```javascript
// Dans le service-intelligence, après le scoring
const topCandidats = candidatsTries.slice(0, top);

await publishEvent('Recruitment.Notification.TopCandidates', {
  offreId: offreId,
  top: top,
  titreOffre: offre.titre,
  candidats: topCandidats.map((candidat, index) => ({
    utilisateurId: candidat.utilisateurId,
    email: candidat.email,
    prenom: candidat.prenom || 'Candidat',
    score: candidat.score,
    position: index + 1
  }))
});
```

### 3. Format de l'événement de sortie

```json
{
  "offreId": "68513b6edf54e6694b1e141a",
  "top": 5,
  "titreOffre": "Développeur Full Stack",
  "candidats": [
    {
      "utilisateurId": "6852998bbb403cea3d0222ce",
      "email": "candidat2@gmail.com",
      "prenom": "Candidat",
      "score": 92,
      "position": 1
    },
    {
      "utilisateurId": "68508c988d63c05b1313ea44",
      "email": "candidat@gmail.com",
      "prenom": "Candidat",
      "score": 85,
      "position": 2
    }
    // ... jusqu'à N candidats
  ]
}
```

## Flux complet

1. **Recruteur** → `POST /api/offres/{id}/score?top=10`
2. **Service-Offre** → Publie `Recruitment.Scoring.Demande` avec `top=10`
3. **Service-Intelligence** → Calcule les scores et met à jour via API
4. **Service-Intelligence** → Publie `Recruitment.Notification.TopCandidates`
5. **Service-Notifications** → Envoie emails aux 10 meilleurs candidats

## Notes importantes

- Le paramètre `top` est optionnel, par défaut 5
- Les candidats sont triés par score décroissant
- Chaque candidat reçoit un email personnalisé avec sa position
- Aucune modification nécessaire dans les autres services existants 