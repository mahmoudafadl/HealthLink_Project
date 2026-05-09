package com.healthLinh.HealthLink_Backend.Aspects;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import com.healthLinh.HealthLink_Backend.services.ActivityLogService;
/**
 * AOP Aspect – Logging cross-cutting concern.
 *
 * Automatically logs:
 *  - Entry and exit of every service method (with execution time)
 *  - Exceptions thrown from any service method
 *  - Auth events (login / register) at a dedicated logger
 */
@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);
    private static final Logger authLog = LoggerFactory.getLogger("AUTH_AUDIT");
    private final ActivityLogService activityLogService;

    public LoggingAspect(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    // ─── Pointcuts ───────────────────────────────────────────────────────────────

    /** All service layer methods */
    @Pointcut("within(com.healthLinh.HealthLink_Backend.services..*)")
    public void serviceLayer() {}

    /** Auth service methods specifically */
    @Pointcut("execution(* com.healthLinh.HealthLink_Backend.services.AuthService.*(..))")
    public void authServiceMethods() {}

    /** All controller layer methods */
    @Pointcut("within(com.healthLinh.HealthLink_Backend.Controllers..*)")
    public void controllerLayer() {}

    // ─── Advices ─────────────────────────────────────────────────────────────────

    /**
     * Around advice – measures and logs execution time of every service method.
     */
    @Around("serviceLayer()")
    public Object logServiceExecution(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.debug("[SERVICE] {} completed in {} ms", methodName, elapsed);
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;
            log.warn("[SERVICE] {} threw {} after {} ms: {}",
                    methodName, ex.getClass().getSimpleName(), elapsed, ex.getMessage());
            throw ex;
        }
    }

    /**
     * Before advice – logs every incoming controller call.
     */
    @Before("controllerLayer()")
    public void logControllerEntry(JoinPoint jp) {
        log.info("[CONTROLLER] Invoked: {}", jp.getSignature().toShortString());
    }

    /**
     * After returning advice – logs successful auth events (login / register).
     */
    @AfterReturning(pointcut = "authServiceMethods()", returning = "result")
    public void logAuthSuccess(JoinPoint jp, Object result) {
        authLog.info("[AUTH] {} succeeded. Result type: {}",
                jp.getSignature().getName(),
                result != null ? result.getClass().getSimpleName() : "null");
    }

    /**
     * After throwing advice – logs failed auth attempts.
     */
    @AfterThrowing(pointcut = "authServiceMethods()", throwing = "ex")
    public void logAuthFailure(JoinPoint jp, Throwable ex) {
        authLog.warn("[AUTH] {} failed: {}", jp.getSignature().getName(), ex.getMessage());
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.AppointmentService.createAppointment(..))")
    public void logAppointmentCreation(JoinPoint joinPoint) {
        logActionToDB("Create Appointment", "Patient booked a new appointment.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.HomeServiceRequestService.createRequest(..))")
    public void logHomeServiceRequest(JoinPoint joinPoint) {
        logActionToDB("Request Home Service", "Patient requested a new home service.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.ClinicalService.addRecord(..))")
    public void logClinicalRecord(JoinPoint joinPoint) {
        logActionToDB("Add Clinical Record", "Doctor added a new clinical record.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.FeedbackService.submitFeedback(..))")
    public void logFeedback(JoinPoint joinPoint) {
        logActionToDB("Submit Feedback", "Patient submitted feedback.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.HomeServiceRequestService.acceptRequest(..))")
    public void logNurseAcceptance(JoinPoint joinPoint) {
        logActionToDB("Accept Home Service", "Nurse accepted a home service request.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.BillingService.topUp(..))")
    public void logTopUp(JoinPoint joinPoint) {
        logActionToDB("Wallet Top-Up", "User topped up their wallet.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.BillingService.deduct(..))")
    public void logDeduction(JoinPoint joinPoint) {
        logActionToDB("Wallet Deduction", "Wallet balance was deducted for a service.");
    }

    @AfterReturning(pointcut = "execution(* com.healthLinh.HealthLink_Backend.services.AlertService.sendAlert(..))")
    public void logAlertSent(JoinPoint joinPoint) {
        logActionToDB("Send Alert", "Admin sent an alert to a doctor.");
    }

    private void logActionToDB(String action, String details) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                String email = auth.getName();
                String role = auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .findFirst()
                        .orElse("UNKNOWN");
                activityLogService.logActivity(email, role, action, details);
            }
        } catch (Exception e) {
            log.error("Failed to save activity log to database", e);
        }
    }
}
