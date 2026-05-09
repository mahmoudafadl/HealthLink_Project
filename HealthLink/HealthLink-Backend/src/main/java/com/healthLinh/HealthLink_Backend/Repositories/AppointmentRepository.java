package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.Appointment;
import com.healthLinh.HealthLink_Backend.Enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // كل حجوزات دكتور معين
    List<Appointment> findByDoctor_Id(Long doctorId);

    // كل حجوزات مريض معين
    List<Appointment> findByPatient_Id(Long patientId);

    // حجوزات دكتور بحالة معينة
    List<Appointment> findByDoctor_IdAndStatus(
            Long doctorId,
            AppointmentStatus status
    );

    // منع double booking
    boolean existsByDoctor_IdAndAppointmentDateAndAppointmentTime(
            Long doctorId,
            LocalDate appointmentDate,
            LocalTime appointmentTime
    );
}