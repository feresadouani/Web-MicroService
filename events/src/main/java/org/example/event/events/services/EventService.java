package org.example.event.events.services;

import org.example.event.events.entities.Event;
import org.example.event.events.repositories.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event addEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event e) {
        Event ev = eventRepository.findById(id).orElse(null);
        if (ev != null) {
            ev.setName(e.getName());
            ev.setDescription(e.getDescription());
            ev.setLocation(e.getLocation());
            ev.setDate(e.getDate());
            return eventRepository.save(ev);
        }
        return null;
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    /**
     * Register a user with their display name to an event.
     */
    public Event registerUser(Long eventId, String userId, String displayName) {
        Event ev = eventRepository.findById(eventId).orElse(null);
        if (ev == null) return null;
        ev.getRegisteredUsers().put(userId, displayName);
        return eventRepository.save(ev);
    }

    /**
     * Unregister a user from an event.
     */
    public Event unregisterUser(Long eventId, String userId) {
        Event ev = eventRepository.findById(eventId).orElse(null);
        if (ev == null) return null;
        ev.getRegisteredUsers().remove(userId);
        return eventRepository.save(ev);
    }

    /**
     * Get the userId → displayName map for an event.
     */
    public Map<String, String> getRegistrations(Long eventId) {
        Event ev = eventRepository.findById(eventId).orElse(null);
        if (ev == null) return null;
        return ev.getRegisteredUsers();
    }
}
