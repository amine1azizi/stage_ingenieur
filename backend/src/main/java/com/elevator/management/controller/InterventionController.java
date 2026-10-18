package com.elevator.management.controller;

import com.elevator.management.model.Intervention;
import com.elevator.management.service.InterventionService;
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
@RequestMapping("/api/interventions")
public class InterventionController {

    private final InterventionService interventionService;

    public InterventionController(InterventionService interventionService) {
        this.interventionService = interventionService;
    }

    @GetMapping
    public List<Intervention> getAll() {
        return interventionService.findAll();
    }

    @GetMapping("/{id}")
    public Intervention getById(@PathVariable String id) {
        return interventionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Intervention create(@Valid @RequestBody Intervention intervention) {
        return interventionService.create(intervention);
    }

    @PutMapping("/{id}")
    public Intervention update(@PathVariable String id, @Valid @RequestBody Intervention intervention) {
        return interventionService.update(id, intervention);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        interventionService.delete(id);
    }
}
