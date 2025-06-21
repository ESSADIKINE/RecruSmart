const mongoose = require('mongoose');

const candidatSchema = new mongoose.Schema({
    utilisateurId: {
        type: String,
        required: true
    },
    cv: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    competences: {
        type: String
    },
    experiences: {
        type: String
    },
    niveauEtude: {
        type: String
    },
    anneesExperience: {
        type: Number
    },
    langues: {
        type: String
    },
    educations: {
        type: String
    },
    domaines: {
        type: String
    },
    score: {
        type: Number,
        default: null
    },
    dateCandidature: {
        type: Date,
        default: Date.now
    }
});

const candidatOffreSchema = new mongoose.Schema(
    {
      offreId: { type: String, unique: true, required: true },
      candidats: [candidatSchema],
      selectionne: { type: Boolean, default: false }
    },
    { timestamps: true },
  );

  candidatOffreSchema.index(
    { offreId: 1, 'candidats.utilisateurId': 1 },
    { unique: true },
  );
  
  module.exports =
    mongoose.models.CandidatOffre ||
    mongoose.model('CandidatOffre', candidatOffreSchema);