package com.elevator.management.service;

import com.elevator.management.model.Client;
import com.elevator.management.repository.ClientRepository;
import com.elevator.management.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserAccountRepository userAccountRepository;

    public ClientService(ClientRepository clientRepository, UserAccountRepository userAccountRepository) {
        this.clientRepository = clientRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Client findById(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
    }

    public Client create(Client client) {
        client.setId(null);
        return clientRepository.save(client);
    }

    public Client update(String id, Client client) {
        Client existing = findById(id);
        existing.setName(client.getName());
        existing.setPhone(client.getPhone());
        existing.setEmail(client.getEmail());
        existing.setAddress(client.getAddress());
        return clientRepository.save(existing);
    }

    public void delete(String id) {
        Client existing = findById(id);
        userAccountRepository.deleteByClientId(id);
        clientRepository.delete(existing);
    }
}
