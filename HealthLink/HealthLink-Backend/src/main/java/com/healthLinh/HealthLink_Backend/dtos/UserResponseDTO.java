package com.healthLinh.HealthLink_Backend.dtos;

import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import lombok.Data;

@Data
public class UserResponseDTO {

    private Long id;
    private String fullName;
    private String email;

    private Role role;
    private UserStatus status;
}