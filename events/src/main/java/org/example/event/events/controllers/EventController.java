package org.example.event.events.controllers;

import org.example.event.events.entities.Event;
import org.example.event.events.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Base64;
import org.json.JSONObject;

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

    // ── Subscribe endpoints (for frontend) ──────────────────────────────────

    /**
     * POST /events/{id}/subscribe
     * Subscribe the current user (from JWT token) to an event.
     */
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<Event> subscribe(@PathVariable Long id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromJWT(request);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String firstName = extractClaimFromJWT(request, "given_name");
            if (firstName == null || firstName.isBlank()) {
                firstName = extractClaimFromJWT(request, "firstName");
            }
            if (firstName == null || firstName.isBlank()) {
                firstName = extractClaimFromJWT(request, "preferred_username");
            }
            if (firstName == null || firstName.isBlank()) {
                firstName = "User";
            }

            String email = extractClaimFromJWT(request, "email");
            if (email == null) email = "";

            // Persist as "firstName|email" to keep existing map schema.
            String displayName = firstName + "|" + email;

            Event updated = eventService.registerUser(id, userId, displayName);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /events/{id}/subscribe
     * Unsubscribe the current user (from JWT token) from an event.
     */
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<Event> unsubscribe(@PathVariable Long id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromJWT(request);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Event updated = eventService.unregisterUser(id, userId);
            if (updated == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /events/{id}/is-subscribed
     * Check if the current user (from JWT token) is subscribed to an event.
     */
    @GetMapping("/{id}/is-subscribed")
    public ResponseEntity<Map<String, Boolean>> isSubscribed(@PathVariable Long id, HttpServletRequest request) {
        try {
            String userId = extractUserIdFromJWT(request);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            Map<String, String> registrations = eventService.getRegistrations(id);
            if (registrations == null) {
                return ResponseEntity.notFound().build();
            }
            boolean isSubscribed = registrations.containsKey(userId);
            return ResponseEntity.ok(Map.of("isSubscribed", isSubscribed));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Extract userId (sub claim) from JWT token in Authorization header.
     */
    private String extractUserIdFromJWT(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }

            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JSONObject json = new JSONObject(payload);
            return json.getString("sub");
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * Extract a claim from JWT token payload (Authorization: Bearer ...).
     */
    private String extractClaimFromJWT(HttpServletRequest request, String claim) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return null;
            }

            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JSONObject json = new JSONObject(payload);
            if (!json.has(claim) || json.isNull(claim)) {
                return null;
            }
            return json.get(claim).toString();
        } catch (Exception ex) {
            return null;
        }
    }
}
