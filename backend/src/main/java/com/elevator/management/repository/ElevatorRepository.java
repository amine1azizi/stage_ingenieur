package com.elevator.management.repository;

import com.elevator.management.model.Elevator;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ElevatorRepository extends MongoRepository<Elevator, String> {
    List<Elevator> findAllByProjectId(String projectId);
    List<Elevator> findAllByProjectIdIn(List<String> projectIds);
    Optional<Elevator> findByIdAndProjectIdIn(String id, List<String> projectIds);
}
