const Entretien = require('../models/entretienModel');
const amqp = require('amqplib');
const { getRabbitChannel } = require('../config/rabbitmq');

// Planifier un entretien
exports.createEntretien = async (req, res) => {
  try {
    const { candidatId, recruteurId, offreId, dateEntretien, lieu, notes } = req.body;
    // Vérification que le recruteur ne planifie que ses propres entretiens
    if (req.user.role !== 'recruteur' || req.user.id !== recruteurId) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    const entretien = await Entretien.create({
      candidatId,
      recruteurId,
      offreId,
      dateEntretien,
      lieu,
      notes
    });
    // Publier l'événement RabbitMQ
    const channel = await getRabbitChannel();
    channel.publish('recrusmart.events', '', Buffer.from(JSON.stringify({
      type: 'Recruitment.Entretien.Planifié',
      data: entretien.toObject()
    })));
    res.status(201).json(entretien);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lister les entretiens (filtrage possible)
exports.getEntretiens = async (req, res) => {
  try {
    const filter = {};
    if (req.query.recruteurId) filter.recruteurId = req.query.recruteurId;
    if (req.query.candidatId) filter.candidatId = req.query.candidatId;
    // Sécurité : un candidat ne voit que ses entretiens
    if (req.user.role === 'candidat') filter.candidatId = req.user.id;
    // Un recruteur ne voit que ses entretiens
    if (req.user.role === 'recruteur') filter.recruteurId = req.user.id;
    const entretiens = await Entretien.find(filter);
    res.json(entretiens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Afficher un entretien spécifique
exports.getEntretienById = async (req, res) => {
  try {
    const entretien = await Entretien.findById(req.params.id);
    if (!entretien) return res.status(404).json({ message: 'Entretien non trouvé' });
    // Sécurité : seuls le candidat ou le recruteur concernés peuvent voir
    if (
      (req.user.role === 'candidat' && entretien.candidatId !== req.user.id) ||
      (req.user.role === 'recruteur' && entretien.recruteurId !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    res.json(entretien);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier un entretien
exports.updateEntretien = async (req, res) => {
  try {
    const entretien = await Entretien.findById(req.params.id);
    if (!entretien) return res.status(404).json({ message: 'Entretien non trouvé' });
    // Seul le recruteur concerné peut modifier
    if (req.user.role !== 'recruteur' || entretien.recruteurId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    Object.assign(entretien, req.body);
    await entretien.save();
    res.json(entretien);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un entretien
exports.deleteEntretien = async (req, res) => {
  try {
    const entretien = await Entretien.findById(req.params.id);
    if (!entretien) return res.status(404).json({ message: 'Entretien non trouvé' });
    // Seul le recruteur concerné peut supprimer
    if (req.user.role !== 'recruteur' || entretien.recruteurId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    await entretien.deleteOne();
    res.json({ message: 'Entretien supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 