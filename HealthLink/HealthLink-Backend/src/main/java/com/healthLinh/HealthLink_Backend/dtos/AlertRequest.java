package com.healthLinh.HealthLink_Backend.dtos;

public class AlertRequest {

    private String message;

    // ALL_DOCTORS / ALL_NURSES / USER
    private String targetType;

    // optional لو USER
    private Long targetUserId;

    private String alertType;

    public AlertRequest() {}

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getAlertType() {
    return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }   
}