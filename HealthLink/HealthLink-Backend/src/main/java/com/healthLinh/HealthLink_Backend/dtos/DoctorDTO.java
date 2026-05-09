package com.healthLinh.HealthLink_Backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDTO {

    private Long id;         // DoctorProfile ID
    private Long userId;      // User ID (for booking appointments)
    private String fullName;
    private String email;
    private String specialization;
    private Integer experienceYears;
    private double rating;
}