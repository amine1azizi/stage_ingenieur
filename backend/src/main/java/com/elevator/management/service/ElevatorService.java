package com.elevator.management.service;

import com.elevator.management.dto.ElevatorMaintenanceStatusDto;
import com.elevator.management.model.Elevator;
import com.elevator.management.model.ElevatorStatus;
import com.elevator.management.repository.ElevatorRepository;
import com.elevator.management.repository.InterventionRepository;
import com.elevator.management.repository.MaintenanceRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ElevatorService {

    private final ElevatorRepository elevatorRepository;
    private final InterventionRepository interventionRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public ElevatorService(
            ElevatorRepository elevatorRepository,
            InterventionRepository interventionRepository,
            MaintenanceRequestRepository maintenanceRequestRepository
    ) {
        this.elevatorRepository = elevatorRepository;
        this.interventionRepository = interventionRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    public List<Elevator> findAll() {
        return elevatorRepository.findAll();
    }

    public Elevator findById(String id) {
        return elevatorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Elevator not found"));
    }

    public Elevator create(Elevator elevator) {
        elevator.setId(null);
        return elevatorRepository.save(elevator);
    }

    public Elevator update(String id, Elevator elevator) {
        Elevator existing = findById(id);
        existing.setReference(elevator.getReference());
        existing.setModel(elevator.getModel());
        existing.setCapacity(elevator.getCapacity());
        existing.setNumberOfFloors(elevator.getNumberOfFloors());
        existing.setStatus(elevator.getStatus());
        existing.setProjectId(elevator.getProjectId());
        existing.setLastMaintenanceDate(elevator.getLastMaintenanceDate());
        existing.setMaintenanceIntervalDays(elevator.getMaintenanceIntervalDays());
        return elevatorRepository.save(existing);
    }

    public List<ElevatorMaintenanceStatusDto> getMaintenanceStatus() {
        LocalDate today = LocalDate.now();
        return elevatorRepository.findAll().stream()
                .filter(elevator -> elevator.getStatus() != ElevatorStatus.HORS_SERVICE)
                .map(elevator -> toMaintenanceStatusDto(elevator, today))
                .toList();
    }

    private ElevatorMaintenanceStatusDto toMaintenanceStatusDto(Elevator elevator, LocalDate today) {
        Integer intervalDays = elevator.getMaintenanceIntervalDays() == null ? 90 : elevator.getMaintenanceIntervalDays();
        LocalDate lastMaintenanceDate = elevator.getLastMaintenanceDate();
        LocalDate nextMaintenanceDate = lastMaintenanceDate == null ? today : lastMaintenanceDate.plusDays(intervalDays);
        String maintenanceState = determineMaintenanceState(today, nextMaintenanceDate);

        return new ElevatorMaintenanceStatusDto(
                elevator.getId(),
                elevator.getReference(),
                elevator.getProjectId(),
                lastMaintenanceDate,
                nextMaintenanceDate,
                maintenanceState
        );
    }

    private String determineMaintenanceState(LocalDate today, LocalDate nextMaintenanceDate) {
        if (nextMaintenanceDate.isBefore(today)) {
            return "OVERDUE";
        }
        if (!nextMaintenanceDate.isAfter(today.plusDays(14))) {
            return "DUE_SOON";
        }
        return "OK";
    }

    public void delete(String id) {
        Elevator existing = findById(id);
        delete(existing);
    }

    public void deleteByProjectId(String projectId) {
        elevatorRepository.findAllByProjectId(projectId).forEach(this::delete);
    }

    private void delete(Elevator elevator) {
        interventionRepository.deleteAllByElevatorId(elevator.getId());
        maintenanceRequestRepository.deleteAllByElevatorId(elevator.getId());
        elevatorRepository.delete(elevator);
    }
}
