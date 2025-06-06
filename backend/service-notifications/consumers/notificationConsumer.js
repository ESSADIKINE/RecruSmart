const { connectRabbit } = require('../config/rabbitmq');
const { sendEmail } = require('../utils/emailSender');

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
  }
};

async function startConsumer() {
  const channel = await connectRabbit();
  channel.consume('notification-email-queue', async (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString());
      const conf = EVENT_MAP[event.type];
      if (conf && event.data && event.data.email) {
        await sendEmail({
          to: event.data.email,
          subject: conf.subject,
          templateName: conf.template,
          variables: event.data
        });
        console.log('Email envoyé pour', event.type, 'à', event.data.email);
      }
      channel.ack(msg);
    } catch (err) {
      console.error('Erreur traitement notification:', err);
      channel.nack(msg, false, false);
    }
  });
}

startConsumer(); 