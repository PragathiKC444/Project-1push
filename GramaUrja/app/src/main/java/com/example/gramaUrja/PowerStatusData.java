package com.example.gramaUrja;

public class PowerStatusData {
    private boolean status;
    private long timestamp;
    private String updatedBy;

    public PowerStatusData() {
        // Default constructor required for Firebase
    }

    public PowerStatusData(boolean status, long timestamp, String updatedBy) {
        this.status = status;
        this.timestamp = timestamp;
        this.updatedBy = updatedBy;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}