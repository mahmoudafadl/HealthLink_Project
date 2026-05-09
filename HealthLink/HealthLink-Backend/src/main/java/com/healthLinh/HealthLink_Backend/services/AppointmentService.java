package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.Appointment;
import com.healthLinh.HealthLink_Backend.Entities.DoctorProfile;
import com.healthLinh.HealthLink_Backend.Entities.User;

import com.healthLinh.HealthLink_Backend.Enums.AppointmentStatus;
import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Enums.Role;

import com.healthLinh.HealthLink_Backend.Repositories.AppointmentRepository;
import com.healthLinh.HealthLink_Backend.Repositories.DoctorProfileRepository;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;

import com.healthLinh.HealthLink_Backend.dtos.AppointmentRequestDto;
import com.healthLinh.HealthLink_Backend.dtos.AppointmentResponseDto;

import org.springframework.stereotype.Service;

import java.util.List;

@SuppressWarnings("null")
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepo userRepo;
    private final DoctorProfileRepository doctorProfileRepository;
    private final BillingService billingService;
    private final NotificationClientService notificationClientService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            UserRepo userRepo,
            DoctorProfileRepository doctorProfileRepository,
            BillingService billingService,
            NotificationClientService notificationClientService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.userRepo = userRepo;
        this.doctorProfileRepository = doctorProfileRepository;
        this.billingService = billingService;
        this.notificationClientService = notificationClientService;
    }

    // ===============================
    // Patient books appointment
    // ===============================
    public Appointment createAppointment(AppointmentRequestDto request) {

        Long patientId = request.getPatientId();
        if (patientId == null) throw new IllegalArgumentException("Patient ID cannot be null");
        User patient = userRepo.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (patient.getRole() != Role.PATIENT) {
            throw new RuntimeException("Invalid patient");
        }

        Long doctorId = request.getDoctorId();
        if (doctorId == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        User doctor = userRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (doctor.getRole() != Role.DOCTOR) {
            throw new RuntimeException("Invalid doctor");
        }

        boolean alreadyBooked =
                appointmentRepository
                        .existsByDoctor_IdAndAppointmentDateAndAppointmentTime(
                                doctor.getId(),
                                request.getAppointmentDate(),
                                request.getAppointmentTime()
                        );

        if (alreadyBooked) {
            throw new RuntimeException("Doctor already has appointment at this time");
        }

        Appointment appointment = new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());

        appointment.setVisitType(request.getVisitType());
        appointment.setReason(request.getReason());

        appointment.setStatus(AppointmentStatus.PENDING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Deduct appointment fee (e.g. 150)
        try {
            billingService.deduct(patient.getEmail(), 150.0, savedAppointment.getId());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Insufficient wallet balance for this appointment.");
        }
        notificationClientService.sendNotification(
        patient.getId(),
        "PATIENT",
        "Appointment Created",
        "Your appointment request has been submitted successfully.",
        NotificationType.APPOINTMENT
        );
        notificationClientService.sendNotification(
        doctor.getId(),
        "DOCTOR",
        "New Appointment Request",
        "A patient has requested a new appointment.",
        NotificationType.APPOINTMENT
        );

        return savedAppointment;
    }

    // ===============================
    // Mapping for frontend response
    // ===============================
    private AppointmentResponseDto mapToDto(Appointment appointment) {

        DoctorProfile doctorProfile =
                doctorProfileRepository
                        .findByUserId(
                                appointment.getDoctor().getId()
                        )
                        .orElse(null);

        AppointmentResponseDto dto =
                new AppointmentResponseDto();

        dto.setId(
                appointment.getId()
        );

        dto.setPatientName(
                appointment.getPatient().getFullName()
        );

        dto.setDoctorName(
                appointment.getDoctor().getFullName()
        );

        dto.setSpecialization(
                doctorProfile != null
                        ? doctorProfile.getSpecialization()
                        : "N/A"
        );

        dto.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        dto.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        dto.setVisitType(
                appointment.getVisitType()
        );

        dto.setStatus(
                appointment.getStatus().name()
        );

        return dto;
    }

    // ===============================
    // Doctor sees his appointments
    // ===============================
    public List<AppointmentResponseDto>
    getDoctorAppointments(Long doctorId) {

        return appointmentRepository
                .findByDoctor_Id(doctorId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    // ===============================
    // Patient sees his appointments
    // ===============================
    public List<AppointmentResponseDto>
    getPatientAppointments(Long patientId) {

        return appointmentRepository
                .findByPatient_Id(patientId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    // ===============================
    // Doctor approves appointment
    // ===============================
    public Appointment approveAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be approved");
        }

        appointment.setStatus(AppointmentStatus.APPROVED);

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        notificationClientService.sendNotification(
        appointment.getPatient().getId(),
        "PATIENT",
        "Appointment Approved",
        "Your appointment has been approved by the doctor.",
        NotificationType.APPOINTMENT
        );

        return updatedAppointment;
    }

    // ===============================
    // Doctor rejects appointment
    // ===============================
    public Appointment rejectAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be rejected");
        }

        appointment.setStatus(AppointmentStatus.REJECTED);
        billingService.refund(appointment.getPatient().getEmail(), 150.0, appointment.getId());

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        notificationClientService.sendNotification(
        appointment.getPatient().getId(),
        "PATIENT",
        "Appointment Rejected",
        "Your appointment has been rejected and your wallet was refunded.",
        NotificationType.APPOINTMENT
        );

        return updatedAppointment;
    }

    // ===============================
    // Patient cancels appointment
    // ===============================
    public Appointment cancelAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        billingService.refund(appointment.getPatient().getEmail(), 150.0, appointment.getId());

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        notificationClientService.sendNotification(
        appointment.getPatient().getId(),
        "PATIENT",
        "Appointment Cancelled",
        "Your appointment was cancelled and your wallet was refunded.",
        NotificationType.APPOINTMENT
        );
        notificationClientService.sendNotification(
        appointment.getDoctor().getId(),
        "DOCTOR",
        "Appointment Cancelled",
        "A patient cancelled an appointment .",
        NotificationType.APPOINTMENT
        );
        return updatedAppointment;
    }

    // ===============================
    // Doctor completes appointment
    // ===============================
    public Appointment completeAppointment(Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.APPROVED) {
            throw new RuntimeException("Only approved appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        notificationClientService.sendNotification(
        appointment.getPatient().getId(),
        "PATIENT",
        "Appointment Completed",
        "Your appointment has been completed.",
        NotificationType.APPOINTMENT
        );

        return updatedAppointment;
    }


    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}