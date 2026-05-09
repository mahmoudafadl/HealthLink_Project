package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.RegistrationRequest;
import com.healthLinh.HealthLink_Backend.Enums.ApprovalStatus;
import com.healthLinh.HealthLink_Backend.Enums.ApproverScope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {

    /** Find by the associated user id. */
    Optional<RegistrationRequest> findByUserId(Long userId);

    /** All pending requests that a given approver scope can see. */
    List<RegistrationRequest> findByApprovalStatusAndApproverScope(
            ApprovalStatus status, ApproverScope scope);

    /** All pending requests across all scopes (SuperAdmin full view). */
    List<RegistrationRequest> findByApprovalStatus(ApprovalStatus status);

    /** Pending requests visible to Admin: DOCTOR/NURSE scope only. */
    List<RegistrationRequest> findByApprovalStatusAndApproverScopeIn(
            ApprovalStatus status, List<ApproverScope> scopes);
        
    // delete linked request before deleting user
    void deleteByUserId(Long userId);
    
}
