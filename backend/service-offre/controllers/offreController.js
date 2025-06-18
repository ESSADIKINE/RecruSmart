const Offre = require('../models/offreModel');
const CandidatOffre = require('../models/candidatOffreModel');
const { publishOffreEvent } = require('../config/rabbitmq');

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
            token: req.headers.authorization,
            offre: offre.toObject(),
            candidats: candidatOffre.candidats
        });

        res.json({ 
            message: "Demande de scoring envoyée avec succès",
            offreId: id
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la demande de scoring:", error);
        res.status(500).json({ 
            message: "Erreur lors de l'envoi de la demande de scoring",
            error: error.message 
        });
    }
};

exports.updateCandidatScore = async (req, res) => {
  try {
    const { offreId, utilisateurId } = req.params;
    const { score } = req.body;

    /* on cible le bon candidat dans le tableau */
    const result = await CandidatOffre.findOneAndUpdate(
      { offreId, 'candidats.utilisateurId': utilisateurId },
      { $set: { 'candidats.$.score': score } },
      { new: true, runValidators: false },   // pas de validation stricte ici
    );

    if (!result)
      return res.status(404).json({ message: 'Candidat non trouvé' });

    /* on retourne juste le candidat mis à jour */
    const candidatMaj = result.candidats.find(
      (c) => c.utilisateurId === utilisateurId,
    );

    res.json(candidatMaj);
  } catch (err) {
    console.error('updateCandidatScore ->', err.message);
    res
      .status(500)
      .json({ message: 'Erreur lors de la mise à jour du score', error: err.message });
  }
};