package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.DoctorProfile;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import com.healthLinh.HealthLink_Backend.Repositories.DoctorProfileRepository;
import com.healthLinh.HealthLink_Backend.dtos.DoctorDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorProfileRepository doctorRepo;
    private final com.healthLinh.HealthLink_Backend.Repositories.AppointmentRepository appointmentRepo;

    public DoctorService(DoctorProfileRepository doctorRepo, com.healthLinh.HealthLink_Backend.Repositories.AppointmentRepository appointmentRepo) {
        this.doctorRepo = doctorRepo;
        this.appointmentRepo = appointmentRepo;
    }

    // 👨‍⚕️ Get ONLY ACTIVE doctors
    public List<DoctorDTO> getDoctors() {

        return doctorRepo.findByUser_Status(UserStatus.ACTIVE)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctor(Long id) {
        if (id == null) throw new IllegalArgumentException("Doctor ID cannot be null");

        DoctorProfile doc = doctorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return mapToDTO(doc);
    }

    public DoctorDTO rateDoctor(Long id, double rate) {

        if (rate < 1 || rate > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        if (id == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        DoctorProfile doctor = doctorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        int count = doctor.getRatingCount();
        double currentAvg = doctor.getRating();

        double newAvg =
                ((currentAvg * count) + rate) / (count + 1);

        doctor.setRating(newAvg);
        doctor.setRatingCount(count + 1);

        DoctorProfile saved = doctorRepo.save(doctor);

        return mapToDTO(saved);
    }   

    public List<com.healthLinh.HealthLink_Backend.dtos.PatientDTO> getDoctorPatients(Long id) {
        // Handle case where id might be DoctorProfile id instead of User id
        Long userId = id;
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        java.util.Optional<DoctorProfile> profile = doctorRepo.findById(id);
        if (profile.isPresent()) {
            userId = profile.get().getUser().getId();
        }

        List<com.healthLinh.HealthLink_Backend.Entities.Appointment> appointments = appointmentRepo.findByDoctor_Id(userId);
        
        // Get unique patients
        return appointments.stream()
                .map(com.healthLinh.HealthLink_Backend.Entities.Appointment::getPatient)
                .distinct()
                .map(patient -> {
                    com.healthLinh.HealthLink_Backend.dtos.PatientDTO dto = new com.healthLinh.HealthLink_Backend.dtos.PatientDTO();
                    dto.setId(patient.getId());
                    dto.setName(patient.getFullName());
                    dto.setAge(25); // Placeholder, age not in User entity
                    dto.setCondition("General"); // Placeholder
                    
                    // Find last and next appointment
                    java.time.LocalDate today = java.time.LocalDate.now();
                    appointments.stream()
                            .filter(a -> a.getPatient().getId().equals(patient.getId()))
                            .filter(a -> a.getAppointmentDate().isBefore(today))
                            .max(java.util.Comparator.comparing(com.healthLinh.HealthLink_Backend.Entities.Appointment::getAppointmentDate))
                            .ifPresent(a -> dto.setLastVisit(a.getAppointmentDate().toString()));
                            
                    appointments.stream()
                            .filter(a -> a.getPatient().getId().equals(patient.getId()))
                            .filter(a -> a.getAppointmentDate().isAfter(today.minusDays(1)))
                            .min(java.util.Comparator.comparing(com.healthLinh.HealthLink_Backend.Entities.Appointment::getAppointmentDate))
                            .ifPresent(a -> dto.setNextAppointment(a.getAppointmentDate().toString()));
                            
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private DoctorDTO mapToDTO(DoctorProfile doc) {
        DoctorDTO dto = new DoctorDTO();

        dto.setId(doc.getId());
        dto.setUserId(doc.getUser().getId());   // ← User's actual ID for bookings
        dto.setFullName(doc.getUser().getFullName());
        dto.setEmail(doc.getUser().getEmail());
        dto.setSpecialization(doc.getSpecialization());
        dto.setExperienceYears(doc.getExperienceYears());
        dto.setRating(doc.getRating());

        return dto;
    }
}