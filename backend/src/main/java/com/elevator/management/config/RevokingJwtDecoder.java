package com.elevator.management.config;

import com.elevator.management.repository.RevokedTokenRepository;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

public class RevokingJwtDecoder implements JwtDecoder {

    private final JwtDecoder delegate;
    private final RevokedTokenRepository revokedTokenRepository;

    public RevokingJwtDecoder(JwtDecoder delegate, RevokedTokenRepository revokedTokenRepository) {
        this.delegate = delegate;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Override
    public Jwt decode(String token) {
        Jwt jwt = delegate.decode(token);
        if (jwt.getId() != null && revokedTokenRepository.existsById(jwt.getId())) {
            throw new BadJwtException("Token has been revoked.");
        }
        return jwt;
    }
}
