package com.puzzlecare.backend.controller;

import com.puzzlecare.backend.dto.ImageDto;
import com.puzzlecare.backend.model.Image;
import com.puzzlecare.backend.model.User;
import com.puzzlecare.backend.repository.ImageRepository;
import com.puzzlecare.backend.service.ImageStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageStorageService storageService;
    private final ImageRepository imageRepository;

    public ImageController(ImageStorageService storageService, ImageRepository imageRepository) {
        this.storageService = storageService;
        this.imageRepository = imageRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageDto> upload(@RequestParam("file") MultipartFile file,
                                          @AuthenticationPrincipal User user) throws IOException {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        return ResponseEntity.ok(toDto(storageService.store(file, user)));
    }

    @GetMapping
    public List<ImageDto> list(@AuthenticationPrincipal User user) {
        return imageRepository.findByUserId(user.getId()).stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> file(@PathVariable Long id,
                                        @AuthenticationPrincipal User user) throws IOException {
        Image image = findOwned(id, user);
        Resource resource = storageService.load(image);
        return ResponseEntity.ok()
                .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) throws IOException {
        storageService.delete(findOwned(id, user));
        return ResponseEntity.noContent().build();
    }

    private Image findOwned(Long id, User user) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
        if (!image.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your image");
        }
        return image;
    }

    private ImageDto toDto(Image image) {
        return new ImageDto(image.getId(), image.getFileName(), image.getUploadedAt());
    }
}
