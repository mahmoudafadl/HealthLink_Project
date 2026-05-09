package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Entities.HomeServiceRequest;
import com.healthLinh.HealthLink_Backend.Enums.AppointmentStatus;
import com.healthLinh.HealthLink_Backend.services.HomeServiceRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/home-service-requests")
public class HomeServiceRequestController {

    private final HomeServiceRequestService service;

    public HomeServiceRequestController(HomeServiceRequestService service) {
        this.service = service;
    }

    @PostMapping
    public HomeServiceRequest createRequest(@RequestBody HomeServiceRequest request) {
        return service.createRequest(request);
    }

    @GetMapping("/patient/{patientId}")
    public List<HomeServiceRequest> getRequestsByPatient(@PathVariable Long patientId) {
        return service.getRequestsByPatient(patientId);
    }

    @GetMapping("/nurse/{id}")
    public List<HomeServiceRequest> getByNurse(@PathVariable Long id) {
        return service.getRequestsByNurse(id);
    }

    @GetMapping("/available")
    public List<HomeServiceRequest> getAvailable() {
        return service.getAvailableRequests();
    }

    @PutMapping("/{requestId}/accept/{nurseId}")
    public HomeServiceRequest accept(@PathVariable Long requestId, @PathVariable Long nurseId) {
        return service.acceptRequest(requestId, nurseId);
    }

    @PutMapping("/{requestId}/status")
    public HomeServiceRequest updateStatus(
            @PathVariable Long requestId,
            @RequestParam AppointmentStatus status) {
        return service.updateStatus(requestId, status);
    }
    @GetMapping("/all")
    public List<HomeServiceRequest> getAllRequests() { 
        return service.getAllRequests();
    }
}
