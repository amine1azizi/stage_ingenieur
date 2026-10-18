package com.elevator.management.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_accounts")
public class UserAccount {

    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    private String passwordHash;
    private AccountRole role;
    private String clientId;

    public UserAccount() {
    }

    public UserAccount(String email, String passwordHash, AccountRole role, String clientId) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.clientId = clientId;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public AccountRole getRole() {
        return role;
    }

    public String getClientId() {
        return clientId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setRole(AccountRole role) {
        this.role = role;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
}
