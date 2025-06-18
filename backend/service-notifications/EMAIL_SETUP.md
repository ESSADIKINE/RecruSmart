# Configuration Email - Service Notifications

## 🚀 Installation et Configuration

### 1. Variables d'Environnement

Créez un fichier `.env` dans le dossier `service-notifications` avec les variables suivantes :

```bash
# Environnement
NODE_ENV=development

# Configuration SMTP Générale
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=no-reply@recrusmart.local

# Configuration Mailtrap (pour tests)
USE_MAILTRAP=false
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass

# Configuration Gmail (pour production)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Configuration RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

## 📧 Options de Configuration

### Option 1: MailHog (Développement Local) - RECOMMANDÉ

**Installation:**
```bash
# Windows (avec Chocolatey)
choco install mailhog

# macOS (avec Homebrew)
brew install mailhog

# Linux
wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64
chmod +x MailHog_linux_amd64
sudo mv MailHog_linux_amd64 /usr/local/bin/mailhog
```

**Lancement:**
```bash
mailhog
```

**Interface Web:** http://localhost:8025

**Configuration:**
```bash
SMTP_HOST=localhost
SMTP_PORT=1025
MAIL_FROM=test@recrusmart.local
```

### Option 2: Mailtrap (Tests)

1. Créer un compte sur [Mailtrap.io](https://mailtrap.io)
2. Créer une inbox
3. Récupérer les credentials SMTP
4. Configuration:

```bash
USE_MAILTRAP=true
MAILTRAP_USER=your_user
MAILTRAP_PASS=your_pass
MAIL_FROM=test@recrusmart.local
```

### Option 3: Gmail (Production)

1. Activer l'authentification à 2 facteurs sur votre compte Gmail
2. Générer un mot de passe d'application:
   - Aller dans Paramètres Google > Sécurité
   - "Mots de passe d'application"
   - Sélectionner "Mail" et votre appareil
3. Configuration:

```bash
NODE_ENV=production
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
```

## 🧪 Tests

### Test de Connexion
```bash
cd backend/service-notifications
node test-email.js connection
```

### Test d'Envoi Simple
```bash
node test-email.js single
```

### Test de Toutes les Configurations
```bash
node test-email.js all
```

### Test de l'Événement Top Candidates
```bash
node test-top-candidates.js
```

## 📋 Templates Disponibles

- `topCandidates.html` - Notification des candidats sélectionnés
- `acceptation.html` - Acceptation de candidature
- `otpCode.html` - Code de vérification
- `resetPassword.html` - Réinitialisation de mot de passe
- `recruteurMessage.html` - Message du recruteur
- `entretien.html` - Planification d'entretien
- `offresDuJour.html` - Offres du jour

## 🔧 Dépannage

### Erreur de Connexion SMTP
```bash
# Vérifier que MailHog est lancé
mailhog

# Vérifier le port
netstat -an | grep 1025
```

### Erreur d'Authentification Gmail
- Vérifier que l'authentification à 2 facteurs est activée
- Vérifier que le mot de passe d'application est correct
- Vérifier que "Accès moins sécurisé" n'est pas activé

### Erreur de Template
- Vérifier que le fichier template existe dans `templates/`
- Vérifier la syntaxe des variables `{{variable}}`

## 📊 Monitoring

Les logs d'envoi d'email sont disponibles dans la console:
- ✅ Email envoyé avec succès
- ❌ Erreur lors de l'envoi d'email

## 🔄 Intégration avec RabbitMQ

Le service consomme les événements suivants:
- `Recruitment.Notification.TopCandidates` - Nouveau!
- `Auth.PasswordReset.Requested`
- `Auth.OTP.Sent`
- `Recruitment.Offre.Publiée`
- `Recruitment.Message.Recruteur`
- `Recruitment.Entretien.Planifié`
- `Recruitment.Candidat.Accepté` 