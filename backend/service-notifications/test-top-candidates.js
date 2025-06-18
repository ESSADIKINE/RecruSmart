const { connectRabbit } = require('./config/rabbitmq');

// Simulation de l'événement TopCandidates
const testEvent = {
  type: 'Recruitment.Notification.TopCandidates',
  data: {
    offreId: '68513b6edf54e6694b1e141a',
    top: 3,
    titreOffre: 'Développeur Full Stack',
    candidats: [
      {
        utilisateurId: '6852998bbb403cea3d0222ce',
        email: 'candidat2@gmail.com',
        prenom: 'Ahmed',
        score: 92,
        position: 1
      },
      {
        utilisateurId: '68508c988d63c05b1313ea44',
        email: 'candidat@gmail.com',
        prenom: 'Fatima',
        score: 85,
        position: 2
      },
      {
        utilisateurId: '68518298224e8d7f063f495f',
        email: 'candidat1@gmail.com',
        prenom: 'Karim',
        score: 78,
        position: 3
      }
    ]
  }
};

async function testTopCandidatesNotification() {
  try {
    const channel = await connectRabbit();
    
    // Publier l'événement de test
    await channel.publish(
      'recrusmart.events',
      'Recruitment.Notification.TopCandidates',
      Buffer.from(JSON.stringify(testEvent)),
      { persistent: true }
    );
    
    console.log('Événement de test publié avec succès');
    console.log('Vérifiez les logs du consumer pour voir les emails envoyés');
    
    // Attendre un peu pour que le consumer traite l'événement
    setTimeout(() => {
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
    process.exit(1);
  }
}

// Lancer le test si le script est exécuté directement
if (require.main === module) {
  testTopCandidatesNotification();
}

module.exports = { testTopCandidatesNotification }; 