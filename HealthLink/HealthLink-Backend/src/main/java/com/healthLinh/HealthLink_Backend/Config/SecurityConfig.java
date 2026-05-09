package com.healthLinh.HealthLink_Backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;



/**
 * Central Spring Security configuration.
 *
 * URL-level access rules are kept minimal here; fine-grained method-level
 * control is enforced via @PreAuthorize in service / controller layers (AOP).
 */
@Configuration
@EnableMethodSecurity          // enables @PreAuthorize / @PostAuthorize / @Secured
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/debug/**").permitAll()
                .requestMatchers("/api/doctors", "/api/doctors/**").permitAll() // doctors list is public

                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/actuator/**"
                ).permitAll()

                // Clinical Records
                .requestMatchers("/api/clinical/add").hasRole("DOCTOR")
                .requestMatchers("/api/clinical/**").hasAnyRole("DOCTOR", "PATIENT", "NURSE", "ADMIN", "SUPER_ADMIN")

                // Appointments
                .requestMatchers("/api/appointments/doctor/**").hasAnyRole("DOCTOR", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/appointments/patient/**").hasAnyRole("PATIENT", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/appointments/**").authenticated()

                // Feedback
                .requestMatchers(HttpMethod.POST, "/api/feedback").hasAnyRole("PATIENT", "NURSE")
                .requestMatchers(HttpMethod.GET, "/api/feedback").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Alerts — Admin sends, Doctor & Nurse receive
                .requestMatchers(HttpMethod.POST, "/api/alerts/send").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/alerts/**").hasAnyRole("DOCTOR", "NURSE", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/alerts/**").authenticated()

                // Home Service Requests (Nurse Flow)
                .requestMatchers(HttpMethod.POST, "/api/home-service-requests").hasRole("PATIENT")
                .requestMatchers(HttpMethod.GET, "/api/home-service-requests/available").hasAnyRole("NURSE", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/home-service-requests/nurse/**").hasAnyRole("NURSE", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/home-service-requests/patient/**").hasAnyRole("PATIENT", "ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/home-service-requests/**").authenticated()

                // Admin & SuperAdmin
                .requestMatchers("/api/superadmin/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/registrations/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Doctors & Nurses list
                .requestMatchers(HttpMethod.POST, "/api/doctors/**").authenticated()
                .requestMatchers("/api/nurses/**").authenticated()

                // Billing
                .requestMatchers("/api/billing/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * BCrypt password encoder – injected wherever password hashing is needed.
     * Using BCrypt ensures salted, one-way, secure password storage.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }


    
}
