package com.recrusmart.candidate.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ProfileDTO {
    private String utilisateurId;
    private String urlCv;
    private Map<String, Integer> competences;
    private Map<String, String> langues;
    private Integer anneesExperience;
    private Map<String, Map<String, Object>> experiences;
    private Map<String, Map<String, Object>> educations;

    public String getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(String utilisateurId) { this.utilisateurId = utilisateurId; }
    public String getUrlCv() { return urlCv; }
    public void setUrlCv(String urlCv) { this.urlCv = urlCv; }
    public Map<String, Integer> getCompetences() { return competences; }
    public void setCompetences(Map<String, Integer> competences) { this.competences = competences; }
    public Map<String, String> getLangues() { return langues; }
    public void setLangues(Map<String, String> langues) { this.langues = langues; }
    public Integer getAnneesExperience() { return anneesExperience; }
    public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }
    public Map<String, Map<String, Object>> getExperiences() { return experiences; }
    public void setExperiences(Map<String, Map<String, Object>> experiences) { this.experiences = experiences; }
    public Map<String, Map<String, Object>> getEducations() { return educations; }
    public void setEducations(Map<String, Map<String, Object>> educations) { this.educations = educations; }
}