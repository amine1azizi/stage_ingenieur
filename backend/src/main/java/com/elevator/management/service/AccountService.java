package com.elevator.management.service;

import com.elevator.management.model.AccountRole;
import com.elevator.management.model.Client;
import com.elevator.management.model.UserAccount;
import com.elevator.management.repository.ClientRepository;
import com.elevator.management.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AccountService {

    private final ClientRepository clientRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            ClientRepository clientRepository,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.clientRepository = clientRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserAccount registerClient(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        Client client = clientRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "No client record exists for this email. Contact your administrator."
                ));

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for this email.");
        }

        return userAccountRepository.save(new UserAccount(
                normalizedEmail,
                passwordEncoder.encode(password),
                AccountRole.CLIENT,
                client.getId()
        ));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
