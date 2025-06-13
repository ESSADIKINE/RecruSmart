const mongoose = require('mongoose');

const CandidatSchema = new mongoose.Schema({
    utilisateurId: { type: String, required: true },
    cv: { type: String },
    score: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const CandidatOffreSchema = new mongoose.Schema({
    offreId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Offre', 
        required: true,
        unique: true // Pour s'assurer qu'il n'y a qu'un seul document par offre
    },
    candidats: [CandidatSchema] // Tableau de candidats pour cette offre
});

// Index pour les recherches rapides
CandidatOffreSchema.index({ offreId: 1 });
CandidatOffreSchema.index({ 'candidats.utilisateurId': 1 });

module.exports = mongoose.model('CandidatOffre', CandidatOffreSchema); 