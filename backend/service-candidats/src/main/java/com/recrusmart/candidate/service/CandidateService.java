package com.recrusmart.candidate.service;

import com.recrusmart.candidate.dto.CandidatureDTO;
import com.recrusmart.candidate.dto.ProfileDTO;
import com.recrusmart.candidate.entity.Candidature;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.repository.CandidatureRepository;
import com.recrusmart.candidate.repository.ProfileRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CandidateService {
    private static final Logger logger = LoggerFactory.getLogger(CandidateService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ProfileRepository profilRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private StorageService serviceStockage;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * Crée un nouveau profil candidat à partir d'un DTO.
     */
    public Profile creerProfil(ProfileDTO profilDTO) {
        Profile profil = new Profile();
        profil.setUtilisateurId(profilDTO.getUtilisateurId());
        try {
            profil.setCompetences(objectMapper.writeValueAsString(profilDTO.getCompetences()));
            profil.setLangues(objectMapper.writeValueAsString(profilDTO.getLangues()));
            profil.setExperiences(objectMapper.writeValueAsString(profilDTO.getExperiences()));
            profil.setEducations(objectMapper.writeValueAsString(profilDTO.getEducations()));
            profil.setAnneesExperience(profilDTO.getAnneesExperience());
            if (profilDTO.getDomaines() != null)
                profil.setDomaines(objectMapper.writeValueAsString(profilDTO.getDomaines()));
            if (profilDTO.getNiveauEtude() != null)
                profil.setNiveauEtude(profilDTO.getNiveauEtude());
        } catch (Exception e) {
            throw new RuntimeException("Erreur de sérialisation JSON : " + e.getMessage(), e);
        }
        return profilRepository.save(profil);
    }

    /**
     * Téléverse le CV du candidat, le stocke dans Cloudflare R2 et envoie un message RabbitMQ à l'IA.
     */
    public String televerserCv(String idUtilisateur, MultipartFile fichier) {
        logger.info("[UPLOAD-CV] Reçu pour utilisateurId={}", idUtilisateur);
        Profile profil = profilRepository.findByUtilisateurId(idUtilisateur);
        if (profil == null) {
            logger.error("[UPLOAD-CV] Profil introuvable pour utilisateurId={}", idUtilisateur);
            throw new RuntimeException("Profil introuvable pour l'utilisateur : " + idUtilisateur);
        }
        logger.info("[UPLOAD-CV] Profil trouvé: {}", profil);
        String cheminCv = "cvs/" + idUtilisateur + "/" + UUID.randomUUID() + ".pdf";
        String urlCv = null;
        try {
            urlCv = serviceStockage.uploadCvFile(cheminCv, fichier);
            logger.info("[UPLOAD-CV] Fichier uploadé sur Cloudflare R2: {}", urlCv);
        } catch (Exception e) {
            logger.error("[UPLOAD-CV] Erreur lors de l'upload sur Cloudflare R2: {}", e.getMessage(), e);
            throw e;
        }
        profil.setUrlCv(urlCv);
        profilRepository.save(profil);
        logger.info("[UPLOAD-CV] Profil mis à jour avec urlCv");

        // Publier l'événement CV reçu
        Map<String, Object> evenement = new HashMap<>();
        evenement.put("candidatId", idUtilisateur);
        evenement.put("cvUrl", urlCv);
        try {
            String message = objectMapper.writeValueAsString(evenement);
            rabbitTemplate.convertAndSend("recrusmart.events", "Candidat.CV.Recu", message);
            logger.info("[UPLOAD-CV] Message RabbitMQ envoyé: {}", message);
        } catch (Exception e) {
            logger.error("[UPLOAD-CV] Erreur de sérialisation JSON pour RabbitMQ", e);
        }

        return urlCv;
    }

    /**
     * Soumet une candidature pour un profil donné.
     */
    public Candidature soumettreCandidature(CandidatureDTO candidatureDTO) {
        Candidature candidature = new Candidature();
        candidature.setProfilId(candidatureDTO.getProfilId());
        candidature.setOffreId(candidatureDTO.getOffreId());
        candidature.setStatut("EN_ATTENTE");
        if (candidatureDTO.getScore() != null) {
            candidature.setScore(candidatureDTO.getScore());
        }
        Candidature candidatureEnregistree = candidatureRepository.save(candidature);

        // Publier l'événement Candidature soumise
        Map<String, Object> evenement = new HashMap<>();
        evenement.put("candidatureId", candidatureEnregistree.getId());
        evenement.put("profilId", candidatureDTO.getProfilId());
        evenement.put("offreId", candidatureDTO.getOffreId());
        evenement.put("timestamp", java.time.Instant.now().toString());
        try {
            String message = objectMapper.writeValueAsString(evenement);
            rabbitTemplate.convertAndSend("recrusmart.events", "Candidat.Candidature.Soumise", message);
            logger.info("[CANDIDATURE] Événement RabbitMQ publié: {}", message);
        } catch (Exception e) {
            logger.error("[CANDIDATURE] Erreur de sérialisation JSON pour RabbitMQ", e);
        }

        return candidatureEnregistree;
    }

    /**
     * Récupère la liste des candidatures pour un profil donné.
     */
    public List<Candidature> recupererCandidaturesParProfil(String idProfil) {
        return candidatureRepository.findByProfilId(idProfil);
    }

    /**
     * Met à jour le profil du candidat avec les données extraites du CV par l'IA.
     */
    public void remplirCv(PopulateCvDTO populateCvDTO) {
        logger.info("[REMPLIR-CV] Payload reçu: {}", populateCvDTO);
        Profile profil = profilRepository.findByUtilisateurId(populateCvDTO.getId());
        if (profil == null) {
            throw new RuntimeException("Profil introuvable pour l'utilisateur : " + populateCvDTO.getId());
        }
        try {
            profil.setExperiences(objectMapper.writeValueAsString(populateCvDTO.getExperiences()));
            profil.setCompetences(objectMapper.writeValueAsString(populateCvDTO.getCompetences()));
            profil.setLangues(objectMapper.writeValueAsString(populateCvDTO.getLangues()));
            profil.setEducations(objectMapper.writeValueAsString(populateCvDTO.getEducations()));
        } catch (Exception e) {
            throw new RuntimeException("Erreur de sérialisation JSON : " + e.getMessage(), e);
        }
        profilRepository.save(profil);
    }

    /**
     * Met à jour tous les champs du profil du candidat (sauf utilisateurId et urlCv).
     */
    public void mettreAJourProfil(String id, UpdateProfileDTO updateProfileDTO) {
        Profile profil = profilRepository.findByUtilisateurId(id);
        if (profil == null) {
            throw new RuntimeException("Profil introuvable pour l'utilisateur : " + id);
        }
        try {
            if (updateProfileDTO.getCompetences() != null)
                profil.setCompetences(objectMapper.writeValueAsString(updateProfileDTO.getCompetences()));
            if (updateProfileDTO.getLangues() != null)
                profil.setLangues(objectMapper.writeValueAsString(updateProfileDTO.getLangues()));
            if (updateProfileDTO.getAnneesExperience() != null)
                profil.setAnneesExperience(updateProfileDTO.getAnneesExperience());
            if (updateProfileDTO.getExperiences() != null)
                profil.setExperiences(objectMapper.writeValueAsString(updateProfileDTO.getExperiences()));
            if (updateProfileDTO.getEducations() != null)
                profil.setEducations(objectMapper.writeValueAsString(updateProfileDTO.getEducations()));
            if (updateProfileDTO.getDomaines() != null)
                profil.setDomaines(objectMapper.writeValueAsString(updateProfileDTO.getDomaines()));
            if (updateProfileDTO.getNiveauEtude() != null)
                profil.setNiveauEtude(updateProfileDTO.getNiveauEtude());
        } catch (Exception e) {
            throw new RuntimeException("Erreur de sérialisation JSON : " + e.getMessage(), e);
        }
        profilRepository.save(profil);
    }

    public List<Profile> getAllProfils() {
        return profilRepository.findAll();
    }
}
