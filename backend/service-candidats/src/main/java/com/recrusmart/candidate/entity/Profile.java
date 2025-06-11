package com.recrusmart.candidate.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "profiles")
@Data
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", unique = true, nullable = false)
    private String utilisateurId; // Clé étrangère vers users.id (ObjectId MongoDB)

    @Column(name = "cv_url")
    private String urlCv; // URL du CV dans MinIO

    @Column(columnDefinition = "TEXT")
    private String competences; // Compétences (JSON, Map<String, Integer> de 1 à 5)

    @Column(columnDefinition = "TEXT")
    private String langues; // Langues (JSON, Map<String, String>)

    @Column(name = "annees_experience")
    private Integer anneesExperience;

    @Column(columnDefinition = "TEXT")
    private String experiences; // Expériences (JSON, Map<String, Map<String, Object>>)

    @Column(columnDefinition = "TEXT")
    private String educations; // Formations (JSON, Map<String, Map<String, Object>>)

    @Column(columnDefinition = "TEXT")
    private String domaines; // Domaines (JSON, List<String>)

    @Column(name = "niveau_etude")
    private String niveauEtude; // Niveau d'étude

    public String getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(String utilisateurId) { this.utilisateurId = utilisateurId; }
    public String getUrlCv() { return urlCv; }
    public void setUrlCv(String urlCv) { this.urlCv = urlCv; }
    public String getCompetences() { return competences; }
    public void setCompetences(String competences) { this.competences = competences; }
    public String getLangues() { return langues; }
    public void setLangues(String langues) { this.langues = langues; }
    public Integer getAnneesExperience() { return anneesExperience; }
    public void setAnneesExperience(Integer anneesExperience) { this.anneesExperience = anneesExperience; }
    public String getExperiences() { return experiences; }
    public void setExperiences(String experiences) { this.experiences = experiences; }
    public String getEducations() { return educations; }
    public void setEducations(String educations) { this.educations = educations; }
    public String getDomaines() { return domaines; }
    public void setDomaines(String domaines) { this.domaines = domaines; }
    public String getNiveauEtude() { return niveauEtude; }
    public void setNiveauEtude(String niveauEtude) { this.niveauEtude = niveauEtude; }
}
