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

@Service
public class CandidateService {
    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Profile createProfile(ProfileDTO profileDTO) {
        Profile profile = new Profile();
        profile.setUserId(profileDTO.getUserId());
        profile.setSkills(profileDTO.getSkills());
        profile.setLanguages(profileDTO.getLanguages());
        profile.setYearsExperience(profileDTO.getYearsExperience());
        return profileRepository.save(profile);
    }

    public String uploadCv(Long userId, MultipartFile file) {
        Profile profile = profileRepository.findByUserId(userId);
        if (profile == null) {
            throw new RuntimeException("Profile not found for userId: " + userId);
        }
        String cvPath = "cvs/" + userId + "/" + UUID.randomUUID() + ".pdf";
        String cvUrl = storageService.uploadCvFile(cvPath, file);
        profile.setCvUrl(cvUrl);
        profileRepository.save(profile);

        // Publish CVRecu event
        Map<String, Object> event = new HashMap<>();
        event.put("candidatureId", UUID.randomUUID().toString());
        event.put("cvUrl", cvUrl);
        event.put("userId", userId);
        rabbitTemplate.convertAndSend("recrusmart.events", "Candidate.CV.Recu", event);

        return cvUrl;
    }

    public Candidature submitCandidature(CandidatureDTO candidatureDTO) {
        Candidature candidature = new Candidature();
        candidature.setProfileId(candidatureDTO.getProfileId());
        candidature.setOfferId(candidatureDTO.getOfferId());
        candidature.setStatus("PENDING");
        Candidature savedCandidature = candidatureRepository.save(candidature);

        // Publish CandidatureSoumise event
        Map<String, Object> event = new HashMap<>();
        event.put("candidatureId", savedCandidature.getId());
        event.put("profileId", candidatureDTO.getProfileId());
        event.put("offerId", candidatureDTO.getOfferId());
        event.put("timestamp", java.time.Instant.now().toString());
        rabbitTemplate.convertAndSend("recrusmart.events", "Candidate.Candidature.Soumise", event);

        return savedCandidature;
    }

    public List<Candidature> getCandidaturesByProfile(Long profileId) {
        return candidatureRepository.findByProfileId(profileId);
    }
}
