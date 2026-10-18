package com.elevator.management.dto;

import java.time.LocalDate;

public class ElevatorMaintenanceStatusDto {
    private String id;
    private String reference;
    private String projectId;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDate;
    private String maintenanceState;

    public ElevatorMaintenanceStatusDto() {
    }

    public ElevatorMaintenanceStatusDto(String id, String reference, String projectId,
                                       LocalDate lastMaintenanceDate, LocalDate nextMaintenanceDate,
                                       String maintenanceState) {
        this.id = id;
        this.reference = reference;
        this.projectId = projectId;
        this.lastMaintenanceDate = lastMaintenanceDate;
        this.nextMaintenanceDate = nextMaintenanceDate;
        this.maintenanceState = maintenanceState;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public LocalDate getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public void setLastMaintenanceDate(LocalDate lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public LocalDate getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }

    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
    }

    public String getMaintenanceState() {
        return maintenanceState;
    }

    public void setMaintenanceState(String maintenanceState) {
        this.maintenanceState = maintenanceState;
    }
}
