package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Entities.Appointment;

import com.healthLinh.HealthLink_Backend.dtos.AppointmentRequestDto;
import com.healthLinh.HealthLink_Backend.dtos.AppointmentResponseDto;

import com.healthLinh.HealthLink_Backend.services.AppointmentService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService
    ) {
        this.appointmentService = appointmentService;
    }

    // ===============================
    // Patient books appointment
    // ===============================
    @PostMapping
    public Appointment createAppointment(
            @RequestBody AppointmentRequestDto request
    ) {
        return appointmentService.createAppointment(request);
    }

    // ===============================
    // Doctor sees his appointments
    // ===============================
    @GetMapping("/doctor/{doctorId}")
    public List<AppointmentResponseDto> getDoctorAppointments(
            @PathVariable Long doctorId
    ) {
        if (doctorId == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        return appointmentService.getDoctorAppointments(doctorId);
    }

    // ===============================
    // Patient sees his appointments
    // ===============================
    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponseDto> getPatientAppointments(
            @PathVariable Long patientId
    ) {
        if (patientId == null) throw new IllegalArgumentException("Patient ID cannot be null");
        return appointmentService.getPatientAppointments(patientId);
    }

    // ===============================
    // Doctor approves appointment
    // ===============================
    @PutMapping("/{appointmentId}/approve")
    public Appointment approveAppointment(
            @PathVariable Long appointmentId
    ) {
        if (appointmentId == null) throw new IllegalArgumentException("Appointment ID cannot be null");
        return appointmentService.approveAppointment(appointmentId);
    }

    // ===============================
    // Doctor rejects appointment
    // ===============================
    @PutMapping("/{appointmentId}/reject")
    public Appointment rejectAppointment(
            @PathVariable Long appointmentId
    ) {
        if (appointmentId == null) throw new IllegalArgumentException("Appointment ID cannot be null");
        return appointmentService.rejectAppointment(appointmentId);
    }

    // ===============================
    // Patient cancels appointment
    // ===============================
    @PutMapping("/{appointmentId}/cancel")
    public Appointment cancelAppointment(
            @PathVariable Long appointmentId
    ) {
        if (appointmentId == null) throw new IllegalArgumentException("Appointment ID cannot be null");
        return appointmentService.cancelAppointment(appointmentId);
    }

    // ===============================
    // Doctor completes appointment
    // ===============================
    @PutMapping("/{appointmentId}/complete")
    public Appointment completeAppointment(
            @PathVariable Long appointmentId
    ) {
        if (appointmentId == null) throw new IllegalArgumentException("Appointment ID cannot be null");
        return appointmentService.completeAppointment(appointmentId);
    }
    
    @GetMapping("/all")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }
}