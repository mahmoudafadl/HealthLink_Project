package com.healthLinh.HealthLink_Backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDTO {
    private Long id;
    private String name;
    private int age;
    private String condition;
    private String lastVisit;
    private String nextAppointment;
}
