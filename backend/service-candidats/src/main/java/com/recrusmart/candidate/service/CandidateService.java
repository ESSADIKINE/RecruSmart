package com.recrusmart.candidate.service;

import com.recrusmart.candidate.dto.ProfileDTO;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.repository.ProfileRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;

@Service
public class CandidateService {
    private static final Logger logger = LoggerFactory.getLogger(CandidateService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ProfileRepository profilRepository;

    @Autowired
    private StorageService serviceStockage;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private String generateServiceToken() {
        return Jwts.builder()
            .setSubject("service-candidats")
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 heure
            .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
            .compact();
    }

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
    public void soumettreCandidature(String profilId, String offreId) {
        try {
            logger.info("[CANDIDATURE] Début synchro service-offre");
            Profile profil = profilRepository.findByUtilisateurId(profilId);
            if (profil == null) {
                throw new RuntimeException("Profil introuvable pour l'utilisateur : " + profilId);
            }

            // Créer le candidat à ajouter
            Map<String, Object> newCandidat = new HashMap<>();
            newCandidat.put("utilisateurId", profilId);
            newCandidat.put("cv", profil.getUrlCv());
            newCandidat.put("score", null); // Optionnel, sera calculé plus tard

            // Utiliser WebClient pour ajouter le candidat avec authentification
            WebClient webClient = WebClient.builder()
                .baseUrl("http://localhost:5001")
                .defaultHeader("Authorization", "Bearer " + generateServiceToken())
                .build();

            String response = webClient.post()
                .uri("/offres/" + offreId + "/candidats")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(newCandidat)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            logger.info("[CANDIDATURE] Réponse POST service-offre: " + response);

            // Publier l'événement Candidature soumise
            Map<String, Object> evenement = new HashMap<>();
            evenement.put("profilId", profilId);
            evenement.put("offreId", offreId);
            evenement.put("timestamp", java.time.Instant.now().toString());
            try {
                String message = objectMapper.writeValueAsString(evenement);
                rabbitTemplate.convertAndSend("recrusmart.events", "Candidat.Candidature.Soumise", message);
                logger.info("[CANDIDATURE] Événement RabbitMQ publié: {}", message);
            } catch (Exception e) {
                logger.error("[CANDIDATURE] Erreur de sérialisation JSON pour RabbitMQ", e);
            }
        } catch (Exception e) {
            logger.error("[CANDIDATURE] Erreur lors de la synchro avec service-offre: " + e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la soumission de la candidature: " + e.getMessage());
        }
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

    public Profile getProfilByUtilisateurId(String utilisateurId) {
        return profilRepository.findByUtilisateurId(utilisateurId);
    }
}
