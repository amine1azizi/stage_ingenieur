package com.elevator.management.service;

import com.elevator.management.model.Technician;
import com.elevator.management.repository.TechnicianRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public List<Technician> findAll() {
        return technicianRepository.findAll();
    }

    public Technician findById(String id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found"));
    }

    public Technician create(Technician technician) {
        technician.setId(null);
        return technicianRepository.save(technician);
    }

    public Technician update(String id, Technician technician) {
        Technician existing = findById(id);
        existing.setName(technician.getName());
        existing.setPhone(technician.getPhone());
        existing.setEmail(technician.getEmail());
        existing.setSpecialty(technician.getSpecialty());
        return technicianRepository.save(existing);
    }

    public void delete(String id) {
        Technician existing = findById(id);
        technicianRepository.delete(existing);
    }
}
