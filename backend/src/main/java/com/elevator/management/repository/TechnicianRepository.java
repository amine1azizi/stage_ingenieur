package com.elevator.management.repository;

import com.elevator.management.model.Technician;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TechnicianRepository extends MongoRepository<Technician, String> {
}
