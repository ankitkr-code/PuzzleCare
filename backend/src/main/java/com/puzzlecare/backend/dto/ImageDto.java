package com.puzzlecare.backend.dto;

import java.time.Instant;

public class ImageDto {

    private Long id;
    private String fileName;
    private Instant uploadedAt;

    public ImageDto(Long id, String fileName, Instant uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public Instant getUploadedAt() { return uploadedAt; }
}
