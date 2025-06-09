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

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {
    @Autowired
    private CandidateService candidateService;

    @PostMapping("/profile")
    public ResponseEntity<Profile> createProfile(@RequestBody ProfileDTO profileDTO) {
        Profile profile = candidateService.createProfile(profileDTO);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{userId}/cv")
    public ResponseEntity<String> uploadCv(@PathVariable Long userId, @RequestPart("file") MultipartFile file) {
        String cvUrl = candidateService.uploadCv(userId, file);
        return ResponseEntity.ok(cvUrl);
    }

    @PostMapping("/candidature")
    public ResponseEntity<Candidature> submitCandidature(@RequestBody CandidatureDTO candidatureDTO) {
        Candidature candidature = candidateService.submitCandidature(candidatureDTO);
        return ResponseEntity.ok(candidature);
    }

    @GetMapping("/{profileId}/candidatures")
    public ResponseEntity<List<Candidature>> getCandidatures(@PathVariable Long profileId) {
        List<Candidature> candidatures = candidateService.getCandidaturesByProfile(profileId);
        return ResponseEntity.ok(candidatures);
    }
}