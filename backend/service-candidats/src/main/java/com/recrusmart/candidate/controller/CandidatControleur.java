package com.recrusmart.candidate.controller;

import com.recrusmart.candidate.dto.CandidatureDTO;
import com.recrusmart.candidate.dto.ProfileDTO;
import com.recrusmart.candidate.entity.Candidature;
import com.recrusmart.candidate.entity.Profile;
import com.recrusmart.candidate.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import com.recrusmart.candidate.dto.PopulateCvDTO;
import com.recrusmart.candidate.dto.UpdateProfileDTO;

@RestController
@RequestMapping("/candidats")
public class CandidatControleur {
    @Autowired
    private CandidateService candidatService;

    @PostMapping("/profil")
    public ResponseEntity<Profile> creerProfil(@RequestBody ProfileDTO profilDTO) {
        System.out.println("[DEBUG] Appel à /candidats/profil avec: " + profilDTO);
        Profile profil = candidatService.creerProfil(profilDTO);
        return ResponseEntity.ok(profil);
    }

    @PostMapping("/{utilisateurId}/cv")
    public ResponseEntity<String> televerserCv(@PathVariable String utilisateurId, @RequestPart("fichier") MultipartFile fichier) {
        System.out.println("[DEBUG] Appel à /candidats/" + utilisateurId + "/cv, fichier reçu: " + (fichier != null ? fichier.getOriginalFilename() : "null"));
        String urlCv = candidatService.televerserCv(utilisateurId, fichier);
        return ResponseEntity.ok(urlCv);
    }

    @PostMapping("/candidature")
    public ResponseEntity<Candidature> soumettreCandidature(@RequestBody CandidatureDTO candidatureDTO) {
        Candidature candidature = candidatService.soumettreCandidature(candidatureDTO);
        return ResponseEntity.ok(candidature);
    }

    @GetMapping("/{profilId}/candidatures")
    public ResponseEntity<List<Candidature>> recupererCandidatures(@PathVariable String profilId) {
        List<Candidature> candidatures = candidatService.recupererCandidaturesParProfil(profilId);
        return ResponseEntity.ok(candidatures);
    }

    @PostMapping("/televerser-cv")
    public ResponseEntity<String> televerserCvV2(@RequestParam("utilisateurId") String utilisateurId, @RequestPart("fichier") MultipartFile fichier) {
        String urlCv = candidatService.televerserCv(utilisateurId, fichier);
        return ResponseEntity.ok(urlCv);
    }

    @PostMapping("/remplir-cv")
    public ResponseEntity<Void> remplirCv(@RequestBody PopulateCvDTO populateCvDTO) {
        candidatService.remplirCv(populateCvDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/mettre-a-jour-profil")
    public ResponseEntity<Void> mettreAJourProfil(@PathVariable String id, @RequestBody UpdateProfileDTO updateProfileDTO) {
        candidatService.mettreAJourProfil(id, updateProfileDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-test")
    public ResponseEntity<String> uploadTest(@RequestPart("fichier") MultipartFile fichier) {
        System.out.println("[DEBUG] Appel à /candidats/upload-test, fichier reçu: " + (fichier != null ? fichier.getOriginalFilename() : "null"));
        return ResponseEntity.ok("OK: " + (fichier != null ? fichier.getOriginalFilename() : "null"));
    }
}