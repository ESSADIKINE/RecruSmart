package com.recrusmart.candidate.repository;

import com.recrusmart.candidate.entity.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findByProfilId(String profilId);
}
