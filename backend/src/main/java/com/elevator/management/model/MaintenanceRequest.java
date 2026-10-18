package com.elevator.management.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "maintenance_requests")
public class MaintenanceRequest {

    @Id
    private String id;
    private String clientId;
    private String elevatorId;
    private String description;
    private MaintenanceRequestStatus status;
    private Instant createdAt;

    public MaintenanceRequest() {
    }

    public MaintenanceRequest(String clientId, String elevatorId, String description) {
        this.clientId = clientId;
        this.elevatorId = elevatorId;
        this.description = description;
        this.status = MaintenanceRequestStatus.REQUESTED;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getClientId() {
        return clientId;
    }

    public String getElevatorId() {
        return elevatorId;
    }

    public String getDescription() {
        return description;
    }

    public MaintenanceRequestStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setStatus(MaintenanceRequestStatus status) {
        this.status = status;
    }
}
