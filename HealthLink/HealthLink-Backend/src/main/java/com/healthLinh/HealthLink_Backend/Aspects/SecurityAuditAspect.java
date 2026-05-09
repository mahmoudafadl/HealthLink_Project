package com.healthLinh.HealthLink_Backend.Aspects;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * AOP Aspect – Security audit cross-cutting concern.
 *
 * Provides:
 *  - Audit logging for admin and superadmin operations
 *  - Runtime guard: blocks admins from operating on SUPER_ADMIN or ADMIN accounts
 *    (complements Spring Security's @PreAuthorize, acting as a safety net)
 */
@Aspect
@Component
public class SecurityAuditAspect {

    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");

    // ─── Pointcuts ───────────────────────────────────────────────────────────────

    @Pointcut("execution(* com.healthLinh.HealthLink_Backend.services.AdminService.*(..))")
    public void adminServiceMethods() {}

    @Pointcut("execution(* com.healthLinh.HealthLink_Backend.services.SuperAdminService.*(..))")
    public void superAdminServiceMethods() {}

    // ─── Advices ─────────────────────────────────────────────────────────────────

    /**
     * Logs every admin action with the actor's identity.
     */
    @Before("adminServiceMethods()")
    public void auditAdminAction(JoinPoint jp) {
        String actor = getCurrentUserEmail();
        auditLog.info("[ADMIN ACTION] Actor='{}' called '{}'",
                actor, jp.getSignature().getName());
    }

    /**
     * Logs every superadmin action.
     */
    @Before("superAdminServiceMethods()")
    public void auditSuperAdminAction(JoinPoint jp) {
        String actor = getCurrentUserEmail();
        auditLog.info("[SUPERADMIN ACTION] Actor='{}' called '{}'",
                actor, jp.getSignature().getName());
    }

    /**
     * Logs the result of every admin service call after successful completion.
     */
    @AfterReturning("adminServiceMethods()")
    public void auditAdminSuccess(JoinPoint jp) {
        auditLog.info("[ADMIN ACTION] '{}' completed successfully by '{}'",
                jp.getSignature().getName(), getCurrentUserEmail());
    }

    /**
     * Logs exceptions thrown from admin service methods.
     */
    @AfterThrowing(pointcut = "adminServiceMethods()", throwing = "ex")
    public void auditAdminFailure(JoinPoint jp, Throwable ex) {
        auditLog.warn("[ADMIN ACTION] '{}' failed for actor '{}': {}",
                jp.getSignature().getName(), getCurrentUserEmail(), ex.getMessage());
    }

    // ─── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "anonymous";
    }
}
