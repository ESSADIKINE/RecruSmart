package com.recrusmart.candidate.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class PopulateCvDTO {
    private String id; // utilisateurId (ObjectId MongoDB)
    private Map<String, Map<String, Object>> experiences;
    private Map<String, Integer> competences;
    private Map<String, String> langues;
    private Map<String, Map<String, Object>> educations;
    private Integer anneesExperience;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
} 