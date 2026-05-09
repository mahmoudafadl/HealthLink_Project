package com.healthLinh.HealthLink_Backend.Aspects;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

@Aspect
@Component
public class BillingAuditAspect {

    private static final Logger billingLog =
            LoggerFactory.getLogger("BILLING_AUDIT");

    @Pointcut("execution(* com.healthLinh.HealthLink_Backend.services.BillingService.*(..))")
    public void billingMethods() {}

    @Before("billingMethods()")
    public void beforeBilling(JoinPoint jp) {

        String user = getCurrentUser();
        String ip = getClientIP();
        String traceId = getTraceId();

        Object[] args = jp.getArgs();

        Double amount = extractAmount(args);

        if (amount != null && amount > 5000) {
            billingLog.warn("[FRAUD WARNING] High amount detected: {} by user={}", amount, user);
        }

        billingLog.info(
                "[BILLING-START] traceId={} user={} ip={} method={} args={}",
                traceId,
                user,
                ip,
                jp.getSignature().getName(),
                Arrays.toString(args)
        );
    }

    @AfterReturning(pointcut = "billingMethods()", returning = "result")
    public void afterSuccess(JoinPoint jp, Object result) {

        String user = getCurrentUser();
        String traceId = getTraceId();

        billingLog.info(
                "[BILLING-SUCCESS] traceId={} user={} method={} result={}",
                traceId,
                user,
                jp.getSignature().getName(),
                result
        );
    }

    @AfterThrowing(pointcut = "billingMethods()", throwing = "ex")
    public void afterFailure(JoinPoint jp, Throwable ex) {

        String user = getCurrentUser();
        String traceId = getTraceId();

        billingLog.warn(
                "[BILLING-FAIL] traceId={} user={} method={} reason={}",
                traceId,
                user,
                jp.getSignature().getName(),
                ex.getMessage()
        );
    }


    private String getCurrentUser() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? auth.getName() : "anonymous";
    }

    private String getClientIP() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attrs == null) return "unknown";

            HttpServletRequest request = attrs.getRequest();

            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty()) {
                ip = request.getRemoteAddr();
            }
            return ip;
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String getTraceId() {
        return String.valueOf(Thread.currentThread().getId());
    }

    private Double extractAmount(Object[] args) {
        if (args == null) return null;

        for (Object arg : args) {
            try {
                var field = arg.getClass().getMethod("amount");
                Object value = field.invoke(arg);
                if (value instanceof Double d) return d;
            } catch (Exception ignored) {}
        }
        return null;
    }
}