package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Entities.Feedback;
import com.healthLinh.HealthLink_Backend.services.FeedbackService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(
            FeedbackService feedbackService
    ) {
        this.feedbackService =
                feedbackService;
    }

    @PostMapping
    public Feedback submitFeedback(
            @RequestBody Feedback feedback
    ) {

        return feedbackService
                .submitFeedback(
                        feedback
                );
    }

    @GetMapping
    public List<Feedback> getAllFeedback() {

        return feedbackService
                .getAllFeedback();
    }

    // ===============================
    // Patient reviews only
    // ===============================
    @GetMapping("/patient/{patientId}")
    public List<Feedback> getPatientFeedback(
            @PathVariable Long patientId
    ) {

        return feedbackService
                .getPatientFeedback(
                        patientId
                );
    }

}