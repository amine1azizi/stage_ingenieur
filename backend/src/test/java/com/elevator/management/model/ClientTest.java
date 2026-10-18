package com.elevator.management.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientTest {

    @Test
    void blankEmailIsTreatedAsAbsent() {
        Client client = new Client();

        client.setEmail("  ");

        assertNull(client.getEmail());
    }

    @Test
    void nonBlankEmailIsTrimmed() {
        Client client = new Client();

        client.setEmail(" test@example.com ");

        assertEquals("test@example.com", client.getEmail());
    }
}
