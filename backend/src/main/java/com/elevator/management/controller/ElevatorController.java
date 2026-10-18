package com.elevator.management.controller;

import com.elevator.management.dto.ElevatorMaintenanceStatusDto;
import com.elevator.management.model.Elevator;
import com.elevator.management.service.ElevatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/elevators")
public class ElevatorController {

    private final ElevatorService elevatorService;

    public ElevatorController(ElevatorService elevatorService) {
        this.elevatorService = elevatorService;
    }

    @GetMapping
    public List<Elevator> getAll() {
        return elevatorService.findAll();
    }

    @GetMapping("/maintenance-status")
    public List<ElevatorMaintenanceStatusDto> getMaintenanceStatus() {
        return elevatorService.getMaintenanceStatus();
    }

    @GetMapping("/{id}")
    public Elevator getById(@PathVariable String id) {
        return elevatorService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Elevator create(@Valid @RequestBody Elevator elevator) {
        return elevatorService.create(elevator);
    }

    @PutMapping("/{id}")
    public Elevator update(@PathVariable String id, @Valid @RequestBody Elevator elevator) {
        return elevatorService.update(id, elevator);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        elevatorService.delete(id);
    }
}
