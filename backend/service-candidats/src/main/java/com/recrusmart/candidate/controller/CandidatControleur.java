package com.recrusmart.candidate.controller;

import com.recrusmart.candidate.dto.ProfileDTO;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;
import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;

@RestController
@RequestMapping("/api/candidats")
public class CandidatControleur {
    @Autowired
    private CandidateService candidatService;

    @PostMapping("/profil")
    public ResponseEntity<Void> creerProfil(@RequestBody ProfileDTO profilDTO, @RequestHeader("Authorization") String token) {
        TokenInfo tokenInfo = extractTokenInfo(token);
        profilDTO.setUtilisateurId(tokenInfo.getUserId());
        profilDTO.setEmail(tokenInfo.getEmail());
        System.out.println("[DEBUG] Appel à /candidats/profil avec: " + profilDTO);
        candidatService.creerProfil(profilDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cv")
    public ResponseEntity<String> televerserCv(@RequestHeader("Authorization") String token, @RequestPart("fichier") MultipartFile fichier) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            String utilisateurId = tokenInfo.getUserId();
            String email = tokenInfo.getEmail();
            System.out.println("[DEBUG] Appel à /candidats/cv, fichier reçu: " + (fichier != null ? fichier.getOriginalFilename() : "null"));
            
            // Check if profile exists, if not create one
            Profile existingProfile = candidatService.getProfilByUtilisateurId(utilisateurId);
            if (existingProfile == null) {
                // Create a new profile with basic information
                ProfileDTO newProfile = new ProfileDTO();
                newProfile.setUtilisateurId(utilisateurId);
                newProfile.setEmail(email);
                candidatService.creerProfil(newProfile);
            }
            
            String urlCv = candidatService.televerserCv(utilisateurId, fichier, token);
            return ResponseEntity.ok(urlCv);
        } catch (RuntimeException e) {
            // If token is invalid or missing claims, try to proceed without profile creation
            System.out.println("[WARN] Token validation failed: " + e.getMessage() + ". Proceeding without profile creation.");
            String urlCv = candidatService.televerserCv(null, fichier, token);
            return ResponseEntity.ok(urlCv);
        }
    }

    @PostMapping("/candidature")
    public ResponseEntity<Void> soumettreCandidature(@RequestParam String offreId, @RequestHeader("Authorization") String token) {
        TokenInfo tokenInfo = extractTokenInfo(token);
        String utilisateurId = tokenInfo.getUserId();
        candidatService.soumettreCandidature(utilisateurId, offreId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remplir-cv")
    public ResponseEntity<Void> remplirCv(@RequestBody PopulateCvDTO populateCvDTO, @RequestHeader("Authorization") String token) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            populateCvDTO.setId(tokenInfo.getUserId());
            populateCvDTO.setEmail(tokenInfo.getEmail());
            System.out.println("[DEBUG] Payload reçu à /remplir-cv: " + populateCvDTO);
            if (populateCvDTO != null) {
                System.out.println("[DEBUG] Types: exp=" + (populateCvDTO.getExperiences() != null ? populateCvDTO.getExperiences().getClass() : "null") +
                    ", comp=" + (populateCvDTO.getCompetences() != null ? populateCvDTO.getCompetences().getClass() : "null") +
                    ", lang=" + (populateCvDTO.getLangues() != null ? populateCvDTO.getLangues().getClass() : "null") +
                    ", edu=" + (populateCvDTO.getEducations() != null ? populateCvDTO.getEducations().getClass() : "null"));
            }
            candidatService.remplirCv(populateCvDTO);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.out.println("[ERROR] Erreur lors du remplissage du CV: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/mettre-a-jour-profil")
    public ResponseEntity<Void> mettreAJourProfil(@RequestBody UpdateProfileDTO updateProfileDTO, @RequestHeader("Authorization") String token) {
        TokenInfo tokenInfo = extractTokenInfo(token);
        String utilisateurId = tokenInfo.getUserId();
        candidatService.mettreAJourProfil(utilisateurId, updateProfileDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profils")
    public ResponseEntity<List<Profile>> getAllProfils() {
        List<Profile> profils = candidatService.getAllProfils();
        return ResponseEntity.ok(profils);
    }

    @GetMapping("/profil")
    public ResponseEntity<Profile> getProfil(@RequestHeader("Authorization") String token) {
        TokenInfo tokenInfo = extractTokenInfo(token);
        String utilisateurId = tokenInfo.getUserId();
        Profile profil = candidatService.getProfilByUtilisateurId(utilisateurId);
        if (profil == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profil);
    }

    @PostMapping("/populate-cv")
    public ResponseEntity<Profile> populateCv(@RequestBody PopulateCvDTO populateCvDTO, @RequestHeader("Authorization") String token) {
        try {
            TokenInfo tokenInfo = extractTokenInfo(token);
            populateCvDTO.setEmail(tokenInfo.getEmail());
            populateCvDTO.setId(tokenInfo.getUserId());
            
            Profile profile = candidatService.populateCv(populateCvDTO);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private static class TokenInfo {
        private String email;
        private String userId;

        public TokenInfo(String email, String userId) {
            this.email = email;
            this.userId = userId;
        }

        public String getEmail() { return email; }
        public String getUserId() { return userId; }
    }

    private TokenInfo extractTokenInfo(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                DecodedJWT jwt = JWT.decode(token);
                String email = jwt.getClaim("email").asString();
                String userId = jwt.getClaim("id").asString();
                
                if (email == null || userId == null) {
                    throw new RuntimeException("Token missing required claims");
                }
                
                return new TokenInfo(email, userId);
            } catch (Exception e) {
                throw new RuntimeException("Invalid token: " + e.getMessage());
            }
        }
        throw new RuntimeException("No token provided");
    }
}