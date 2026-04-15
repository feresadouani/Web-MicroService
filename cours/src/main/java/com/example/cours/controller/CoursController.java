package com.example.cours.controller;

import com.example.cours.entity.Cours;
import com.example.cours.service.CoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/cours")
public class CoursController {

    @Autowired
    private CoursService coursService;

    @GetMapping
    public List<Cours> getAll() {
        return coursService.getAllCours();
    }

    @GetMapping("/{id}")
    public Cours getById(@PathVariable Long id) {
        return coursService.getCoursById(id);
    }

    @PostMapping
    public Cours add(@RequestBody Cours cours) {
        return coursService.addCours(cours);
    }

    @PutMapping("/{id}")
    public Cours update(@PathVariable Long id, @RequestBody Cours cours) {
        return coursService.updateCours(id, cours);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        coursService.deleteCours(id);
    }

    @PutMapping("/{id}/professeur")
    public Cours assignProfesseur(@PathVariable Long id, @RequestBody ProfesseurRequest request) {
        return coursService.assignProfesseur(id, request.professeur());
    }

    @PutMapping("/{id}/modules")
    public Cours replaceModules(@PathVariable Long id, @RequestBody ModulesRequest request) {
        return coursService.replaceModules(id, request.modules());
    }

    @PostMapping("/{id}/modules")
    public Cours addModule(@PathVariable Long id, @RequestBody ModuleRequest request) {
        return coursService.addModule(id, request.module());
    }

    @DeleteMapping("/{id}/modules/{moduleName}")
    public Cours removeModule(@PathVariable Long id, @PathVariable String moduleName) {
        return coursService.removeModule(id, moduleName);
    }

    @PostMapping("/{id}/etudiants/inscription")
    public Cours inscrireEtudiant(@PathVariable Long id, @RequestBody EtudiantRequest request) {
        return coursService.enrollStudent(id, request.email());
    }

    @PostMapping("/{id}/etudiants/desinscription")
    public Cours desinscrireEtudiant(@PathVariable Long id, @RequestBody EtudiantRequest request) {
        return coursService.unenrollStudent(id, request.email());
    }

    @GetMapping("/{id}/etudiants")
    public Set<String> getEtudiantsByCours(@PathVariable Long id) {
        return coursService.getEnrolledStudents(id);
    }

    public record ProfesseurRequest(String professeur) {
    }

    public record ModulesRequest(Set<String> modules) {
    }

    public record ModuleRequest(String module) {
    }

    public record EtudiantRequest(String email) {
    }
}
