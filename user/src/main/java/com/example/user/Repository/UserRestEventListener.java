package com.example.user.Repository;

import com.example.user.Entity.User;
import com.example.user.keycloak.KeycloakAdminService;
import org.springframework.data.rest.core.event.AbstractRepositoryEventListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserRestEventListener extends AbstractRepositoryEventListener<User> {

    private final KeycloakAdminService keycloakAdminService;
    private final UserRepository userRepository;
    private final Map<Long, String> oldEmailByUserId = new ConcurrentHashMap<>();

    public UserRestEventListener(KeycloakAdminService keycloakAdminService, UserRepository userRepository) {
        this.keycloakAdminService = keycloakAdminService;
        this.userRepository = userRepository;
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

    @Override
    protected void onBeforeSave(User user) {
        if (user.getId() == null) {
            return;
        }
        String originalEmail = user.getOriginalEmail();
        if (originalEmail != null && !originalEmail.isBlank()) {
            oldEmailByUserId.put(user.getId(), originalEmail);
            return;
        }
        userRepository.findById(user.getId())
                .map(User::getEmail)
                .ifPresent(previousEmail -> oldEmailByUserId.put(user.getId(), previousEmail));
    }

    @Override
    protected void onAfterSave(User user) {
        if (user.getId() == null) {
            return;
        }
        String previousEmail = oldEmailByUserId.remove(user.getId());
        keycloakAdminService.syncUserUpdateInKeycloak(user, previousEmail);
    }

    @Override
    protected void onBeforeDelete(User user) {
        keycloakAdminService.syncUserDeletionInKeycloak(user.getEmail());
    }
}
