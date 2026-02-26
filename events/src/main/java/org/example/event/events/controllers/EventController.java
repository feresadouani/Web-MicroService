package org.example.event.events.controllers;

import org.example.event.events.entities.Event;
import org.example.event.events.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    public List<Event> getAll(){
        return eventService.getAllEvents();
    }

    @PostMapping
    public Event add(@RequestBody Event e){
        return eventService.addEvent(e);
    }

    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event e){
        return eventService.updateEvent(id, e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        eventService.deleteEvent(id);
    }
}

