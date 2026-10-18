package com.elevator.management.service;

import com.elevator.management.model.Elevator;
import com.elevator.management.model.Intervention;
import com.elevator.management.model.InterventionStatus;
import com.elevator.management.repository.ElevatorRepository;
import com.elevator.management.repository.InterventionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterventionServiceTest {

    @Mock
    private InterventionRepository interventionRepository;

    @Mock
    private ElevatorRepository elevatorRepository;

    @InjectMocks
    private InterventionService interventionService;

    @Test
    void updateTermineeSetsElevatorLastMaintenanceDateWhenLaterThanCurrent() {
        Elevator elevator = new Elevator();
        elevator.setId("elevator-1");
        elevator.setProjectId("project-1");
        elevator.setLastMaintenanceDate(LocalDate.of(2024, 1, 10));

        Intervention existing = new Intervention();
        existing.setId("intervention-1");
        existing.setElevatorId("elevator-1");
        existing.setTechnicianId("tech-1");
        existing.setDate(LocalDate.of(2024, 1, 1));
        existing.setStatus(InterventionStatus.EN_COURS);

        Intervention updated = new Intervention();
        updated.setElevatorId("elevator-1");
        updated.setTechnicianId("tech-1");
        updated.setDate(LocalDate.of(2024, 1, 15));
        updated.setStatus(InterventionStatus.TERMINEE);

        when(interventionRepository.findById("intervention-1")).thenReturn(Optional.of(existing));
        when(interventionRepository.save(existing)).thenReturn(existing);
        when(elevatorRepository.findById("elevator-1")).thenReturn(Optional.of(elevator));

        Intervention result = interventionService.update("intervention-1", updated);

        assertEquals(InterventionStatus.TERMINEE, result.getStatus());
        assertEquals(LocalDate.of(2024, 1, 15), elevator.getLastMaintenanceDate());
    }
}
