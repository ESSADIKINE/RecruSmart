const { applyConfig, showCurrentConfig } = require('./config/test-config');
const args = process.argv.slice(2);
const command = args[0];
const configName = args[1] || 'gmail';
if (command && ['connection','email','full','templates','all'].includes(command)) {
  applyConfig(configName);
}
const { sendEmail, testConnection } = require('./utils/emailSender');

// Tests d'emails avec différents templates
const emailTests = [
  {
    name: 'Top Candidates',
    template: 'topCandidates.html',
    variables: {
      prenom: 'Anass',
      titreOffre: 'Développeur Full Stack',
      top: 5,
      score: 92,
      position: 1
    }
  },
  {
    name: 'Acceptation',
    template: 'acceptation.html',
    variables: {
      prenom: 'Fatima'
    }
  },
  {
    name: 'OTP Code',
    template: 'otpCode.html',
    variables: {
      code: '123456',
      prenom: 'Karim'
    }
  }
];

// Test de connexion avec configuration
async function testConnectionWithConfig(configName) {
  console.log(`\n🔗 Test de connexion avec ${configName}...`);
  console.log('=' .repeat(50));
  
  try {
    showCurrentConfig();
    
    const isConnected = await testConnection();
    if (isConnected) {
      console.log(`✅ Connexion ${configName} réussie`);
      return true;
    } else {
      console.log(`❌ Connexion ${configName} échouée`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${configName}:`, error.message);
    return false;
  }
}

// Test d'envoi d'email avec configuration
async function testEmailWithConfig(configName, emailIndex = 0) {
  console.log(`\n📧 Test d'envoi d'email avec ${configName}...`);
  console.log('=' .repeat(50));
  
  try {
    showCurrentConfig();
    
    const testEmail = emailTests[emailIndex];
    const recipient = configName === 'gmail' ? 'anasessadikine1@gmail.com' : 'test@example.com';
    
    await sendEmail({
      to: recipient,
      subject: `Test RecruSmart - ${testEmail.name} (${configName})`,
      templateName: testEmail.template,
      variables: testEmail.variables
    });
    
    console.log(`✅ Email ${configName} envoyé avec succès à ${recipient}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur avec ${configName}:`, error.message);
    return false;
  }
}

// Test complet d'une configuration
async function testFullConfig(configName) {
  console.log(`\n🧪 Test complet de la configuration ${configName}`);
  console.log('=' .repeat(60));
  
  const connectionOk = await testConnectionWithConfig(configName);
  if (!connectionOk) {
    console.log(`❌ Test ${configName} arrêté - Connexion échouée`);
    return false;
  }
  
  const emailOk = await testEmailWithConfig(configName);
  if (emailOk) {
    console.log(`✅ Configuration ${configName} entièrement fonctionnelle`);
    return true;
  } else {
    console.log(`❌ Configuration ${configName} - Email échoué`);
    return false;
  }
}

// Test de tous les templates avec une configuration
async function testAllTemplates(configName) {
  console.log(`\n📋 Test de tous les templates avec ${configName}`);
  console.log('=' .repeat(60));
  
  showCurrentConfig();
  
  const results = [];
  
  for (let i = 0; i < emailTests.length; i++) {
    const testEmail = emailTests[i];
    console.log(`\n📧 Test template ${i + 1}/${emailTests.length}: ${testEmail.name}`);
    
    try {
      const recipient = configName === 'gmail' ? 'anasessadikine@gmail.com' : 'test@example.com';
      
      await sendEmail({
        to: recipient,
        subject: `Test RecruSmart - ${testEmail.name} (${configName})`,
        templateName: testEmail.template,
        variables: testEmail.variables
      });
      
      console.log(`✅ Template ${testEmail.name} envoyé avec succès`);
      results.push({ template: testEmail.name, success: true });
    } catch (error) {
      console.error(`❌ Template ${testEmail.name} échoué:`, error.message);
      results.push({ template: testEmail.name, success: false, error: error.message });
    }
  }
  
  // Résumé
  console.log('\n📊 Résumé des templates:');
  console.log('=' .repeat(30));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.template}: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}`);
  });
  
  const successfulTemplates = results.filter(r => r.success).length;
  console.log(`\n🎯 ${successfulTemplates}/${results.length} templates fonctionnels`);
  
  return results;
}

switch (command) {
  case 'connection':
    testConnectionWithConfig(configName);
    break;
  case 'email':
    testEmailWithConfig(configName);
    break;
  case 'full':
    testFullConfig(configName);
    break;
  case 'templates':
    testAllTemplates(configName);
    break;
  case 'config':
    showCurrentConfig();
    break;
  case 'all':
    (async () => {
      console.log('🚀 Test de toutes les configurations...\n');
      const configs = ['gmail', 'mailtrap', 'local'];
      const results = {};
      for (const config of configs) {
        results[config] = await testFullConfig(config);
      }
      console.log('\n📊 Résumé final:');
      console.log('=' .repeat(30));
      Object.entries(results).forEach(([config, success]) => {
        const status = success ? '✅' : '❌';
        console.log(`${status} ${config}: ${success ? 'FONCTIONNEL' : 'ÉCHEC'}`);
      });
      const workingConfigs = Object.values(results).filter(Boolean).length;
      console.log(`\n🎯 ${workingConfigs}/${configs.length} configurations fonctionnelles`);
    })();
    break;
  default:
    console.log(`
📧 Test Email Script Amélioré

Usage:
  node test-email-improved.js connection [config]  # Test de connexion
  node test-email-improved.js email [config]       # Test d'envoi d'email
  node test-email-improved.js full [config]        # Test complet (connexion + email)
  node test-email-improved.js templates [config]   # Test de tous les templates
  node test-email-improved.js config               # Afficher la config actuelle
  node test-email-improved.js all                  # Test de toutes les configs

Configurations disponibles:
  - gmail     (Gmail SMTP)
  - mailtrap  (Mailtrap pour tests)
  - local     (MailHog local)

Exemples:
  node test-email-improved.js full gmail
  node test-email-improved.js templates mailtrap
  node test-email-improved.js connection local
    `);
} 