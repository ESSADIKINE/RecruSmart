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
    // Delete all associated candidates
    await CandidatOffre.deleteMany({ offreId: req.params.id });
    res.json({ message: 'Offre supprimée' });
  } catch (err) {
    next(err);
  }
};

// New endpoints for managing candidates
exports.addCandidatToOffre = async (req, res) => {
  try {
    const { offreId } = req.params;
    const { utilisateurId, cv, score } = req.body;

    // Check if offer exists
    const offre = await Offre.findById(offreId);
    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    // Create or update candidate
    const candidat = await CandidatOffre.findOneAndUpdate(
      { offreId, utilisateurId },
      { cv, score, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json(candidat);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du candidat", error });
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

exports.updateCandidatScore = async (req, res) => {
  try {
    const { offreId, utilisateurId } = req.params;
    const { score } = req.body;

    const candidat = await CandidatOffre.findOneAndUpdate(
      { offreId, utilisateurId },
      { score, updatedAt: new Date() },
      { new: true }
    );

    if (!candidat) {
      return res.status(404).json({ message: "Candidat non trouvé" });
    }

    res.json(candidat);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du score", error });
  }
};