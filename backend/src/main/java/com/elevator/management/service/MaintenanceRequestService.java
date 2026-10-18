package com.elevator.management.service;

import com.elevator.management.model.Elevator;
import com.elevator.management.model.MaintenanceRequest;
import com.elevator.management.model.MaintenanceRequestStatus;
import com.elevator.management.model.Project;
import com.elevator.management.repository.ElevatorRepository;
import com.elevator.management.repository.MaintenanceRequestRepository;
import com.elevator.management.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MaintenanceRequestService {

    private final ProjectRepository projectRepository;
    private final ElevatorRepository elevatorRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public MaintenanceRequestService(
            ProjectRepository projectRepository,
            ElevatorRepository elevatorRepository,
            MaintenanceRequestRepository maintenanceRequestRepository
    ) {
        this.projectRepository = projectRepository;
        this.elevatorRepository = elevatorRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    public List<Elevator> findClientElevators(String clientId) {
        List<String> projectIds = projectRepository.findAllByClientId(clientId).stream()
                .map(Project::getId)
                .toList();
        if (projectIds.isEmpty()) {
            return List.of();
        }
        return elevatorRepository.findAllByProjectIdIn(projectIds);
    }

    public List<MaintenanceRequest> findClientRequests(String clientId) {
        return maintenanceRequestRepository.findAllByClientIdOrderByCreatedAtDesc(clientId);
    }

    public MaintenanceRequest createRequest(String clientId, String elevatorId, String description) {
        List<String> projectIds = projectRepository.findAllByClientId(clientId).stream()
                .map(Project::getId)
                .toList();
        if (projectIds.isEmpty() || elevatorRepository.findByIdAndProjectIdIn(elevatorId, projectIds).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Elevator not found for this client.");
        }
        return maintenanceRequestRepository.save(new MaintenanceRequest(clientId, elevatorId, description.trim()));
    }

    public List<MaintenanceRequest> findAllRequests() {
        return maintenanceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public MaintenanceRequest updateStatus(String id, MaintenanceRequestStatus status) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance request not found."));
        request.setStatus(status);
        return maintenanceRequestRepository.save(request);
    }

    public void deleteRequest(String id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance request not found."));
        maintenanceRequestRepository.delete(request);
    }
}
