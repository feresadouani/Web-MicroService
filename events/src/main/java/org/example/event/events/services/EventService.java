package org.example.event.events.services;



import org.example.event.events.entities.Event;
import org.example.event.events.repositories.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        if(ev != null){
            ev.setName(e.getName());
            ev.setDescription(e.getDescription());
            ev.setLocation(e.getLocation());
            ev.setDate(e.getDate());
            return eventRepository.save(ev);
        }
        return null;
    }

    public void deleteEvent(Long id){
        eventRepository.deleteById(id);
    }
}
