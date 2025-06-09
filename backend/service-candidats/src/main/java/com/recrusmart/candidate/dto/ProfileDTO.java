package com.recrusmart.candidate.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ProfileDTO {
    private Long userId;
    private String cvUrl;
    private Map<String, Object> skills;
    private Map<String, String> languages;
    private Integer yearsExperience;
}