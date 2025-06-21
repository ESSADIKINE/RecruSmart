const fs = require('fs');
const path = require('path');
const mjml = require('mjml');
const { transporter, testConnection } = require('../config/mailer');

async function sendEmail({ to, subject, templateName, variables }) {
  try {
    // Test de connexion avant envoi
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Impossible de se connecter au serveur SMTP');
    }

    // Lecture du template
    const templatePath = path.join(__dirname, '../templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // Remplacement des variables {{var}}
    for (const [key, value] of Object.entries(variables || {})) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    // Si MJML, compile en HTML
    if (templateName.endsWith('.mjml')) {
      html = mjml(html).html;
    }
    
    // Envoi
    const result = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@recrusmart.local',
      to,
      subject,
      html
    });
    
    console.log(`✅ Email envoyé avec succès à ${to}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi d'email à ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendEmail, testConnection }; 