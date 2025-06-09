package com.recrusmart.candidate.dto;

import lombok.Data;
import java.util.List;

@Data
public class PopulateCvDTO {
    private String id; // utilisateurId (ObjectId MongoDB)
    private List<String> experiences;
    private List<String> competences;
    private List<String> langues;
    private List<String> educations;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<String> getExperiences() { return experiences; }
    public void setExperiences(List<String> experiences) { this.experiences = experiences; }
    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }
    public List<String> getLangues() { return langues; }
    public void setLangues(List<String> langues) { this.langues = langues; }
    public List<String> getEducations() { return educations; }
    public void setEducations(List<String> educations) { this.educations = educations; }
} 