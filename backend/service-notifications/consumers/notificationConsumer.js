const { connectRabbit } = require('../config/rabbitmq');
const { sendEmail } = require('../utils/emailSender');
const { getUserById, getOffreById } = require('../apiGatewayClient');

const EVENT_MAP = {
  'Auth.PasswordReset.Requested': {
    template: 'resetPassword.html',
    subject: 'Réinitialisation de votre mot de passe'
  },
  'Auth.OTP.Sent': {
    template: 'otpCode.html',
    subject: 'Votre code de vérification'
  },
  'Recruitment.Offre.Publiée': {
    template: 'offresDuJour.html',
    subject: 'Les offres du jour'
  },
  'Recruitment.Message.Recruteur': {
    template: 'recruteurMessage.html',
    subject: 'Message du recruteur'
  },
  'Recruitment.Entretien.Planifié': {
    template: 'entretien.html',
    subject: 'Votre entretien est planifié'
  },
  'Recruitment.Candidat.Accepté': {
    template: 'acceptation.html',
    subject: 'Votre candidature a été acceptée'
  },
  'Recruitment.Candidat.Selectionne': {
    template: 'selectionCandidat.html',
    subject: 'Vous avez été sélectionné !'
  }
};

async function startConsumer() {
  const channel = await connectRabbit();
  channel.consume('notification-email-queue', async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      const conf = EVENT_MAP[event.type];
      
      if (conf) {
        // Cas spécial pour les candidats sélectionnés
        if (event.type === 'Recruitment.Notification.TopCandidates' && event.data && event.data.candidats) {
          for (let i = 0; i < event.data.candidats.length; i++) {
            const candidat = event.data.candidats[i];
            // Enrichir avec infos utilisateur et offre
            let prenom = candidat.prenom;
            try {
              const user = await getUserById(candidat.utilisateurId, event.data.token);
              prenom = user.name || user.prenom || prenom;
            } catch (e) { /* fallback */ }
            let titreOffre = event.data.titreOffre;
            try {
              const offre = await getOffreById(event.data.offreId, event.data.token);
              titreOffre = offre.titre || titreOffre;
            } catch (e) { /* fallback */ }
            const variables = {
              ...event.data,
              email: candidat.email,
              prenom,
              score: candidat.score,
              position: i + 1,
              titreOffre
            };
            await sendEmail({
              to: candidat.email,
              subject: conf.subject,
              templateName: conf.template,
              variables: variables
            });
            console.log('Email envoyé pour', event.type, 'à', candidat.email, 'position', i + 1);
          }
        } else if (event.type === 'Recruitment.Candidat.Accepté' && event.data && event.data.utilisateurId) {
          // Enrichir avec infos utilisateur
          let prenom = event.data.prenom;
          try {
            const user = await getUserById(event.data.utilisateurId, event.data.token);
            prenom = user.name || user.prenom || prenom;
          } catch (e) { /* fallback */ }
          const variables = { ...event.data, prenom };
          await sendEmail({
            to: event.data.email,
            subject: conf.subject,
            templateName: conf.template,
            variables
          });
          console.log('Email envoyé pour', event.type, 'à', event.data.email);
        } else if (event.data && event.data.email) {
          // Cas standard pour un seul email
          await sendEmail({
            to: event.data.email,
            subject: conf.subject,
            templateName: conf.template,
            variables: event.data
          });
          console.log('Email envoyé pour', event.type, 'à', event.data.email);
        }
      }
      channel.ack(msg);
    } catch (err) {
      console.error('Erreur traitement notification:', err);
      channel.nack(msg, false, false);
    }
  });
}

startConsumer(); 