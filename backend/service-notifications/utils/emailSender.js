const fs = require('fs');
const path = require('path');
const mjml = require('mjml');
const transporter = require('../config/mailer');

async function sendEmail({ to, subject, templateName, variables }) {
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
  return transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@recrusmart.local',
    to,
    subject,
    html
  });
}

module.exports = { sendEmail }; 