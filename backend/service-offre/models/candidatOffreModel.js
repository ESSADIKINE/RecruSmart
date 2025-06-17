const mongoose = require('mongoose');

const CandidatOffreSchema = new mongoose.Schema({
    offreId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Offre', 
        required: true
    },
    utilisateurId: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    cv: { 
        type: String, 
        required: true 
    },
    score: { 
        type: Number,
        default: null
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
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Index composé pour s'assurer qu'un candidat ne peut postuler qu'une seule fois à une offre
CandidatOffreSchema.index({ offreId: 1, utilisateurId: 1 }, { unique: true });

module.exports = mongoose.model('CandidatOffre', CandidatOffreSchema); 