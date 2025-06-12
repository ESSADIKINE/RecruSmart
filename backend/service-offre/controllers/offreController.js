const Offre = require('../models/offreModel');
const { publishOffreEvent } = require('../config/rabbitmq');

exports.createOffre = async (req, res, next) => {
  try {
    const offre = await Offre.create(req.body);
    // Publier l'événement RabbitMQ complet
    await publishOffreEvent('Recruitment.Offre.Publiée', {
      offreId: offre._id,
      titre: offre.titre,
      description: offre.description,
      domaine: offre.domaine,
      langue: offre.langue,
      competences: offre.competences,
      experienceMin: offre.experienceMin,
      niveauEtude: offre.niveauEtude,
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
    const offre = await Offre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
    if (req.body.candidats) {
      console.log('Candidats mis à jour pour l\'offre', req.params.id, req.body.candidats);
    }
    res.json(offre);
  } catch (err) {
    next(err);
  }
};

exports.deleteOffre = async (req, res, next) => {
  try {
    const offre = await Offre.findByIdAndDelete(req.params.id);
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
    res.json({ message: 'Offre supprimée' });
  } catch (err) {
    next(err);
  }
}; 

exports.updateOffrePartiel = async (req, res) => {
  try {
    const offreId = req.params.id;
    const updateData = req.body;
    const offre = await Offre.findByIdAndUpdate(offreId, updateData, { new: true });
    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée" });
    }
    res.json(offre);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour partielle de l'offre", error });
  }
};