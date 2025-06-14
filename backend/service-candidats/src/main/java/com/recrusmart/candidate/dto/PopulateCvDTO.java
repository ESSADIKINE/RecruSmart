package com.recrusmart.candidate.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class PopulateCvDTO {
    private String id; // Identifiant de l'utilisateur (ObjectId MongoDB)
    private String email;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private Map<String, Map<String, Object>> experiences;
    private Map<String, Integer> competences;
    private Map<String, String> langues;
    private Map<String, Map<String, Object>> educations;
    private Integer anneesExperience;
    private List<String> domaines;
    private String niveauEtude;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public Map<String, Map<String, Object>> getExperiences() { return experiences; }
    public void setExperiences(Map<String, Map<String, Object>> experiences) { this.experiences = experiences; }
    public Map<String, Integer> getCompetences() { return competences; }
    public void setCompetences(Map<String, Integer> competences) { this.competences = competences; }
    public Map<String, String> getLangues() { return langues; }
    public void setLangues(Map<String, String> langues) { this.langues = langues; }
    public Map<String, Map<String, Object>> getEducations() { return educations; }
    public void setEducations(Map<String, Map<String, Object>> educations) { this.educations = educations; }
    public Integer getAnneesExperience() { return anneesExperience; }
    public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }
    public List<String> getDomaines() { return domaines; }
    public void setDomaines(List<String> domaines) { this.domaines = domaines; }
    public String getNiveauEtude() { return niveauEtude; }
    public void setNiveauEtude(String niveauEtude) { this.niveauEtude = niveauEtude; }
} 