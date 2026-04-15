package com.example.cours.service;

import com.example.cours.entity.Cours;
import com.example.cours.repository.CoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class CoursService {

    @Autowired
    private CoursRepository coursRepository;

    public List<Cours> getAllCours() {
        return coursRepository.findAll();
    }

    public Cours getCoursById(Long id) {
        return requireCours(id);
    }

    public Cours addCours(Cours cours) {
        return coursRepository.save(cours);
    }

    public Cours updateCours(Long id, Cours cours) {
        Cours currentCours = requireCours(id);
        currentCours.setTitle(cours.getTitle());
        currentCours.setContent(cours.getContent());
        currentCours.setAuthor(cours.getAuthor());
        currentCours.setCategory(cours.getCategory());
        currentCours.setProfesseur(cours.getProfesseur());
        if (cours.getModules() != null) {
            currentCours.setModules(sanitizeSet(cours.getModules()));
        }
        return coursRepository.save(currentCours);
    }

    public void deleteCours(Long id) {
        requireCours(id);
        coursRepository.deleteById(id);
    }

    public Cours assignProfesseur(Long id, String professeur) {
        Cours cours = requireCours(id);
        cours.setProfesseur(professeur == null ? null : professeur.trim());
        return coursRepository.save(cours);
    }

    public Cours replaceModules(Long id, Set<String> modules) {
        Cours cours = requireCours(id);
        cours.setModules(sanitizeSet(modules));
        return coursRepository.save(cours);
    }

    public Cours addModule(Long id, String moduleName) {
        Cours cours = requireCours(id);
        if (cours.getModules() == null) {
            cours.setModules(new LinkedHashSet<>());
        }
        String cleanName = normalizeText(moduleName);
        if (cleanName != null) {
            cours.getModules().add(cleanName);
        }
        return coursRepository.save(cours);
    }

    public Cours removeModule(Long id, String moduleName) {
        Cours cours = requireCours(id);
        if (cours.getModules() == null) {
            cours.setModules(new LinkedHashSet<>());
        }
        String cleanName = normalizeText(moduleName);
        if (cleanName != null) {
            cours.getModules().remove(cleanName);
        }
        return coursRepository.save(cours);
    }

    public Cours enrollStudent(Long id, String studentEmail) {
        Cours cours = requireCours(id);
        if (cours.getEnrolledStudents() == null) {
            cours.setEnrolledStudents(new LinkedHashSet<>());
        }
        String cleanEmail = normalizeText(studentEmail);
        if (cleanEmail != null) {
            cours.getEnrolledStudents().add(cleanEmail.toLowerCase());
        }
        return coursRepository.save(cours);
    }

    public Cours unenrollStudent(Long id, String studentEmail) {
        Cours cours = requireCours(id);
        if (cours.getEnrolledStudents() == null) {
            cours.setEnrolledStudents(new LinkedHashSet<>());
        }
        String cleanEmail = normalizeText(studentEmail);
        if (cleanEmail != null) {
            cours.getEnrolledStudents().remove(cleanEmail.toLowerCase());
        }
        return coursRepository.save(cours);
    }

    public Set<String> getEnrolledStudents(Long id) {
        Set<String> enrolled = requireCours(id).getEnrolledStudents();
        return enrolled == null ? new LinkedHashSet<>() : enrolled;
    }

    private Cours requireCours(Long id) {
        return coursRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Cours introuvable"));
    }

    private Set<String> sanitizeSet(Set<String> values) {
        Set<String> cleanValues = new LinkedHashSet<>();
        if (values == null) {
            return cleanValues;
        }
        for (String value : values) {
            String cleaned = normalizeText(value);
            if (cleaned != null) {
                cleanValues.add(cleaned);
            }
        }
        return cleanValues;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
