package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.ClinicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicalRepo extends JpaRepository<ClinicalRecord, Long> {
    List<ClinicalRecord> findByPatient_IdOrderByCreatedAtDesc(Long patientId);
    List<ClinicalRecord> findByDoctor_IdOrderByCreatedAtDesc(Long doctorId);
}