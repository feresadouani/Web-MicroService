package org.example.event.events.entities;

import jakarta.persistence.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String location;
    private Date date;

    /**
     * Maps Keycloak user ID (sub) → display name.
     * Stored in event_registrations(event_id, user_id, display_name).
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_registrations", joinColumns = @JoinColumn(name = "event_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "display_name")
    private Map<String, String> registeredUsers = new HashMap<>();
}
