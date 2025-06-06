const mongoose = require('mongoose');

const entretienSchema = new mongoose.Schema({
  candidatId: { type: String, required: true },
  recruteurId: { type: String, required: true },
  offreId: { type: String, required: true },
  dateEntretien: { type: Date, required: true },
  lieu: { type: String, default: 'en ligne' },
  statut: { type: String, enum: ['PLANIFIE', 'REALISE', 'ANNULE'], default: 'PLANIFIE' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Entretien', entretienSchema); 