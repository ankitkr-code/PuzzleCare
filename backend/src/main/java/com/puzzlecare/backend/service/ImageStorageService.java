package com.puzzlecare.backend.service;

import com.puzzlecare.backend.model.Image;
import com.puzzlecare.backend.model.User;
import com.puzzlecare.backend.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path uploadRoot;
    private final ImageRepository imageRepository;

    public ImageStorageService(@Value("${app.upload.dir}") String uploadDir,
                               ImageRepository imageRepository) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.imageRepository = imageRepository;
    }

    public Image store(MultipartFile file, User user) throws IOException {
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + (ext != null ? "." + ext : "");

        Path userDir = uploadRoot.resolve(String.valueOf(user.getId()));
        Files.createDirectories(userDir);

        Path target = userDir.resolve(fileName).normalize();
        if (!target.startsWith(userDir)) {
            throw new IOException("Invalid file path");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        Image image = new Image();
        image.setUser(user);
        image.setFileName(fileName);
        image.setFilePath(target.toString());
        image.setUploadedAt(Instant.now());
        try {
            return imageRepository.save(image);
        } catch (RuntimeException e) {
            Files.deleteIfExists(target);
            throw e;
        }
    }

    public Resource load(Image image) throws IOException {
        Path path = Paths.get(image.getFilePath());
        if (!Files.exists(path)) {
            throw new FileNotFoundException("File not found: " + image.getFileName());
        }
        return new FileSystemResource(path);
    }

    public void delete(Image image) throws IOException {
        imageRepository.delete(image);
        Files.deleteIfExists(Paths.get(image.getFilePath()));
    }
}
