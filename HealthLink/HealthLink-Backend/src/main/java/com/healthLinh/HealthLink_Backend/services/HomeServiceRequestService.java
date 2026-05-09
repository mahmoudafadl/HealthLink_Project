package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.HomeServiceRequest;
import com.healthLinh.HealthLink_Backend.Entities.User;

import com.healthLinh.HealthLink_Backend.Enums.AppointmentStatus;
import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Enums.Role;

import com.healthLinh.HealthLink_Backend.Repositories.HomeServiceRequestRepository;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("null")
@Service
public class HomeServiceRequestService {

    private final HomeServiceRequestRepository repository;
    private final UserRepo userRepo;
    private final BillingService billingService;
    private final NotificationClientService notificationClientService;

    public HomeServiceRequestService(
            HomeServiceRequestRepository repository,
            UserRepo userRepo,
            BillingService billingService,
            NotificationClientService notificationClientService
    ) {
        this.repository = repository;
        this.userRepo = userRepo;
        this.billingService = billingService;
        this.notificationClientService = notificationClientService;
    }

    public HomeServiceRequest createRequest(
            HomeServiceRequest request
    ) {

        if (request.getPatient() == null ||
                request.getPatient().getId() == null) {

            throw new IllegalArgumentException(
                    "Patient information is required"
            );
        }

        Long patientId =
                request.getPatient().getId();

        User patient =
                userRepo.findById(patientId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Patient not found"
                                )
                        );

        request.setPatient(patient);

        if (request.getNurse() != null &&
                (request.getNurse().getId() == null ||
                        request.getNurse().getId() == 0)) {

            request.setNurse(null);
        }

        request.setStatus(
                AppointmentStatus.PENDING
        );

        request.setRequestedAt(
                LocalDateTime.now()
        );

        try {
            billingService.deduct(
                    patient.getEmail(),
                    150.0,
                    null
            );
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                    "Insufficient wallet balance for home service."
            );
        }

        HomeServiceRequest savedRequest =
                repository.save(request);

        // Patient notification
        notificationClientService.sendNotification(
                patient.getId(),
                "PATIENT",
                "Home Service Requested",
                "Your home service request has been submitted successfully.",
                NotificationType.HOME_SERVICE
        );

        // Notify all nurses
        List<User> nurses =
                userRepo.findByRole(
                        Role.NURSE
                );

        nurses.forEach(nurse ->
                notificationClientService.sendNotification(
                        nurse.getId(),
                        "NURSE",
                        "New Home Service Request",
                        "A patient requested home care service.",
                        NotificationType.HOME_SERVICE
                )
        );

        return savedRequest;
    }

    public List<HomeServiceRequest>
    getRequestsByPatient(Long patientId) {

        return repository.findByPatient_Id(
                patientId
        );
    }

    public List<HomeServiceRequest>
    getRequestsByNurse(Long nurseId) {

        return repository.findByNurse_Id(
                nurseId
        );
    }

    public List<HomeServiceRequest>
    getAvailableRequests() {

        return repository
                .findByNurseIsNullAndStatus(
                        AppointmentStatus.PENDING
                );
    }

    public HomeServiceRequest acceptRequest(
            @org.springframework.lang.NonNull Long requestId,
            @org.springframework.lang.NonNull Long nurseId
    ) {

        HomeServiceRequest request =
                repository.findById(requestId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Request not found"
                                )
                        );

        if (request.getNurse() != null) {
            throw new IllegalStateException(
                    "Request already assigned"
            );
        }

        User nurse =
                userRepo.findById(nurseId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Nurse not found"
                                )
                        );

        request.setNurse(nurse);

        request.setStatus(
                AppointmentStatus.APPROVED
        );

        request.setResolvedAt(
                LocalDateTime.now()
        );

        HomeServiceRequest savedRequest =
                repository.save(request);

        // Notify patient
        notificationClientService.sendNotification(
                request.getPatient().getId(),
                "PATIENT",
                "Nurse Assigned",
                "A nurse accepted your home service request.",
                NotificationType.HOME_SERVICE
        );

        return savedRequest;
    }

    public HomeServiceRequest updateStatus(
            @org.springframework.lang.NonNull Long requestId,
            AppointmentStatus status
    ) {

        HomeServiceRequest request =
                repository.findById(requestId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Request not found"
                                )
                        );

        AppointmentStatus oldStatus =
                request.getStatus();

        request.setStatus(status);

        if (status == AppointmentStatus.APPROVED ||
                status == AppointmentStatus.REJECTED ||
                status == AppointmentStatus.COMPLETED ||
                status == AppointmentStatus.CANCELLED) {

            request.setResolvedAt(
                    LocalDateTime.now()
            );
        }

        // Refund if rejected/cancelled
        if ((status == AppointmentStatus.REJECTED ||
                status == AppointmentStatus.CANCELLED) &&
                oldStatus != AppointmentStatus.REJECTED &&
                oldStatus != AppointmentStatus.CANCELLED) {

            billingService.refund(
                    request.getPatient().getEmail(),
                    150.0,
                    null
            );

            notificationClientService.sendNotification(
                    request.getPatient().getId(),
                    "PATIENT",
                    "Home Service Cancelled",
                    "Your payment has been refunded.",
                    NotificationType.HOME_SERVICE
            );
        }

        if (status == AppointmentStatus.COMPLETED) {

            notificationClientService.sendNotification(
                    request.getPatient().getId(),
                    "PATIENT",
                    "Home Service Completed",
                    "Your home service has been completed successfully.",
                    NotificationType.HOME_SERVICE
            );
        }

        return repository.save(request);
    }
        public List<HomeServiceRequest> getAllRequests() {
                return repository.findAll();
        }
}