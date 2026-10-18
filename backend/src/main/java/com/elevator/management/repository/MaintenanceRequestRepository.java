package com.elevator.management.repository;

import com.elevator.management.model.MaintenanceRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MaintenanceRequestRepository extends MongoRepository<MaintenanceRequest, String> {
    List<MaintenanceRequest> findAllByClientIdOrderByCreatedAtDesc(String clientId);
    List<MaintenanceRequest> findAllByOrderByCreatedAtDesc();
    void deleteAllByElevatorId(String elevatorId);
}
