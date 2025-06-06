package com.recrusmart.candidate.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    private Long id; // Maps to UserID from auth-service
    private String email;
    private String role; // CANDIDAT, RECRUTEUR, ADMIN
}