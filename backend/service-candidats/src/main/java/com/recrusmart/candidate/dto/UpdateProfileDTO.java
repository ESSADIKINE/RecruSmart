package com.recrusmart.candidate.dto;

import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileDTO {
    private List<String> domaines;
    private Integer experience;
    private String niveauEtude;

    public List<String> getDomaines() { return domaines; }
    public void setDomaines(List<String> domaines) { this.domaines = domaines; }
    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }
    public String getNiveauEtude() { return niveauEtude; }
    public void setNiveauEtude(String niveauEtude) { this.niveauEtude = niveauEtude; }
} 