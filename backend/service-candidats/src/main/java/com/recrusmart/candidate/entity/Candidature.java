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
    private Long profileId;

    @Column(name = "offer_id", nullable = false)
    private String offerId; // Maps to MongoDB ObjectId from job-service

    private String status; // PENDING, INTERVIEW, REJECTED, ACCEPTED

    private Integer score; // Matching score from ai-service
}
