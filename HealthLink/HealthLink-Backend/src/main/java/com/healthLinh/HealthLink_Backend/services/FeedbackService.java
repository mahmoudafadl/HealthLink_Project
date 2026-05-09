package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.DoctorProfile;
import com.healthLinh.HealthLink_Backend.Entities.Feedback;
import com.healthLinh.HealthLink_Backend.Entities.User;

import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Repositories.DoctorProfileRepository;
import com.healthLinh.HealthLink_Backend.Repositories.FeedbackRepository;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;

import org.springframework.stereotype.Service;

import java.util.List;

@SuppressWarnings("null")
@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepo userRepo;
    private final NotificationClientService notificationClientService;
    private final DoctorProfileRepository doctorRepo;

    public FeedbackService(
        FeedbackRepository feedbackRepository,
        UserRepo userRepo,
        NotificationClientService notificationClientService,
        DoctorProfileRepository doctorRepo
    ) {
       this.feedbackRepository = feedbackRepository;
       this.userRepo = userRepo;
       this.notificationClientService = notificationClientService;
       this.doctorRepo = doctorRepo;
   }

    public Feedback submitFeedback(
        @org.springframework.lang.NonNull Feedback feedback
) {

    Feedback savedFeedback =
            feedbackRepository.save(
                    feedback
            );

    // Update doctor rating automatically
  if (feedback.getDoctor() != null) {

        DoctorProfile doctor =
                doctorRepo.findById(
                        feedback.getDoctor().getId()
                ).orElseThrow(() ->
                        new RuntimeException("Doctor not found")
                );

        int count = doctor.getRatingCount();
        double currentAvg = doctor.getRating();

        double newAvg =
                ((currentAvg * count) + feedback.getRating())
                        / (count + 1);

        doctor.setRating(newAvg);
        doctor.setRatingCount(count + 1);

        doctorRepo.save(doctor);
    }

    // Patient confirmation
    notificationClientService.sendNotification(
            feedback.getPatient().getId(),
            "PATIENT",
            "Feedback Submitted",
            "Thank you for your feedback.",
            NotificationType.FEEDBACK
    );

    // Admin notifications
    List<User> admins =
            userRepo.findByRole(
                    Role.ADMIN
            );

    List<User> superAdmins =
            userRepo.findByRole(
                    Role.SUPER_ADMIN
            );

    admins.forEach(admin ->
            notificationClientService.sendNotification(
                    admin.getId(),
                    "ADMIN",
                    "New Patient Feedback",
                    "A patient submitted new feedback.",
                    NotificationType.FEEDBACK
            )
    );

    superAdmins.forEach(superAdmin ->
            notificationClientService.sendNotification(
                    superAdmin.getId(),
                    "SUPER_ADMIN",
                    "New Patient Feedback",
                    "A patient submitted new feedback.",
                    NotificationType.FEEDBACK
            )
    );

    return savedFeedback;
 }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
    public List<Feedback> getPatientFeedback(
        Long patientId
    ) {

        return feedbackRepository
            .findByPatientIdOrderByCreatedAtDesc(
                    patientId
            );
    }
}