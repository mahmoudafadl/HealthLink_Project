package com.healthLinh.HealthLink_Backend.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Entity
@Table(name = "doctor_profiles")
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;


    @NotBlank(message = "Specialization is required")
    @Size(min = 3, max = 100)
    @Column(nullable = false)
    private String specialization;

    @Min(value = 0, message = "Rating cannot be less than 0")
    @Max(value = 5, message = "Rating cannot be more than 5")
    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private Integer ratingCount = 0;


    @Min(value = 0, message = "Experience cannot be negative")
    @Column(nullable = false)
    private Integer experienceYears = 0;
}