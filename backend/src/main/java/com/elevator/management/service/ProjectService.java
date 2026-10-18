package com.elevator.management.service;

import com.elevator.management.model.Project;
import com.elevator.management.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ElevatorService elevatorService;

    public ProjectService(ProjectRepository projectRepository, ElevatorService elevatorService) {
        this.projectRepository = projectRepository;
        this.elevatorService = elevatorService;
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Project findById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    public Project create(Project project) {
        project.setId(null);
        return projectRepository.save(project);
    }

    public Project update(String id, Project project) {
        Project existing = findById(id);
        existing.setName(project.getName());
        existing.setAddress(project.getAddress());
        existing.setClientId(project.getClientId());
        existing.setStatus(project.getStatus());
        existing.setNumberOfElevators(project.getNumberOfElevators());
        existing.setLatitude(project.getLatitude());
        existing.setLongitude(project.getLongitude());
        return projectRepository.save(existing);
    }

    public void delete(String id) {
        Project existing = findById(id);
        elevatorService.deleteByProjectId(id);
        projectRepository.delete(existing);
    }
}
