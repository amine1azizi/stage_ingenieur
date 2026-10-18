package com.elevator.management.controller;

import com.elevator.management.model.UserAccount;
import com.elevator.management.repository.UserAccountRepository;
import com.elevator.management.model.RevokedToken;
import com.elevator.management.repository.RevokedTokenRepository;
import com.elevator.management.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final AccountService accountService;
    private final UserAccountRepository userAccountRepository;
    private final RevokedTokenRepository revokedTokenRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtEncoder jwtEncoder,
            AccountService accountService,
            UserAccountRepository userAccountRepository,
            RevokedTokenRepository revokedTokenRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.accountService = accountService;
        this.userAccountRepository = userAccountRepository;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        String email = normalizeEmail(request.email());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );
        UserAccount account = userAccountRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));
        return createResponse(account);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        UserAccount account = accountService.registerClient(request.email(), request.password());
        return createResponse(account);
    }

    @GetMapping("/me")
    public AuthResponse me(@AuthenticationPrincipal Jwt jwt) {
        Instant expiresAt = jwt.getExpiresAt();
        return new AuthResponse(
                null,
                expiresAt,
                jwt.getSubject(),
                jwt.getClaimAsString("role"),
                jwt.getClaimAsString("clientId")
        );
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal Jwt jwt) {
        if (jwt.getId() != null && jwt.getExpiresAt() != null) {
            revokedTokenRepository.save(new RevokedToken(jwt.getId(), jwt.getExpiresAt()));
        }
    }

    private AuthResponse createResponse(UserAccount account) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(8 * 60 * 60);
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("elevator-management")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .id(java.util.UUID.randomUUID().toString())
                .subject(account.getEmail())
                .claim("role", account.getRole().name());
        if (account.getClientId() != null) {
            claims.claim("clientId", account.getClientId());
        }
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims.build()
        )).getTokenValue();

        return new AuthResponse(
                token,
                expiresAt,
                account.getEmail(),
                account.getRole().name(),
                account.getClientId()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 128) String password
    ) {
    }

    public record AuthResponse(
            String token,
            Instant expiresAt,
            String email,
            String role,
            String clientId
    ) {
    }
}
