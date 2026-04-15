package com.example.cours.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;
    private LocalDateTime dateOfPost;
    private String author;
    private String category;
    private String professeur;

    @ElementCollection
    private Set<String> modules = new LinkedHashSet<>();

    @ElementCollection
    private Set<String> enrolledStudents = new LinkedHashSet<>();

    @PrePersist
    void onCreate() {
        dateOfPost = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        if (dateOfPost == null) {
            dateOfPost = LocalDateTime.now();
        }
    }
}
