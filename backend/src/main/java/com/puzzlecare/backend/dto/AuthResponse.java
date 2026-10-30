package com.puzzlecare.backend.dto;

public class AuthResponse {

    private String token;
    private String name;
    private String patientName;

    public AuthResponse(String token, String name, String patientName) {
        this.token = token;
        this.name = name;
        this.patientName = patientName;
    }

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getPatientName() { return patientName; }
}
