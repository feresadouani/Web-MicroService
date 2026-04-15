package com.example.cours.service;

import com.example.cours.entity.Cours;
import com.example.cours.repository.CoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CoursService {

    @Autowired
    private CoursRepository coursRepository;

    public List<Cours> getAllCours() {
        return coursRepository.findAll();
    }

    public Cours getCoursById(Long id) {
        return coursRepository.findById(id).orElse(null);
    }

    public Cours addCours(Cours cours) {
        if (cours.getDateOfPost() == null) {
            cours.setDateOfPost(LocalDateTime.now());
        }
        return coursRepository.save(cours);
    }

    public Cours updateCours(Long id, Cours cours) {
        Cours currentCours = coursRepository.findById(id).orElse(null);
        if (currentCours != null) {
            currentCours.setTitle(cours.getTitle());
            currentCours.setContent(cours.getContent());
            currentCours.setAuthor(cours.getAuthor());
            currentCours.setCategory(cours.getCategory());
            currentCours.setDateOfPost(cours.getDateOfPost());
            return coursRepository.save(currentCours);
        }
        return null;
    }

    public void deleteCours(Long id) {
        coursRepository.deleteById(id);
    }
}
