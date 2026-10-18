package com.elevator.management.repository;

import com.elevator.management.model.Intervention;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InterventionRepository extends MongoRepository<Intervention, String> {
    void deleteAllByElevatorId(String elevatorId);
}
