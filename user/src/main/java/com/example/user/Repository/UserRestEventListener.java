package com.example.user.Repository;

import com.example.user.Entity.User;
import com.example.user.keycloak.KeycloakAdminService;
import org.springframework.data.rest.core.event.AbstractRepositoryEventListener;
import org.springframework.stereotype.Component;

/**
 * Écoute les événements Spring Data REST (plus fiable que {@code @RepositoryEventHandler} seul pour POST /users).
 * Le mot de passe en clair est mémorisé avant persist : après {@code save}, l’entité peut ne plus l’exposer correctement.
 */
@Component
public class UserRestEventListener extends AbstractRepositoryEventListener<User> {

    private final KeycloakAdminService keycloakAdminService;

    public UserRestEventListener(KeycloakAdminService keycloakAdminService) {
        this.keycloakAdminService = keycloakAdminService;
    }

    @Override
    protected void onBeforeCreate(User user) {
        keycloakAdminService.stashPlainPasswordForNewUser(user.getEmail(), user.getPassword());
    }

    @Override
    protected void onAfterCreate(User user) {
        try {
            keycloakAdminService.syncUserToKeycloakAfterPersist(user);
        } finally {
            keycloakAdminService.clearStashedPlainPassword(user.getEmail());
        }
    }
}
