package com.elevator.management.service;

import com.elevator.management.model.Elevator;
import com.elevator.management.model.Intervention;
import com.elevator.management.model.InterventionStatus;
import com.elevator.management.repository.ElevatorRepository;
import com.elevator.management.repository.InterventionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final ElevatorRepository elevatorRepository;

    public InterventionService(InterventionRepository interventionRepository, ElevatorRepository elevatorRepository) {
        this.interventionRepository = interventionRepository;
        this.elevatorRepository = elevatorRepository;
    }

    public List<Intervention> findAll() {
        return interventionRepository.findAll();
    }

    public Intervention findById(String id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intervention not found"));
    }

    public Intervention create(Intervention intervention) {
        intervention.setId(null);
        Intervention saved = interventionRepository.save(intervention);
        updateElevatorMaintenanceDateIfTerminated(saved);
        return saved;
    }

    public Intervention update(String id, Intervention intervention) {
        Intervention existing = findById(id);
        existing.setElevatorId(intervention.getElevatorId());
        existing.setTechnicianId(intervention.getTechnicianId());
        existing.setType(intervention.getType());
        existing.setDescription(intervention.getDescription());
        existing.setDate(intervention.getDate());
        existing.setStatus(intervention.getStatus());
        Intervention saved = interventionRepository.save(existing);
        updateElevatorMaintenanceDateIfTerminated(saved);
        return saved;
    }

    private void updateElevatorMaintenanceDateIfTerminated(Intervention intervention) {
        if (intervention.getStatus() != InterventionStatus.TERMINEE || intervention.getDate() == null) {
            return;
        }

        Elevator elevator = elevatorRepository.findById(intervention.getElevatorId())
                .orElse(null);
        if (elevator == null) {
            return;
        }

        LocalDate currentDate = elevator.getLastMaintenanceDate();
        if (currentDate == null || intervention.getDate().isAfter(currentDate)) {
            elevator.setLastMaintenanceDate(intervention.getDate());
            elevatorRepository.save(elevator);
        }
    }

    public void delete(String id) {
        Intervention existing = findById(id);
        interventionRepository.delete(existing);
    }
}
