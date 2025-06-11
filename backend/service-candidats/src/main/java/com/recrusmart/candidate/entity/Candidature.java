package com.recrusmart.candidate.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "candidatures")
@Data
public class Candidature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profile_id", nullable = false)
    private String profilId;

    @Column(name = "offer_id", nullable = false)
    private String offreId; // Identifiant de l'offre (ObjectId MongoDB)

    private String statut; // EN_ATTENTE, ENTRETIEN, REJETÉ, ACCEPTÉ

    private Integer score; // Score de correspondance IA

    public String getProfilId() { return profilId; }
    public void setProfilId(String profilId) { this.profilId = profilId; }
    public String getOffreId() { return offreId; }
    public void setOffreId(String offreId) { this.offreId = offreId; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
