package com.example.cours.repository;

import com.example.cours.entity.Cours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoursRepository extends JpaRepository<Cours, Long> {

    List<Cours> findByTitleContainingIgnoreCase(String title);
}
