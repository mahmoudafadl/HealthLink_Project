package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Entities.ClinicalRecord;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;
import com.healthLinh.HealthLink_Backend.services.ClinicalService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/clinical")
public class ClinicalController {

    private final UserRepo userRepository;
    private final ClinicalService clinicalService;

    public ClinicalController(UserRepo userRepository, ClinicalService clinicalService) {
        this.userRepository = userRepository;
        this.clinicalService = clinicalService;
    }

    @PostMapping("/add")
    public ClinicalRecord addRecord(@RequestBody ClinicalRecord record) {
        return clinicalService.addRecord(record);
    }

    @GetMapping("/patient/{id}")
    public List<ClinicalRecord> getPatientRecords(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        if (user.getRole() == Role.PATIENT && !user.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }
        return clinicalService.getPatientRecords(id);
    }

    @GetMapping("/doctor/{id}")
    public List<ClinicalRecord> getDoctorRecords(@PathVariable Long id) {
        return clinicalService.getDoctorRecords(id);
    }
}