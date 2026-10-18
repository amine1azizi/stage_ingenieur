package com.elevator.management.service;

import com.elevator.management.model.Project;
import com.elevator.management.model.ProjectStatus;
import com.elevator.management.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ElevatorService elevatorService;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void deleteRemovesChildElevatorsBeforeProject() {
        Project project = new Project();
        project.setId("project-1");
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));

        projectService.delete("project-1");

        InOrder order = inOrder(elevatorService, projectRepository);
        order.verify(elevatorService).deleteByProjectId("project-1");
        order.verify(projectRepository).delete(project);
    }

    @Test
    void updateCopiesLatitudeAndLongitude() {
        Project existing = new Project();
        existing.setId("project-1");
        Project changes = new Project();
        changes.setName("Updated project");
        changes.setClientId("client-1");
        changes.setStatus(ProjectStatus.PLANIFIE);
        changes.setLatitude(35.8256);
        changes.setLongitude(10.6084);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(existing));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Project updated = projectService.update("project-1", changes);

        assertEquals(35.8256, updated.getLatitude());
        assertEquals(10.6084, updated.getLongitude());
        verify(projectRepository).save(existing);
    }
}
