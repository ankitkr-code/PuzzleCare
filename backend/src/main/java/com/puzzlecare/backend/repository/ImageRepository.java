package com.puzzlecare.backend.repository;

import com.puzzlecare.backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByUserId(Long userId);
}
