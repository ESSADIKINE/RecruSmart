const Offre = require('../models/offreModel');
const CandidatOffre = require('../models/candidatOffreModel');
const { publishOffreEvent } = require('../config/rabbitmq');
const amqp = require('amqplib');
const cron = require('node-cron');

exports.createOffre = async (req, res, next) => {
  try {
    const offreData = { ...req.body, recruteurId: req.user.id };
    const offre = await Offre.create(offreData);
    await publishOffreEvent('Recruitment.Offre.Publiée', {
      offreId: offre._id,
      titre: offre.titre,
      description: offre.description,
      domaine: offre.domaine,
      langue: offre.langue,
      competences: offre.competences,
      experienceMin: offre.experienceMin,
      niveauEtude: offre.niveauEtude,
      recruteurId: offre.recruteurId,
      date: new Date()
    });
    res.status(201).json(offre);
  } catch (err) {
    next(err);
  }
};

exports.getAllOffres = async (req, res, next) => {
  try {
    const offres = await Offre.find();
    res.json(offres);
  } catch (err) {
    next(err);
  }
};

// ADMIN: récupérer toutes les offres
exports.getAllOffresAdmin = async (req, res, next) => {
  try {
    const offres = await Offre.find();
    res.json(offres);
  } catch (err) {
    next(err);
  }
};

// RECRUTEUR: récupérer ses propres offres
exports.getMesOffres = async (req, res, next) => {
  try {
    const offres = await Offre.find({ recruteurId: req.user.id });
    res.json(offres);
  } catch (err) {
    next(err);
  }
};

// Recherche avancée d'offres
exports.searchOffres = async (req, res, next) => {
  try {
    const { type, q, duree } = req.query;
    const filter = { statut: 'OPEN' };
    if (type) {
      filter.type = type;
    }
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { titre: regex },
        { description: regex },
        { domaine: regex },
      ];
    }
    if (duree) {
      const now = new Date();
      let pastDate;
      switch (duree) {
        case '-24h':
          pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          pastDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
          break;
        case 'last3days':
          pastDate = new Date(now.getTime() - 72 * 60 * 60 * 1000);
          break;
        case 'last7days':
          pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'months':
          pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      if (pastDate) {
        filter.updatedAt = { $gte: pastDate };
      }
    }
    const offres = await Offre.find(filter).sort({ updatedAt: -1 });
    res.json(offres);
  } catch (err) {
    next(err);
  }
};

exports.getOffreById = async (req, res, next) => {
  try {
    const offre = await Offre.findById(req.params.id);
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
    res.json(offre);
  } catch (err) {
    next(err);
  }
};

exports.updateOffre = async (req, res, next) => {
  try {
    if (req.body.recruteurId) delete req.body.recruteurId;
    const offre = await Offre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
    res.json(offre);
  } catch (err) {
    next(err);
  }
};

exports.deleteOffre = async (req, res, next) => {
  try {
    const offre = await Offre.findByIdAndDelete(req.params.id);
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
    await CandidatOffre.deleteMany({ offreId: req.params.id });
    res.json({ message: 'Offre supprimée' });
  } catch (err) {
    next(err);
  }
};

