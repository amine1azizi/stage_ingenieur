package com.elevator.management.controller;

import com.elevator.management.model.Elevator;
import com.elevator.management.model.MaintenanceRequest;
import com.elevator.management.service.MaintenanceRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portal")
public class ClientPortalController {

    private final MaintenanceRequestService maintenanceRequestService;

    public ClientPortalController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }

    @GetMapping("/elevators")
    public List<Elevator> getElevators(@AuthenticationPrincipal Jwt jwt) {
        return maintenanceRequestService.findClientElevators(clientId(jwt));
    }

    @GetMapping("/requests")
    public List<MaintenanceRequest> getRequests(@AuthenticationPrincipal Jwt jwt) {
        return maintenanceRequestService.findClientRequests(clientId(jwt));
    }

    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public MaintenanceRequest createRequest(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateRequest request
    ) {
        return maintenanceRequestService.createRequest(clientId(jwt), request.elevatorId(), request.description());
    }

    private String clientId(Jwt jwt) {
        return jwt.getClaimAsString("clientId");
    }

    public record CreateRequest(
            @NotBlank String elevatorId,
            @NotBlank @Size(max = 2000) String description
    ) {
    }
}
