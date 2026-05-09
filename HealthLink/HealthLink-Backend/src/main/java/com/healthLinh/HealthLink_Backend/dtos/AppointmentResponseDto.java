package com.healthLinh.HealthLink_Backend.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentResponseDto {

    private Long id;

    private String patientName;

    private String doctorName;

    private String specialization;

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private String visitType;

    private String status;
}