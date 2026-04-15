package org.example.event.events.controllers;

import org.example.event.events.entities.Event;
import org.example.event.events.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/events", "/events"})
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    public ResponseEntity<List<Event>> getAll() {
        try {
            return ResponseEntity.ok(eventService.getAllEvents());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Event> add(@RequestBody Event e) {
        try {
            if (e.getName() == null || e.getName().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(eventService.addEvent(e));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> update(@PathVariable Long id, @RequestBody Event e) {
        try {
            Event updated = eventService.updateEvent(id, e);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ── Registration endpoints ────────────────────────────────────────────────

    /**
     * POST /events/{id}/register?userId=<sub>&displayName=<name>
     * Subscribe a user to an event, storing their display name.
     */
    @PostMapping("/{id}/register")
    public ResponseEntity<Event> register(
            @PathVariable Long id,
            @RequestParam String userId,
            @RequestParam(defaultValue = "Utilisateur") String displayName) {
        try {
            Event updated = eventService.registerUser(id, userId, displayName);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /events/{id}/register?userId=<sub>
     * Unsubscribe a user from an event.
     */
    @DeleteMapping("/{id}/register")
    public ResponseEntity<Event> unregister(
            @PathVariable Long id,
            @RequestParam String userId) {
        try {
            Event updated = eventService.unregisterUser(id, userId);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /events/{id}/registrations
     * Returns the userId → displayName map.
     */
    @GetMapping("/{id}/registrations")
    public ResponseEntity<Map<String, String>> getRegistrations(@PathVariable Long id) {
        try {
            Map<String, String> regs = eventService.getRegistrations(id);
            if (regs == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(regs);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
