package com.recrusmart.candidate.dto;

import java.util.Map;
import java.util.List;

public class UpdateProfileDTO {
    private Map<String, Integer> competences;
    private Map<String, String> langues;
    private Integer anneesExperience;
    private Map<String, ExperienceDTO> experiences;
    private Map<String, EducationDTO> educations;
    private List<String> domaines;
    private String niveauEtude;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    // Getters and Setters
    public Map<String, Integer> getCompetences() { return competences; }
    public void setCompetences(Map<String, Integer> competences) { this.competences = competences; }

    public Map<String, String> getLangues() { return langues; }
    public void setLangues(Map<String, String> langues) { this.langues = langues; }

    public Integer getAnneesExperience() { return anneesExperience; }
    public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }

    public Map<String, ExperienceDTO> getExperiences() { return experiences; }
    public void setExperiences(Map<String, ExperienceDTO> experiences) { this.experiences = experiences; }

    public Map<String, EducationDTO> getEducations() { return educations; }
    public void setEducations(Map<String, EducationDTO> educations) { this.educations = educations; }

    public List<String> getDomaines() { return domaines; }
    public void setDomaines(List<String> domaines) { this.domaines = domaines; }

    public String getNiveauEtude() { return niveauEtude; }
    public void setNiveauEtude(String niveauEtude) { this.niveauEtude = niveauEtude; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    // Nested DTOs
    public static class ExperienceDTO {
        private String duree;
        private String type;
        private String entreprise;
        private String date_debut;

        public String getDuree() { return duree; }
        public void setDuree(String duree) { this.duree = duree; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getEntreprise() { return entreprise; }
        public void setEntreprise(String entreprise) { this.entreprise = entreprise; }

        public String getDate_debut() { return date_debut; }
        public void setDate_debut(String date_debut) { this.date_debut = date_debut; }
    }

    public static class EducationDTO {
        private Integer annee_debut;
        private Integer annee_fin;
        private String etablissement;

        public Integer getAnnee_debut() { return annee_debut; }
        public void setAnnee_debut(Integer annee_debut) { this.annee_debut = annee_debut; }

        public Integer getAnnee_fin() { return annee_fin; }
        public void setAnnee_fin(Integer annee_fin) { this.annee_fin = annee_fin; }

        public String getEtablissement() { return etablissement; }
        public void setEtablissement(String etablissement) { this.etablissement = etablissement; }
    }
} 