package com.recrusmart.candidate.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recrusmart.candidate.dto.ProfileDTO;
import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.repository.ProfileRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;

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
        // Vérifier si un profil existe déjà pour cet utilisateur
        Profile existingProfile = profilRepository.findByUtilisateurId(profilDTO.getUtilisateurId());
        if (existingProfile != null) {
            logger.warn("[CREATE-PROFILE] Profil déjà existant pour utilisateurId={}", profilDTO.getUtilisateurId());
            throw new RuntimeException("Un profil existe déjà pour cet utilisateur");
        }

        try {
            Profile profil = new Profile();
            profil.setUtilisateurId(profilDTO.getUtilisateurId());
            profil.setEmail(profilDTO.getEmail());

            // Initialiser les champs JSON avec des objets vides si null
            if (profilDTO.getCompetences() == null) {
                profil.setCompetences("{}");
            } else {
                profil.setCompetences(objectMapper.writeValueAsString(profilDTO.getCompetences()));
            }

            if (profilDTO.getLangues() == null) {
                profil.setLangues("{}");
            } else {
                profil.setLangues(objectMapper.writeValueAsString(profilDTO.getLangues()));
            }

            if (profilDTO.getExperiences() == null) {
                profil.setExperiences("{}");
            } else {
                profil.setExperiences(objectMapper.writeValueAsString(profilDTO.getExperiences()));
            }

            if (profilDTO.getEducations() == null) {
                profil.setEducations("{}");
            } else {
                profil.setEducations(objectMapper.writeValueAsString(profilDTO.getEducations()));
            }

            profil.setAnneesExperience(profilDTO.getAnneesExperience() != null ? profilDTO.getAnneesExperience() : 0);

            if (profilDTO.getDomaines() != null) {
                profil.setDomaines(objectMapper.writeValueAsString(profilDTO.getDomaines()));
            } else {
                profil.setDomaines("[]");
            }

            if (profilDTO.getNiveauEtude() != null) {
                profil.setNiveauEtude(profilDTO.getNiveauEtude());
            }

            logger.info("[CREATE-PROFILE] Création du profil pour utilisateurId={}", profilDTO.getUtilisateurId());
            return profilRepository.save(profil);
        } catch (Exception e) {
            logger.error("[CREATE-PROFILE] Erreur lors de la création du profil: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la création du profil: " + e.getMessage());
        }
    }

    /**
     * Téléverse le CV du candidat, crée le profil si nécessaire, et envoie un message RabbitMQ à l'IA.
     */
    public String televerserCv(String idUtilisateur, MultipartFile fichier, String token) {
        logger.info("[UPLOAD-CV] Reçu pour utilisateurId={}", idUtilisateur);
        
        // Extraire l'email du token
        String email = null;
        try {
            DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));
            email = jwt.getClaim("email").asString();
            if (email == null) {
                logger.error("[UPLOAD-CV] Email manquant dans le token");
                throw new RuntimeException("Email manquant dans le token");
            }
        } catch (Exception e) {
            logger.error("[UPLOAD-CV] Erreur lors de l'extraction de l'email du token: {}", e.getMessage());
            throw new RuntimeException("Erreur lors de l'extraction de l'email du token: " + e.getMessage());
        }
        
        // Vérifier si le profil existe, sinon le créer
        Profile profil = profilRepository.findByUtilisateurId(idUtilisateur);
        if (profil == null) {
            logger.info("[UPLOAD-CV] Création automatique du profil pour utilisateurId={}, email={}", idUtilisateur, email);
            profil = new Profile();
            profil.setUtilisateurId(idUtilisateur);
            profil.setEmail(email);
            profil.setCompetences("{}");
            profil.setLangues("{}");
            profil.setExperiences("{}");
            profil.setEducations("{}");
            profil.setDomaines("[]");
            profil.setAnneesExperience(0);
            profil.setNiveauEtude("");
            profil.setLinkedinUrl("");
            profil.setGithubUrl("");
            profil.setPortfolioUrl("");
            profil = profilRepository.save(profil);
            logger.info("[UPLOAD-CV] Profil créé avec succès pour utilisateurId={}", idUtilisateur);
        }

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

        // Publier l'événement CV reçu avec le token
        Map<String, Object> evenement = new HashMap<>();
        evenement.put("candidatId", idUtilisateur);
        evenement.put("cvUrl", urlCv);
        evenement.put("token", token);
        evenement.put("email", email);
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
            logger.info("[CANDIDATURE] Début soumission candidature pour profilId={}, offreId={}", profilId, offreId);
            Profile profil = profilRepository.findByUtilisateurId(profilId);
            if (profil == null) {
                logger.error("[CANDIDATURE] Profil introuvable pour utilisateurId={}", profilId);
                throw new RuntimeException("Profil introuvable pour l'utilisateur : " + profilId);
            }

            // Créer le candidat à ajouter
            Map<String, Object> newCandidat = new HashMap<>();
            newCandidat.put("utilisateurId", profilId);
            newCandidat.put("cv", profil.getUrlCv());
            newCandidat.put("email", profil.getEmail());
            newCandidat.put("competences", profil.getCompetences());
            newCandidat.put("experiences", profil.getExperiences());
            newCandidat.put("niveauEtude", profil.getNiveauEtude());
            newCandidat.put("anneesExperience", profil.getAnneesExperience());
            newCandidat.put("score", null); // Optionnel, sera calculé plus tard

            // Utiliser WebClient pour ajouter le candidat avec authentification via API Gateway
            WebClient webClient = WebClient.builder()
                .baseUrl("http://api-gateway")  // Utiliser l'API Gateway
                .defaultHeader("Authorization", "Bearer " + generateServiceToken())
                .build();

            logger.info("[CANDIDATURE] Envoi de la requête au service offre via API Gateway");
            String response = webClient.post()
                    .uri("/api/offres/{id}/candidats/", offreId)   // <-- slash final conservé
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(newCandidat)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            logger.info("[CANDIDATURE] Réponse du service offre: {}", response);

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
            logger.error("[CANDIDATURE] Erreur lors de la soumission de la candidature: {}", e.getMessage(), e);
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
            profil.setDomaines(objectMapper.writeValueAsString(populateCvDTO.getDomaines()));
            profil.setNiveauEtude(populateCvDTO.getNiveauEtude());
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
            if (updateProfileDTO.getLinkedinUrl() != null)
                profil.setLinkedinUrl(updateProfileDTO.getLinkedinUrl());
            if (updateProfileDTO.getGithubUrl() != null)
                profil.setGithubUrl(updateProfileDTO.getGithubUrl());
            if (updateProfileDTO.getPortfolioUrl() != null)
                profil.setPortfolioUrl(updateProfileDTO.getPortfolioUrl());
        } catch (Exception e) {
            throw new RuntimeException("Erreur de sérialisation JSON : " + e.getMessage(), e);
        }
        profilRepository.save(profil);
    }

    /**
     * Met à jour le CV du candidat et supprime l'ancien CV de Cloudflare R2.
     */
    public String mettreAJourCv(String idUtilisateur, MultipartFile fichier) {
        logger.info("[UPDATE-CV] Mise à jour du CV pour utilisateurId={}", idUtilisateur);
        
        Profile profil = profilRepository.findByUtilisateurId(idUtilisateur);
        if (profil == null) {
            throw new RuntimeException("Profil introuvable pour l'utilisateur : " + idUtilisateur);
        }

        // Supprimer l'ancien CV de Cloudflare R2 si existe
        if (profil.getUrlCv() != null && !profil.getUrlCv().isEmpty()) {
            try {
                String ancienChemin = profil.getUrlCv().substring(profil.getUrlCv().lastIndexOf("/") + 1);
                serviceStockage.deleteCvFile("cvs/" + idUtilisateur + "/" + ancienChemin);
                logger.info("[UPDATE-CV] Ancien CV supprimé de Cloudflare R2");
            } catch (Exception e) {
                logger.error("[UPDATE-CV] Erreur lors de la suppression de l'ancien CV: {}", e.getMessage());
                // Continue même si la suppression échoue
            }
        }

        // Uploader le nouveau CV
        String cheminCv = "cvs/" + idUtilisateur + "/" + UUID.randomUUID() + ".pdf";
        String urlCv = null;
        try {
            urlCv = serviceStockage.uploadCvFile(cheminCv, fichier);
            logger.info("[UPDATE-CV] Nouveau CV uploadé sur Cloudflare R2: {}", urlCv);
        } catch (Exception e) {
            logger.error("[UPDATE-CV] Erreur lors de l'upload sur Cloudflare R2: {}", e.getMessage(), e);
            throw e;
        }

        // Mettre à jour le profil avec la nouvelle URL du CV
        profil.setUrlCv(urlCv);
        profilRepository.save(profil);
        logger.info("[UPDATE-CV] Profil mis à jour avec nouvelle urlCv");

        return urlCv;
    }

    public List<Profile> getAllProfils() {
        return profilRepository.findAll();
    }

    public Profile getProfilByUtilisateurId(String utilisateurId) {
        return profilRepository.findByUtilisateurId(utilisateurId);
    }

    public Profile populateCv(PopulateCvDTO populateCvDTO) {
        Profile profile = profilRepository.findByUtilisateurId(populateCvDTO.getId());
        if (profile == null) {
            throw new RuntimeException("Profil non trouvé");
        }

        try {
            // Mettre à jour les champs du profil
            profile.setEmail(populateCvDTO.getEmail());
            profile.setCompetences(objectMapper.writeValueAsString(populateCvDTO.getCompetences()));
            profile.setLangues(objectMapper.writeValueAsString(populateCvDTO.getLangues()));
            profile.setExperiences(objectMapper.writeValueAsString(populateCvDTO.getExperiences()));
            profile.setEducations(objectMapper.writeValueAsString(populateCvDTO.getEducations()));
            profile.setDomaines(objectMapper.writeValueAsString(populateCvDTO.getDomaines()));
            profile.setNiveauEtude(populateCvDTO.getNiveauEtude());

            return profilRepository.save(profile);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour du profil: " + e.getMessage(), e);
        }
    }

    public Profile saveProfile(Profile profile) {
        return profilRepository.save(profile);
    }
}
