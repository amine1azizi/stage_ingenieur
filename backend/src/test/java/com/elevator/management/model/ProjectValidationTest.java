package com.elevator.management.model;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProjectValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void coordinatesAreOptional() {
        Project project = validProject();

        assertTrue(validator.validate(project).isEmpty());
    }

    @Test
    void rejectsCoordinatesOutsideGeographicRanges() {
        Project project = validProject();
        project.setLatitude(90.1);
        project.setLongitude(-180.1);

        assertFalse(validator.validate(project).isEmpty());
    }

    private Project validProject() {
        Project project = new Project();
        project.setName("Test project");
        project.setClientId("client-1");
        project.setStatus(ProjectStatus.PLANIFIE);
        return project;
    }
}