// RECRUTEUR : récupérer les candidats pour l'une de ses offres
exports.getCandidatsRecruteur = async (req, res, next) => {
  try {
    const { offreId } = req.params;
    const offre = await Offre.findById(offreId);
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
    if (offre.recruteurId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const candidats = await CandidatOffre.findOne({ offreId }).sort({ score: -1 });
    res.json(candidats);
  } catch (err) {
    next(err);
  }
};

exports.addCandidatToOffre = async (req, res) => {
  try {
    const { offreId } = req.params;
    const { 
      utilisateurId,
      cv, 
      email,
      competences,
      experiences,
      niveauEtude,
      anneesExperience,
      langues,
      educations,
      domaines,
      score 
    } = req.body;

    if (!utilisateurId) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    const offre = await Offre.findById(offreId);
    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    // Vérifier si le candidat a déjà postulé
    const candidatOffre = await CandidatOffre.findOne({ 
      offreId,
      'candidats.utilisateurId': utilisateurId 
    });

    if (candidatOffre) {
      return res.status(400).json({ 
        message: "Vous avez déjà postulé à cette offre" 
      });
    }

    // Créer ou mettre à jour le document CandidatOffre
    const result = await CandidatOffre.findOneAndUpdate(
      { offreId },
      { 
        $push: { 
          candidats: {
            utilisateurId,
            cv,
            email,
            competences,
            experiences,
            niveauEtude,
            anneesExperience,
            langues,
            educations,
            domaines,
            score,
            dateCandidature: new Date()
          }
        }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Erreur lors de l'ajout du candidat:", error);
    res.status(500).json({ 
      message: "Erreur lors de l'ajout du candidat", 
      error: error.message 
    });
  }
};

exports.getCandidatsForOffre = async (req, res) => {
  try {
    const { offreId } = req.params;
    const candidats = await CandidatOffre.find({ offreId })
      .sort({ score: -1 });
    res.json(candidats);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des candidats", error });
  }
};

exports.triggerScoring = async (req, res) => {
    try {
        const { id } = req.params;
        const top = parseInt(req.query.top) || 5; // Par défaut top 5 si non spécifié
        
        // Vérifier si l'offre existe
        const offre = await Offre.findById(id);
        if (!offre) {
            return res.status(404).json({ message: "Offre non trouvée" });
        }

        // Récupérer les candidats
        const candidatOffre = await CandidatOffre.findOne({ offreId: id });
        if (!candidatOffre) {
            return res.status(404).json({ message: "Aucun candidat trouvé pour cette offre" });
        }

        // Publier l'événement de scoring avec toutes les données
        await publishOffreEvent('Recruitment.Scoring.Demande', {
            offreId: id,
            top: top,
            token: req.headers.authorization,
            offre: offre.toObject(),
            candidats: candidatOffre.candidats
        });

        res.json({ 
            message: "Demande de scoring envoyée avec succès",
            offreId: id,
            top: top
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la demande de scoring:", error);
        res.status(500).json({ 
            message: "Erreur lors de l'envoi de la demande de scoring",
            error: error.message 
        });
    }
};

// Mettre à jour le score d'un candidat (refactor depuis la route)
exports.updateCandidatScore = async (req, res, next) => {
  try {
    const { offreId, candidatId } = req.params;
    const { score } = req.body;
    const result = await CandidatOffre.findOneAndUpdate(
      {
        offreId,
        'candidats.utilisateurId': candidatId,
      },
      {
        $set: {
          'candidats.$.score': score,
        },
      },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }
    res.json({ message: 'Score mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du score',
      error: error.message,
    });
  }
};

// Récupérer les candidatures d'un utilisateur (refactor depuis la route)
exports.getCandidaturesUtilisateur = async (req, res, next) => {
  try {
    const offresCandidats = await CandidatOffre.find({
      'candidats.utilisateurId': req.params.utilisateurId,
    });
    const candidatures = offresCandidats
      .filter((offre) => offre.candidats && Array.isArray(offre.candidats))
      .map((offre) => ({
        offreId: offre.offreId,
        candidature: offre.candidats.find(
          (c) => c.utilisateurId === req.params.utilisateurId
        ),
      }))
      .filter((item) => item.candidature != null);
    res.json(candidatures);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message,
    });
  }
};

// Endpoint 1 : Envoyer les offres du jour à tous les candidats
exports.envoyerOffresJour = async (req, res) => {
    try {
        const offres = await Offre.find({});
        const candidats = await CandidatOffre.find({});
        for (const candidat of candidats) {
            await publishOffreEvent('Recruitment.Offre.Publiée', {
                utilisateurId: candidat.utilisateurId,
                offres: offres.map(o => ({ titre: o.titre, description: o.description, id: o._id }))
            });
        }
        res.json({ success: true, message: 'Offres du jour envoyées à tous les candidats.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Endpoint 2 : Sélectionner un candidat et envoyer un email
exports.selectionnerCandidat = async (req, res) => {
    try {
        const { candidatOffreId, messageRecruteur } = req.body;
        const candidatOffre = await CandidatOffre.findById(candidatOffreId);
        if (!candidatOffre) return res.status(404).json({ success: false, message: 'Candidat non trouvé.' });
        candidatOffre.selectionne = true;
        await candidatOffre.save();
        const candidat = candidatOffre.candidats[0];
        await publishOffreEvent('Recruitment.Candidat.Selectionne', {
            type: 'Recruitment.Candidat.Selectionne',
            data: {
                utilisateurId: candidat.utilisateurId,
                offreId: candidatOffre.offreId,
                email: candidat.email,
                message: messageRecruteur || ''
            }
        });
        res.json({ success: true, message: 'Candidat sélectionné et notification envoyée.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Fonction pour envoyer les offres du jour à tous les candidats (utilisée par le cron)
async function envoyerOffresJourAutomatique() {
    try {
        const offres = await Offre.find({});
        const candidats = await CandidatOffre.find({});
        for (const candidat of candidats) {
            await publishOffreEvent('Recruitment.Offre.Publiée', {
                type: 'Recruitment.Offre.Publiée',
                data: {
                    utilisateurId: candidat.utilisateurId,
                    offres: offres.map(o => ({ titre: o.titre, description: o.description, id: o._id }))
                }
            });
        }
        console.log('Offres du jour envoyées automatiquement à tous les candidats.');
    } catch (err) {
        console.error('Erreur lors de l\'envoi automatique des offres du jour :', err);
    }
}

// Planification automatique chaque jour à 12:10
cron.schedule('10 12 * * *', envoyerOffresJourAutomatique);