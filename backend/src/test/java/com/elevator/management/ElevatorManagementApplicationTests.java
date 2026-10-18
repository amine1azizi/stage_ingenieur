package com.elevator.management;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.security.jwt-secret=test-only-signing-secret-that-is-at-least-32-bytes")
class ElevatorManagementApplicationTests {

    @Test
    void contextLoads() {
    }
}
