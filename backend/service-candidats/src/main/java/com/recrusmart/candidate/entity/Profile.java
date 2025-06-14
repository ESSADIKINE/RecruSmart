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

    @Column(name = "email")
    private String email;

    @Column(name = "linkedin_url")
    private String linkedinUrl = "";

    @Column(name = "github_url")
    private String githubUrl = "";

    @Column(name = "portfolio_url")
    private String portfolioUrl = "";

    @Column(name = "cv_url")
    private String urlCv; 

    @Column(columnDefinition = "TEXT")
    private String competences = "{}"; // Compétences (JSON, Map<String, Integer> de 1 à 5)

    @Column(columnDefinition = "TEXT")
    private String langues = "{}"; // Langues (JSON, Map<String, String>)

    @Column(name = "annees_experience")
    private Integer anneesExperience = 0;

    @Column(columnDefinition = "TEXT")
    private String experiences = "{}"; // Expériences (JSON, Map<String, Map<String, Object>>)

    @Column(columnDefinition = "TEXT")
    private String educations = "{}"; // Formations (JSON, Map<String, Map<String, Object>>)

    @Column(columnDefinition = "TEXT")
    private String domaines = "[]"; // Domaines (JSON, List<String>)

    @Column(name = "niveau_etude")
    private String niveauEtude = ""; // Niveau d'étude
}
