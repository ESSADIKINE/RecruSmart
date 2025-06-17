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
  console.log("=== DÉBUT DE LA REQUÊTE addCandidatToOffre ===");
  console.log("Méthode:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Params:", JSON.stringify(req.params, null, 2));

  try {
    const { offreId } = req.params;
    console.log("OffreId reçu:", offreId);
    
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
      console.log("ID utilisateur manquant dans le body");
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    console.log("Données reçues:", req.body);

    // Check if offer exists
    const offre = await Offre.findById(offreId);
    if (!offre) {
      console.log("Offre non trouvée:", offreId);
      return res.status(404).json({ message: "Offre non trouvée" });
    }

    console.log("Tentative de création/mise à jour du candidat avec:", {
      offreId,
      utilisateurId,
      email,
      cv
    });

    // Create or update candidate with all fields
    const candidat = await CandidatOffre.findOneAndUpdate(
      { 
        offreId: offreId,
        utilisateurId: utilisateurId 
      },
      { 
        $set: {
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
          updatedAt: new Date() 
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log("Candidat créé/mis à jour avec succès:", candidat);
    res.status(201).json(candidat);
  } catch (error) {
    console.error("Erreur détaillée lors de l'ajout du candidat:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: "Erreur lors de l'ajout du candidat", error: error.message });
  } finally {
    console.log("=== FIN DE LA REQUÊTE addCandidatToOffre ===");
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