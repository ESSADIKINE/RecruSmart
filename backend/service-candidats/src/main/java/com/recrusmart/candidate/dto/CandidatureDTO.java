package com.recrusmart.candidate.dto;

import lombok.Data;

@Data
public class CandidatureDTO {
    private Long profileId;
    private String offerId;
    private String status;
    private Integer score;
}