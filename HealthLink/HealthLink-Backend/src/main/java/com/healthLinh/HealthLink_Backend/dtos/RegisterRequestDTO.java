package com.healthLinh.HealthLink_Backend.dtos;

import com.healthLinh.HealthLink_Backend.Enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$",
        message = "Email must be a valid Gmail address"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).{6,}$",
        message = "Password must contain letters and numbers and be at least 6 characters"
    )
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // 👇 مهمين للدكتور فقط
    private String specialization;
    private Integer experienceYears;
}