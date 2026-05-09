package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.DoctorProfile;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    // لو الـ status جوه User
    List<DoctorProfile> findByUser_Status(UserStatus status);

    Optional<DoctorProfile> findByUserId(Long userId);
}