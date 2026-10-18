package com.elevator.management.service;

import com.elevator.management.dto.ElevatorMaintenanceStatusDto;
import com.elevator.management.model.Elevator;
import com.elevator.management.model.ElevatorStatus;
import com.elevator.management.repository.ElevatorRepository;
import com.elevator.management.repository.InterventionRepository;
import com.elevator.management.repository.MaintenanceRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ElevatorServiceTest {

    @Mock
    private ElevatorRepository elevatorRepository;

    @Mock
    private InterventionRepository interventionRepository;

    @Mock
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @InjectMocks
    private ElevatorService elevatorService;

    @Test
    void deleteRemovesInterventionsBeforeElevator() {
        Elevator elevator = elevator("elevator-1", "project-1");
        when(elevatorRepository.findById("elevator-1")).thenReturn(Optional.of(elevator));

        elevatorService.delete("elevator-1");

        InOrder order = inOrder(interventionRepository, elevatorRepository);
        order.verify(interventionRepository).deleteAllByElevatorId("elevator-1");
        order.verify(elevatorRepository).delete(elevator);
    }

    @Test
    void deleteByProjectRemovesEachElevatorAndItsInterventions() {
        Elevator elevator = elevator("elevator-1", "project-1");
        when(elevatorRepository.findAllByProjectId("project-1")).thenReturn(List.of(elevator));

        elevatorService.deleteByProjectId("project-1");

        verify(interventionRepository).deleteAllByElevatorId("elevator-1");
        verify(elevatorRepository).delete(elevator);
    }

    @Test
    void maintenanceStatusMarksElevatorOverdueWhenDeadlinePassed() {
        Elevator elevator = elevator("elevator-1", "project-1");
        elevator.setStatus(ElevatorStatus.INSTALLE);
        elevator.setLastMaintenanceDate(LocalDate.now().minusDays(20));
        elevator.setMaintenanceIntervalDays(14);
        when(elevatorRepository.findAll()).thenReturn(List.of(elevator));

        List<ElevatorMaintenanceStatusDto> status = elevatorService.getMaintenanceStatus();

        assertEquals(1, status.size());
        assertEquals("OVERDUE", status.get(0).getMaintenanceState());
        assertEquals(LocalDate.now().minusDays(20).plusDays(14), status.get(0).getNextMaintenanceDate());
    }

    @Test
    void maintenanceStatusMarksElevatorDueSoonWhenDeadlineIsWithinNextTwoWeeks() {
        Elevator elevator = elevator("elevator-1", "project-1");
        elevator.setStatus(ElevatorStatus.INSTALLE);
        elevator.setLastMaintenanceDate(LocalDate.now().minusDays(7));
        elevator.setMaintenanceIntervalDays(14);
        when(elevatorRepository.findAll()).thenReturn(List.of(elevator));

        List<ElevatorMaintenanceStatusDto> status = elevatorService.getMaintenanceStatus();

        assertEquals(1, status.size());
        assertEquals("DUE_SOON", status.get(0).getMaintenanceState());
        assertEquals(LocalDate.now().plusDays(7), status.get(0).getNextMaintenanceDate());
    }

    @Test
    void maintenanceStatusMarksElevatorOkWhenDeadlineIsFurtherAway() {
        Elevator elevator = elevator("elevator-1", "project-1");
        elevator.setStatus(ElevatorStatus.INSTALLE);
        elevator.setLastMaintenanceDate(LocalDate.now().minusDays(7));
        elevator.setMaintenanceIntervalDays(30);
        when(elevatorRepository.findAll()).thenReturn(List.of(elevator));

        List<ElevatorMaintenanceStatusDto> status = elevatorService.getMaintenanceStatus();

        assertEquals(1, status.size());
        assertEquals("OK", status.get(0).getMaintenanceState());
        assertEquals(LocalDate.now().plusDays(23), status.get(0).getNextMaintenanceDate());
    }

    @Test
    void maintenanceStatusUsesTodayForNullLastMaintenanceDate() {
        Elevator elevator = elevator("elevator-1", "project-1");
        elevator.setStatus(ElevatorStatus.INSTALLE);
        elevator.setLastMaintenanceDate(null);
        elevator.setMaintenanceIntervalDays(null);
        when(elevatorRepository.findAll()).thenReturn(List.of(elevator));

        List<ElevatorMaintenanceStatusDto> status = elevatorService.getMaintenanceStatus();

        assertEquals(1, status.size());
        assertEquals(LocalDate.now(), status.get(0).getNextMaintenanceDate());
        assertEquals("DUE_SOON", status.get(0).getMaintenanceState());
    }

    @Test
    void maintenanceStatusSkipsHorsServiceElevators() {
        Elevator elevator = elevator("elevator-1", "project-1");
        elevator.setStatus(ElevatorStatus.HORS_SERVICE);
        when(elevatorRepository.findAll()).thenReturn(List.of(elevator));

        List<ElevatorMaintenanceStatusDto> status = elevatorService.getMaintenanceStatus();

        assertEquals(0, status.size());
    }

    private Elevator elevator(String id, String projectId) {
        Elevator elevator = new Elevator();
        elevator.setId(id);
        elevator.setProjectId(projectId);
        elevator.setStatus(ElevatorStatus.INSTALLE);
        return elevator;
    }
}
