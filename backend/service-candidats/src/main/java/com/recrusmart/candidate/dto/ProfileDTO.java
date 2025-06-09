package com.recrusmart.candidate.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ProfileDTO {
    private String utilisateurId;
    private String urlCv;
    private Map<String, Object> competences;
    private Map<String, String> langues;
    private Integer anneesExperience;

    public String getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(String utilisateurId) { this.utilisateurId = utilisateurId; }
    public String getUrlCv() { return urlCv; }
    public void setUrlCv(String urlCv) { this.urlCv = urlCv; }
    public Map<String, Object> getCompetences() { return competences; }
    public void setCompetences(Map<String, Object> competences) { this.competences = competences; }
    public Map<String, String> getLangues() { return langues; }
    public void setLangues(Map<String, String> langues) { this.langues = langues; }
    public Integer getAnneesExperience() { return anneesExperience; }
    public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }
}