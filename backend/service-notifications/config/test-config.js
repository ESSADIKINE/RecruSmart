// Configuration de test pour les emails
const testConfig = {
  // Configuration Gmail pour les tests
  gmail: {
    NODE_ENV: 'production',
    GMAIL_USER: 'recrusmart.contact@gmail.com',
    GMAIL_APP_PASSWORD: 'wspx czzr emjq mnzc',
    MAIL_FROM: 'recrusmart.contact@gmail.com'
  },
  
  // Configuration Mailtrap pour les tests
  mailtrap: {
    NODE_ENV: 'test',
    USE_MAILTRAP: 'true',
    MAILTRAP_HOST: 'smtp.mailtrap.io',
    MAILTRAP_PORT: '2525',
    MAILTRAP_USER: 'RecruSmart',
    MAILTRAP_PASS: 'RecruSmart1280',
    MAIL_FROM: 'recrusmart.contact@gmail.com'
  },
  
  // Configuration SMTP locale (MailHog)
  local: {
    NODE_ENV: 'development',
    SMTP_HOST: 'localhost',
    SMTP_PORT: '1025',
    SMTP_SECURE: 'false',
    MAIL_FROM: 'recrusmart.contact@gmail.com'
  }
};

// Fonction pour appliquer une configuration
function applyConfig(configName) {
  const config = testConfig[configName];
  if (!config) {
    throw new Error(`Configuration ${configName} non trouvée`);
  }
  
  Object.entries(config).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  console.log(`✅ Configuration ${configName} appliquée`);
}

// Fonction pour afficher la configuration actuelle
function showCurrentConfig() {
  console.log('\n📋 Configuration actuelle:');
  console.log('=' .repeat(40));
  
  const relevantVars = [
    'NODE_ENV',
    'SMTP_HOST',
    'SMTP_PORT',
    'GMAIL_USER',
    'MAILTRAP_USER',
    'MAIL_FROM'
  ];
  
  relevantVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Masquer les mots de passe
      const displayValue = varName.includes('PASS') || varName.includes('PASSWORD') 
        ? '*'.repeat(8) 
        : value;
      console.log(`${varName}: ${displayValue}`);
    }
  });
}

module.exports = {
  testConfig,
  applyConfig,
  showCurrentConfig
}; 