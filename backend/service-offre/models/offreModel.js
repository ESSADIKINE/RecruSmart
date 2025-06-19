const mongoose = require('mongoose');

const OffreSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: { type: String, required: true },
    competences: [{ type: String }],
    statut: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    type: { type: String },
    lieu: { type: String },
    dateExpiration: { type: Date },
    domaine: { type: String },
    langue: { type: String },
    niveauEtude: { type: String },
    anneesExperience: { type: Number, default: 0 },
    recruteurId: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

module.exports = mongoose.model('Offre', OffreSchema); 