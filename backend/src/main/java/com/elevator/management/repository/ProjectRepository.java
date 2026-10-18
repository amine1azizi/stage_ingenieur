package com.elevator.management.repository;

import com.elevator.management.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findAllByClientId(String clientId);
}
