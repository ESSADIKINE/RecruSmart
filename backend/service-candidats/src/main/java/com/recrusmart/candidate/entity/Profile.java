package com.recrusmart.candidate.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "profiles")
@Data
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId; // Foreign key to users.id

    @Column(name = "cv_url")
    private String cvUrl; // URL to CV in MinIO

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> skills; // JSON for skills (e.g., {"Java": "Advanced"})

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> languages; // JSON for languages (e.g., {"French": "Fluent"})

    @Column(name = "years_exp")
    private Integer yearsExperience;
}
