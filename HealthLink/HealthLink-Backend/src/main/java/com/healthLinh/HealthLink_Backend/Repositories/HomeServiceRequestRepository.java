package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.HomeServiceRequest;
import com.healthLinh.HealthLink_Backend.Enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeServiceRequestRepository extends JpaRepository<HomeServiceRequest, Long> {
    List<HomeServiceRequest> findByPatient_Id(Long patientId);
    List<HomeServiceRequest> findByNurse_Id(Long nurseId);
    List<HomeServiceRequest> findByNurse_IdAndStatus(Long nurseId, AppointmentStatus status);
    List<HomeServiceRequest> findByNurseIsNullAndStatus(AppointmentStatus status);
}
