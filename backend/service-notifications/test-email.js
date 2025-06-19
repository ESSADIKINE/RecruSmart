const { sendEmail, testConnection } = require('./utils/emailSender');

// Configuration de test
const testConfigs = {
  // Test avec MailHog (développement local)
  mailhog: {
    SMTP_HOST: 'localhost',
    SMTP_PORT: 1025,
    MAIL_FROM: 'recrusmart.contact@gmail.com'
  },
  
  // Test avec Mailtrap
  mailtrap: {
    USE_MAILTRAP: 'true',
    MAILTRAP_HOST: 'smtp.mailtrap.io',
    MAILTRAP_PORT: 2525,
    MAILTRAP_USER: 'RecruSmart',
    MAILTRAP_PASS: 'RecruSmart1280',
    MAIL_FROM: 'recrusmart.contact@gmail.com'
  },
  
  // Test avec Gmail
  gmail: {
    NODE_ENV: 'production',
    GMAIL_USER: 'anasessadikine@gmail.com',
    GMAIL_APP_PASSWORD: 'RecruSmart1280',
    MAIL_FROM: 'recrusmart.contact@gmail.com'
  }
};

// Tests d'emails
const emailTests = [
  {
    name: 'Test Top Candidates',
    template: 'topCandidates.html',
    variables: {
      prenom: 'Ahmed',
      titreOffre: 'Développeur Full Stack',
      top: 5,
      score: 92,
      position: 1
    }
  },
  {
    name: 'Test Acceptation',
    template: 'acceptation.html',
    variables: {
      prenom: 'Fatima'
    }
  },
  {
    name: 'Test OTP Code',
    template: 'otpCode.html',
    variables: {
      code: '123456',
      prenom: 'Karim'
    }
  }
];

async function testEmailConfiguration(configName, config) {
  console.log(`\n🧪 Test de configuration: ${configName}`);
  console.log('=' .repeat(50));
  
  // Appliquer la configuration
  Object.entries(config).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  try {
    // Test de connexion
    console.log('📡 Test de connexion SMTP...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log(`❌ Configuration ${configName} échouée - Impossible de se connecter`);
      return false;
    }
    
    console.log(`✅ Configuration ${configName} réussie`);
    
    // Test d'envoi d'email
    console.log('📧 Test d\'envoi d\'email...');
    const testEmail = emailTests[0]; // Utiliser le test Top Candidates
    
    await sendEmail({
      to: 'test@example.com',
      subject: `Test ${configName} - ${testEmail.name}`,
      templateName: testEmail.template,
      variables: testEmail.variables
    });
    
    console.log(`✅ Email envoyé avec succès via ${configName}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur avec ${configName}:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests d\'email...\n');
  
  const results = {};
  
  // Test de chaque configuration
  for (const [configName, config] of Object.entries(testConfigs)) {
    results[configName] = await testEmailConfiguration(configName, config);
  }
  
  // Résumé
  console.log('\n📊 Résumé des tests:');
  console.log('=' .repeat(30));
  
  Object.entries(results).forEach(([configName, success]) => {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${configName}: ${success ? 'SUCCÈS' : 'ÉCHEC'}`);
  });
  
  const successfulConfigs = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 ${successfulConfigs}/${Object.keys(results).length} configurations fonctionnelles`);
}

// Test simple d'un email spécifique
async function testSingleEmail() {
  console.log('📧 Test d\'envoi d\'email simple...');
  
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Top Candidates',
      templateName: 'topCandidates.html',
      variables: {
        prenom: 'Ahmed',
        titreOffre: 'Développeur Full Stack',
        top: 5,
        score: 92,
        position: 1
      }
    });
    
    console.log('✅ Email de test envoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
  }
}

// Test spécifique avec Gmail
async function testGmailEmail() {
  console.log('📧 Test d\'envoi d\'email avec Gmail...');
  
  // Appliquer la configuration Gmail
  Object.entries(testConfigs.gmail).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  try {
    await sendEmail({
      to: 'anasessadikine@gmail.com', // Email de test réel
      subject: 'Test RecruSmart - Top Candidates',
      templateName: 'topCandidates.html',
      variables: {
        prenom: 'Anass',
        titreOffre: 'Développeur Full Stack',
        top: 5,
        score: 92,
        position: 1
      }
    });
    
    console.log('✅ Email Gmail envoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi Gmail:', error.message);
  }
}

// Test spécifique avec Mailtrap
async function testMailtrapEmail() {
  console.log('📧 Test d\'envoi d\'email avec Mailtrap...');
  
  // Appliquer la configuration Mailtrap
  Object.entries(testConfigs.mailtrap).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test RecruSmart - Top Candidates (Mailtrap)',
      templateName: 'topCandidates.html',
      variables: {
        prenom: 'Test',
        titreOffre: 'Développeur Full Stack',
        top: 5,
        score: 92,
        position: 1
      }
    });
    
    console.log('✅ Email Mailtrap envoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi Mailtrap:', error.message);
  }
}

// Interface en ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'all':
    runAllTests();
    break;
  case 'single':
    testSingleEmail();
    break;
  case 'gmail':
    testGmailEmail();
    break;
  case 'mailtrap':
    testMailtrapEmail();
    break;
  case 'connection':
    testConnection().then(success => {
      console.log(success ? '✅ Connexion OK' : '❌ Connexion échouée');
      process.exit(success ? 0 : 1);
    });
    break;
  default:
    console.log(`
📧 Test Email Script

Usage:
  node test-email.js all        # Test toutes les configurations
  node test-email.js single     # Test simple d'un email (SMTP local)
  node test-email.js gmail      # Test avec Gmail
  node test-email.js mailtrap   # Test avec Mailtrap
  node test-email.js connection # Test de connexion uniquement

Configuration:
  - MailHog (localhost:1025) pour développement
  - Mailtrap pour tests
  - Gmail pour production

Variables d'environnement:
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  - MAILTRAP_USER, MAILTRAP_PASS
  - GMAIL_USER, GMAIL_APP_PASSWORD
  - MAIL_FROM
    `);
} 