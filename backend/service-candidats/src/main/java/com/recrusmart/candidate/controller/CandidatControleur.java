package com.recrusmart.candidate.controller;

import com.recrusmart.candidate.dto.ProfileDTO;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;
import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;

@RestController
@RequestMapping("/api/candidats")
public class CandidatControleur {
    private static final Logger logger = LoggerFactory.getLogger(CandidatControleur.class);
    
    @Autowired
    private CandidateService candidatService;

    @PostMapping("/cv")
    public ResponseEntity<?> televerserCv(@RequestHeader("Authorization") String token, @RequestPart("fichier") MultipartFile fichier) {
        try {
            logger.info("[UPLOAD-CV] Received request with token length={}, file={}", 
                token != null ? token.length() : 0,
                fichier != null ? fichier.getOriginalFilename() : "null");
                
            TokenInfo tokenInfo = extractTokenInfo(token);
            
            // Vérifier si l'utilisateur est un candidat
            if (!"CANDIDAT".equals(tokenInfo.getRole())) {
                logger.error("[UPLOAD-CV] Accès refusé: utilisateur n'est pas un candidat");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Seuls les candidats peuvent téléverser un CV");
                return ResponseEntity.status(403).body(error);
            }
            
            String utilisateurId = tokenInfo.getUserId();
            logger.info("[UPLOAD-CV] Téléversement du CV pour utilisateurId={}, fichier={}", 
                utilisateurId, fichier.getOriginalFilename());
                
            String urlCv = candidatService.televerserCv(utilisateurId, fichier, token);
            return ResponseEntity.ok(urlCv);
        } catch (Exception e) {
            logger.error("[UPLOAD-CV] Erreur lors du téléversement du CV: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors du téléversement du CV: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/candidature")
    public ResponseEntity<?> soumettreCandidature(@RequestParam String offreId, @RequestHeader("Authorization") String token) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            String utilisateurId = tokenInfo.getUserId();
            
            logger.info("[SUBMIT-APPLICATION] Soumission de candidature pour utilisateurId={}, offreId={}", 
                utilisateurId, offreId);
                
            candidatService.soumettreCandidature(utilisateurId, offreId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("[SUBMIT-APPLICATION] Erreur lors de la soumission de la candidature: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la soumission de la candidature: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/remplir-cv")
    public ResponseEntity<?> remplirCv(@RequestBody PopulateCvDTO populateCvDTO, @RequestHeader("Authorization") String token) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            populateCvDTO.setId(tokenInfo.getUserId());
            
            logger.info("[FILL-CV] Remplissage du CV pour utilisateurId={}", tokenInfo.getUserId());
            candidatService.remplirCv(populateCvDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("[FILL-CV] Erreur lors du remplissage du CV: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors du remplissage du CV: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/mettre-a-jour-profil")
    public ResponseEntity<?> mettreAJourProfil(@RequestBody UpdateProfileDTO updateProfileDTO, @RequestHeader("Authorization") String token) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            
            // Vérifier si l'utilisateur est un candidat
            if (!"CANDIDAT".equals(tokenInfo.getRole())) {
                logger.error("[UPDATE-PROFILE] Accès refusé: utilisateur n'est pas un candidat");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Seuls les candidats peuvent mettre à jour leur profil");
                return ResponseEntity.status(403).body(error);
            }
            
            String utilisateurId = tokenInfo.getUserId();
            logger.info("[UPDATE-PROFILE] Mise à jour du profil pour utilisateurId={}", utilisateurId);
            candidatService.mettreAJourProfil(utilisateurId, updateProfileDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("[UPDATE-PROFILE] Erreur lors de la mise à jour du profil: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la mise à jour du profil: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/cv")
    public ResponseEntity<?> mettreAJourCv(@RequestHeader("Authorization") String token, @RequestPart("fichier") MultipartFile fichier) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            String utilisateurId = tokenInfo.getUserId();
            
            logger.info("[UPDATE-CV] Mise à jour du CV pour utilisateurId={}, fichier={}", 
                utilisateurId, fichier.getOriginalFilename());
                
            String urlCv = candidatService.mettreAJourCv(utilisateurId, fichier);
            return ResponseEntity.ok(urlCv);
        } catch (Exception e) {
            logger.error("[UPDATE-CV] Erreur lors de la mise à jour du CV: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la mise à jour du CV: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/profil")
    public ResponseEntity<?> getProfil(@RequestHeader("Authorization") String token) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            String utilisateurId = tokenInfo.getUserId();
            
            logger.info("[GET-PROFILE] Récupération du profil pour utilisateurId={}", utilisateurId);
            Profile profil = candidatService.getProfilByUtilisateurId(utilisateurId);
            if (profil == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(profil);
        } catch (Exception e) {
            logger.error("[GET-PROFILE] Erreur lors de la récupération du profil: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Erreur lors de la récupération du profil: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            logger.info("[TEST] Test endpoint called");
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Service Candidat is working!");
            response.put("timestamp", new java.util.Date().toString());
            
            if (token != null) {
                try {
                    TokenInfo tokenInfo = extractTokenInfo(token);
                    Map<String, String> tokenInfoMap = new HashMap<>();
                    tokenInfoMap.put("userId", tokenInfo.getUserId());
                    tokenInfoMap.put("email", tokenInfo.getEmail());
                    tokenInfoMap.put("role", tokenInfo.getRole());
                    response.put("tokenInfo", tokenInfoMap);
                } catch (Exception e) {
                    logger.warn("[TEST] Token validation failed: {}", e.getMessage());
                    response.put("tokenInfo", "Invalid token");
                }
            }
            
            logger.info("[TEST] Sending response: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[TEST] Error in test endpoint: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Error in test endpoint: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private static class TokenInfo {
        private String email;
        private String userId;
        private String role;

        public TokenInfo(String email, String userId, String role) {
            this.email = email;
            this.userId = userId;
            this.role = role;
        }

        public String getEmail() { return email; }
        public String getUserId() { return userId; }
        public String getRole() { return role; }
    }

    private TokenInfo extractTokenInfo(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                DecodedJWT jwt = JWT.decode(token);
                String email = jwt.getClaim("email").asString();
                String userId = jwt.getClaim("id").asString();
                String role = jwt.getClaim("role").asString();
                
                if (email == null || userId == null || role == null) {
                    logger.error("[TOKEN] Token missing required claims");
                    throw new RuntimeException("Token missing required claims");
                }
                
                return new TokenInfo(email, userId, role);
            } catch (Exception e) {
                logger.error("[TOKEN] Invalid token: {}", e.getMessage());
                throw new RuntimeException("Invalid token: " + e.getMessage());
            }
        }
        logger.error("[TOKEN] No token provided");
        throw new RuntimeException("No token provided");
    }
}