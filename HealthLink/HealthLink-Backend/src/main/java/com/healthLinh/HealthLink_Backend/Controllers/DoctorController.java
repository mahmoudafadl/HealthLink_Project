package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.dtos.DoctorDTO;
import com.healthLinh.HealthLink_Backend.services.DoctorService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // 👨‍⚕️ Get all active doctors
     @GetMapping
    public List<DoctorDTO> getDoctors() {
        return doctorService.getDoctors();
    }
   

    @GetMapping("/{id}")
    public DoctorDTO getDoctor(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        return doctorService.getDoctor(id);
    }

    @GetMapping("/{id}/patients")
    public List<com.healthLinh.HealthLink_Backend.dtos.PatientDTO> getDoctorPatients(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        return doctorService.getDoctorPatients(id);
    }

    @PostMapping("/rate/{id}")
    public DoctorDTO rateDoctor(@PathVariable Long id,
                                @RequestParam double rate) {
        if (id == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        return doctorService.rateDoctor(id, rate);
    }
}