package com.puzzlecare.backend.security;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtUtilTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "puzzlecare-test-secret-32-bytes!".getBytes(StandardCharsets.UTF_8));

    @Test
    void generatedTokenIsValidAndContainsTheEmail() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 60_000);
        String token = jwtUtil.generateToken("caregiver@example.com");

        assertTrue(jwtUtil.isValid(token));
        assertEquals("caregiver@example.com", jwtUtil.extractEmail(token));
    }

    @Test
    void rejectsExpiredMalformedAndWrongSignatureTokens() {
        JwtUtil expiredJwtUtil = new JwtUtil(SECRET, -1);
        JwtUtil validJwtUtil = new JwtUtil(SECRET, 60_000);
        String expiredToken = expiredJwtUtil.generateToken("caregiver@example.com");
        String validToken = validJwtUtil.generateToken("caregiver@example.com");
        String changedSignature = validToken.substring(0, validToken.length() - 1)
                + (validToken.endsWith("a") ? "b" : "a");
        String wrongSignature = new JwtUtil(
                Base64.getEncoder().encodeToString(
                        "another-test-secret-32-bytes!!xx".getBytes(StandardCharsets.UTF_8)),
                60_000
        ).generateToken("caregiver@example.com");

        assertFalse(expiredJwtUtil.isValid(expiredToken));
        assertFalse(validJwtUtil.isValid("not-a-jwt"));
        assertFalse(validJwtUtil.isValid(changedSignature));
        assertFalse(validJwtUtil.isValid(wrongSignature));
    }
}
