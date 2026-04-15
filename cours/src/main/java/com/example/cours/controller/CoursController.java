package com.example.cours.controller;

import com.example.cours.entity.Cours;
import com.example.cours.service.CoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
