package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.ClinicalRecord;
import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Repositories.ClinicalRepo;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClinicalService {

    private final ClinicalRepo clinicalRepo;
    private final NotificationClientService notificationClientService;

    public ClinicalService(
            ClinicalRepo clinicalRepo,
            NotificationClientService notificationClientService
    ) {
        this.clinicalRepo = clinicalRepo;
        this.notificationClientService = notificationClientService;
    }

    public ClinicalRecord addRecord(
            @org.springframework.lang.NonNull ClinicalRecord record
    ) {

        ClinicalRecord savedRecord =
                clinicalRepo.save(record);

        notificationClientService.sendNotification(
                record.getPatient().getId(),
                "PATIENT",
                "Prescription Ready",
                "Your doctor uploaded a new clinical report or prescription.",
                NotificationType.PRESCRIPTION
        );

        return savedRecord;
    }

    public List<ClinicalRecord> getPatientRecords(Long patientId) {
        return clinicalRepo.findByPatient_IdOrderByCreatedAtDesc(patientId);
    }

    public List<ClinicalRecord> getDoctorRecords(Long doctorId) {
        return clinicalRepo.findByDoctor_IdOrderByCreatedAtDesc(doctorId);
    }
}