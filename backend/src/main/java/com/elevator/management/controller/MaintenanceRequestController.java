package com.elevator.management.controller;

import com.elevator.management.model.MaintenanceRequest;
import com.elevator.management.model.MaintenanceRequestStatus;
import com.elevator.management.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance-requests")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    public MaintenanceRequestController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }

    @GetMapping
    public List<MaintenanceRequest> getAll() {
        return maintenanceRequestService.findAllRequests();
    }

    @PutMapping("/{id}/status")
    public MaintenanceRequest updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return maintenanceRequestService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        maintenanceRequestService.deleteRequest(id);
    }

    public record UpdateStatusRequest(@NotNull MaintenanceRequestStatus status) {
    }
}
