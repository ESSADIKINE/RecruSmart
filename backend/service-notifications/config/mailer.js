const nodemailer = require('nodemailer');

// Configuration pour différents environnements
const getTransporterConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  // Configuration pour Mailtrap (test)
  if (env === 'test' || process.env.USE_MAILTRAP === 'true') {
    return {
      host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
      port: process.env.MAILTRAP_PORT || 2525,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER || 'your_mailtrap_user',
        pass: process.env.MAILTRAP_PASS || 'your_mailtrap_pass'
      }
    };
  }
  
  // Configuration pour Gmail (production)
  if (env === 'production' && process.env.GMAIL_USER) {
    return {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Utiliser un mot de passe d'application
      }
    };
  }
  
  // Configuration pour SMTP personnalisé
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    };
  }
  
  // Configuration par défaut (MailHog pour développement local)
  return {
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT || 1025,
    secure: false,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  };
};

const transporter = nodemailer.createTransport(getTransporterConfig());

// Fonction de test de connexion
const testConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error.message);
    return false;
  }
};

module.exports = { transporter, testConnection }; 