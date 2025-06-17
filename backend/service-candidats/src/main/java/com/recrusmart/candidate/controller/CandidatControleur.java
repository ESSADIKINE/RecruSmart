package com.recrusmart.candidate.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/candidats")
@RequiredArgsConstructor
public class CandidatControleur {
    
    private static final Logger log = LoggerFactory.getLogger(CandidatControleur.class);
    private final CandidateService service;

    @PostMapping("/cv")
    public ResponseEntity<?> uploadCv(@RequestHeader("Authorization") String h,
                                      @RequestPart("fichier") MultipartFile f) {
        Token t = token(h);
        if (!"CANDIDAT".equals(t.role)) return forbid();
        String url = service.televerserCv(t.id, f, h);
        return ResponseEntity.ok(Map.of("cvUrl", url));
    }

    @PostMapping("/candidature")
    public ResponseEntity<?> candidature(@RequestParam String offreId,
                                         @RequestHeader("Authorization") String h) {
        try {
            Token t = token(h);
            service.soumettreCandidature(t.id, offreId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erreur lors de la soumission de la candidature: {}", e.getMessage());
            return ResponseEntity.status(500)
                .body(Map.of("error", "Erreur lors de la soumission de la candidature: " + e.getMessage()));
        }
    }

    @PostMapping("/remplir-cv")
    public ResponseEntity<?> remplirCv(@RequestBody PopulateCvDTO d,
                                       @RequestHeader("Authorization") String h) {
        d.setId(token(h).id);
        service.remplirCv(d);
            return ResponseEntity.ok().build();
    }

    @PutMapping("/mettre-a-jour-profil")
    public ResponseEntity<?> updateProfil(@RequestBody UpdateProfileDTO d,
                                          @RequestHeader("Authorization") String h) {
        Token t = token(h);
        if (!"CANDIDAT".equals(t.role)) return forbid();
        service.mettreAJourProfil(t.id, d);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCv(@RequestHeader("Authorization") String h,
                                      @RequestPart("fichier") MultipartFile f) {
        try {
            Token t = token(h);
            if (!"CANDIDAT".equals(t.role)) return forbid();
            String url = service.mettreAJourCv(t.id, f);
            return ResponseEntity.ok(Map.of("cvUrl", url));
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du CV: {}", e.getMessage());
            return ResponseEntity.status(500)
                .body(Map.of("error", "Erreur lors de la mise à jour du CV: " + e.getMessage()));
        }
    }

    @GetMapping("/profil")
    public ResponseEntity<?> profil(@RequestHeader("Authorization") String h) {
        Profile p = service.getProfilByUtilisateurId(token(h).id);
        return p == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(p);
    }

    @GetMapping("/work")
    public Map<String, String> work() { return Map.of("status", "success"); }

    /* helpers */
    private record Token(String email, String id, String role) {}
    private Token token(String h) {
        if (h == null || !h.startsWith("Bearer ")) throw new RuntimeException("Token manquant");
        DecodedJWT j = JWT.decode(h.substring(7));
        return new Token(j.getClaim("email").asString(),
                         j.getClaim("id").asString(),
                         j.getClaim("role").asString());
    }
    private ResponseEntity<Map<String,String>> forbid() {
        return ResponseEntity.status(403).body(Map.of("error","Accès refusé"));
    }
}
