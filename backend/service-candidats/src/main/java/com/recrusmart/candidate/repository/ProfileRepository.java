package com.recrusmart.candidate.repository;

import com.recrusmart.candidate.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Profile findByUserId(Long userId);
}

