package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Config.JwtUtil;
import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import com.healthLinh.HealthLink_Backend.dtos.AuthResponseDTO;
import com.healthLinh.HealthLink_Backend.dtos.LoginRequestDTO;
import com.healthLinh.HealthLink_Backend.dtos.RegisterRequestDTO;
import com.healthLinh.HealthLink_Backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    // ─── Register ─────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody @Valid RegisterRequestDTO dto) {
        User user = authService.register(dto);

        // PATIENT accounts are immediately ACTIVE → issue JWT.
        // All other roles are PENDING → no JWT is issued; the client must wait
        // for approval before attempting to log in.
        if (user.getStatus() == UserStatus.ACTIVE) {
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return AuthResponseDTO.authenticated(token, user);
        }

        // Describe who will approve based on role
        String approvalNote = switch (user.getRole()) {
            case ADMIN  -> "Your Admin registration is pending SuperAdmin approval.";
            case DOCTOR -> "Your Doctor registration is pending Admin or SuperAdmin approval.";
            case NURSE  -> "Your Nurse registration is pending Admin or SuperAdmin approval.";
            default     -> "Your account is pending approval.";
        };

        return AuthResponseDTO.pendingApproval(user, approvalNote);
    }

    // ─── Login ────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO dto) {
        User user = authService.login(dto.getEmail(), dto.getPassword());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponseDTO(token, user);
    }
}
