package com.example.user.keycloak;

import com.example.user.Entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;


@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakAdminService {

    private final KeycloakAdminProperties props;
    private final ObjectMapper objectMapper;

   private final ConcurrentHashMap<String, String> plainPasswordByEmail = new ConcurrentHashMap<>();

    public void stashPlainPasswordForNewUser(String email, String rawPassword) {
        if (email == null || email.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            return;
        }
        plainPasswordByEmail.put(emailKey(email), rawPassword);
    }

    public void clearStashedPlainPassword(String email) {
        if (email != null && !email.isBlank()) {
            plainPasswordByEmail.remove(emailKey(email));
        }
    }


    public void syncUserToKeycloakAfterPersist(User user) {
        if (!props.isEnabled()) {
            log.debug("Keycloak : synchronisation désactivée (keycloak.admin.enabled=false).");
            return;
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            log.warn("Keycloak : email vide, sync ignorée.");
            return;
        }
        try {
            String token = fetchAdminAccessToken();
            String email = user.getEmail().trim();
            if (keycloakUserExists(email, token)) {
                log.info("Keycloak : utilisateur déjà présent pour {}, pas de création.", email);
                return;
            }
            String plain = resolvePlainPassword(user);
            if (plain == null || plain.isBlank()) {
                throw new IllegalStateException(
                        "Mot de passe obligatoire pour créer l’utilisateur dans Keycloak (vérifiez le formulaire / JSON).");
            }
            String userId = createKeycloakUser(user, plain, token);
            assignFrontendClientRoles(userId, resolveKeycloakRoles(user.getRole()), token);
            log.info("Keycloak : utilisateur créé pour {} (id={})", email, userId);
        } catch (Exception e) {
            log.error("Keycloak : échec sync pour {} : {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Impossible de créer l’utilisateur dans Keycloak : " + e.getMessage(), e);
        }
    }

    public void syncUserUpdateInKeycloak(User user, String previousEmail) {
        syncUserUpdateInKeycloak(user, previousEmail, null);
    }

    public void syncUserUpdateInKeycloak(User user, String previousEmail, String rawPassword) {
        if (!props.isEnabled()) {
            return;
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            log.warn("Keycloak : email vide, update ignorée.");
            return;
        }
        try {
            String token = fetchAdminAccessToken();
            JsonNode keycloakUser = findUserByEmail(previousEmail, token);
            if (keycloakUser == null) {
                keycloakUser = findUserByEmail(user.getEmail(), token);
            }
            if (keycloakUser == null || !keycloakUser.hasNonNull("id")) {
                log.warn("Keycloak : utilisateur introuvable pour update (previousEmail={}, email={}).",
                        previousEmail, user.getEmail());
                return;
            }

            String keycloakUserId = keycloakUser.get("id").asText();
            Map<String, Object> updateBody = new LinkedHashMap<>();
            String email = user.getEmail().trim();
            updateBody.put("username", email);
            updateBody.put("email", email);
            updateBody.put("firstName", Optional.ofNullable(user.getFirstname()).orElse(""));
            updateBody.put("lastName", Optional.ofNullable(user.getLastname()).orElse(""));
            updateBody.put("enabled", true);
            updateBody.put("emailVerified", true);

            client().put()
                    .uri("/admin/realms/{realm}/users/{id}", props.getTargetRealm(), keycloakUserId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(updateBody)
                    .retrieve()
                    .toEntity(Void.class);

            if (rawPassword != null && !rawPassword.isBlank()) {
                Map<String, Object> resetPasswordBody = new LinkedHashMap<>();
                resetPasswordBody.put("type", "password");
                resetPasswordBody.put("value", rawPassword);
                resetPasswordBody.put("temporary", false);
                client().put()
                        .uri("/admin/realms/{realm}/users/{id}/reset-password", props.getTargetRealm(), keycloakUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .body(resetPasswordBody)
                        .retrieve()
                        .toEntity(Void.class);
            }

            replaceFrontendClientRoles(keycloakUserId, resolveKeycloakRoles(user.getRole()), token);
            log.info("Keycloak : utilisateur mis à jour pour {} (id={})", email, keycloakUserId);
        } catch (Exception e) {
            log.error("Keycloak : échec update pour {} : {}", user.getEmail(), e.getMessage(), e);
            throw new RuntimeException("Impossible de modifier l’utilisateur dans Keycloak : " + e.getMessage(), e);
        }
    }

    public void syncUserDeletionInKeycloak(String email) {
        if (!props.isEnabled()) {
            return;
        }
        if (email == null || email.isBlank()) {
            log.warn("Keycloak : email vide, suppression ignorée.");
            return;
        }
        try {
            String token = fetchAdminAccessToken();
            JsonNode keycloakUser = findUserByEmail(email, token);
            if (keycloakUser == null || !keycloakUser.hasNonNull("id")) {
                log.info("Keycloak : aucun utilisateur trouvé pour suppression ({})", email);
                return;
            }
            String keycloakUserId = keycloakUser.get("id").asText();
            client().delete()
                    .uri("/admin/realms/{realm}/users/{id}", props.getTargetRealm(), keycloakUserId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .toEntity(Void.class);
            log.info("Keycloak : utilisateur supprimé pour {} (id={})", email, keycloakUserId);
        } catch (Exception e) {
            log.error("Keycloak : échec suppression pour {} : {}", email, e.getMessage(), e);
            throw new RuntimeException("Impossible de supprimer l’utilisateur dans Keycloak : " + e.getMessage(), e);
        }
    }

    private String resolvePlainPassword(User user) {
        String key = emailKey(user.getEmail());
        String stashed = plainPasswordByEmail.get(key);
        if (stashed != null && !stashed.isBlank()) {
            return stashed;
        }
        String p = user.getPassword();
        if (p != null && !p.isBlank()) {
            return p;
        }
        return null;
    }

    private static String emailKey(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private List<String> resolveKeycloakRoles(String appRole) {
        Set<String> roles = new LinkedHashSet<>();
        roles.add("client_user");
        if (appRole != null && appRole.equalsIgnoreCase("ADMIN")) {
            roles.add("client_admin");
        }
        return new ArrayList<>(roles);
    }

    private RestClient client() {
        return RestClient.builder().baseUrl(props.getServerUrl()).build();
    }

    private String fetchAdminAccessToken() throws Exception {
        String realm = props.getTokenRealm();
        String form;
        if ("client_credentials".equalsIgnoreCase(props.getGrantType())) {
            if (props.getTokenClientId() == null || props.getTokenClientId().isBlank()
                    || props.getTokenClientSecret() == null || props.getTokenClientSecret().isBlank()) {
                throw new IllegalStateException(
                        "grant-type=client_credentials : renseignez keycloak.admin.token-client-id et token-client-secret.");
            }
            form = "grant_type=client_credentials"
                    + "&client_id=" + urlEncode(props.getTokenClientId())
                    + "&client_secret=" + urlEncode(props.getTokenClientSecret());
        } else {
            form = "grant_type=password"
                    + "&client_id=admin-cli"
                    + "&username=" + urlEncode(props.getUsername())
                    + "&password=" + urlEncode(props.getPassword());
        }

        final String raw;
        try {
            raw = client().post()
                    .uri("/realms/{realm}/protocol/openid-connect/token", realm)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 400) {
                String body = e.getResponseBodyAsString();
                String hint = """
                        Jeton admin Keycloak refusé (400).
                        • Si grant-type=password : vérifiez keycloak.admin.username et keycloak.admin.password (mot de passe réel du compte admin Keycloak, celui défini à l’installation ou dans la console).
                          Dans Keycloak : realm master → Clients → admin-cli → activer « Direct access grants ».
                        • Ou passez à keycloak.admin.grant-type=client_credentials avec un client confidentiel (service account) ayant les rôles realm-management sur le realm cible.
                        Réponse Keycloak : """
                        + body;
                throw new IllegalStateException(hint.trim(), e);
            }
            throw e;
        }
        JsonNode root = objectMapper.readTree(raw);
        if (!root.has("access_token")) {
            throw new IllegalStateException("Réponse token Keycloak sans access_token : " + raw);
        }
        return root.get("access_token").asText();
    }

    private static String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private boolean keycloakUserExists(String email, String token) {
        String json = searchUserByEmailJson(email, token);
        try {
            JsonNode arr = objectMapper.readTree(json);
            return arr.isArray() && !arr.isEmpty();
        } catch (Exception e) {
            log.warn("Keycloak : lecture réponse recherche utilisateur : {}", e.getMessage());
            return false;
        }
    }

    private JsonNode findUserByEmail(String email, String token) throws Exception {
        if (email == null || email.isBlank()) {
            return null;
        }
        String json = searchUserByEmailJson(email, token);
        JsonNode arr = objectMapper.readTree(json);
        if (!arr.isArray() || arr.isEmpty()) {
            return null;
        }
        return arr.get(0);
    }

    private String searchUserByEmailJson(String email, String token) {
        return client().get()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/{realm}/users")
                        .queryParam("email", email.trim())
                        .queryParam("exact", true)
                        .build(props.getTargetRealm()))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
    }

    private String createKeycloakUser(User user, String plainPassword, String token) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        String email = user.getEmail().trim();
        body.put("username", email);
        body.put("email", email);
        body.put("firstName", Optional.ofNullable(user.getFirstname()).orElse(""));
        body.put("lastName", Optional.ofNullable(user.getLastname()).orElse(""));
        body.put("enabled", true);
        body.put("emailVerified", true);
        List<Map<String, Object>> credentials = new ArrayList<>();
        credentials.add(Map.of(
                "type", "password",
                "value", plainPassword,
                "temporary", false));
        body.put("credentials", credentials);

        try {
            ResponseEntity<Void> created = client().post()
                    .uri("/admin/realms/{realm}/users", props.getTargetRealm())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(body)
                    .retrieve()
                    .toEntity(Void.class);
            if (!created.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Création Keycloak HTTP " + created.getStatusCode());
            }
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 409) {
                throw new IllegalStateException("Utilisateur déjà existant dans Keycloak (409).", e);
            }
            throw e;
        }

        String listJson = client().get()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/{realm}/users")
                        .queryParam("email", email)
                        .queryParam("exact", true)
                        .build(props.getTargetRealm()))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        JsonNode arr = objectMapper.readTree(listJson);
        if (!arr.isArray() || arr.isEmpty() || !arr.get(0).has("id")) {
            throw new IllegalStateException("Utilisateur Keycloak créé mais introuvable par email.");
        }
        return arr.get(0).get("id").asText();
    }

    private void assignFrontendClientRole(String keycloakUserId, String roleName, String token) throws Exception {
        String clientUuid = resolveFrontendClientUuid(token);
        String rolesJson = client().get()
                .uri("/admin/realms/{realm}/clients/{id}/roles", props.getTargetRealm(), clientUuid)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        JsonNode roles = objectMapper.readTree(rolesJson);
        JsonNode roleNode = null;
        if (roles.isArray()) {
            for (JsonNode r : roles) {
                if (r.has("name") && roleName.equals(r.get("name").asText())) {
                    roleNode = r;
                    break;
                }
            }
        }
        if (roleNode == null) {
            throw new IllegalStateException(
                    "Rôle Keycloak introuvable sur le client '" + props.getFrontendClientId() + "' : " + roleName);
        }
        Map<String, Object> roleMap = objectMapper.convertValue(roleNode, new TypeReference<>() {
        });
        client().post()
                .uri("/admin/realms/{realm}/users/{userId}/role-mappings/clients/{cid}",
                        props.getTargetRealm(), keycloakUserId, clientUuid)
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(List.of(roleMap))
                .retrieve()
                .toEntity(Void.class);
    }

    private void assignFrontendClientRoles(String keycloakUserId, List<String> roleNames, String token) throws Exception {
        for (String roleName : roleNames) {
            assignFrontendClientRole(keycloakUserId, roleName, token);
        }
    }

    private void replaceFrontendClientRoles(String keycloakUserId, List<String> roleNames, String token) throws Exception {
        String clientUuid = resolveFrontendClientUuid(token);
        String userRolesJson = client().get()
                .uri("/admin/realms/{realm}/users/{userId}/role-mappings/clients/{cid}",
                        props.getTargetRealm(), keycloakUserId, clientUuid)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);

        JsonNode assignedRoles = objectMapper.readTree(userRolesJson);
        if (assignedRoles.isArray() && !assignedRoles.isEmpty()) {
            List<Map<String, Object>> assignedRoleMaps = new ArrayList<>();
            for (JsonNode r : assignedRoles) {
                assignedRoleMaps.add(objectMapper.convertValue(r, new TypeReference<>() {
                }));
            }
            client().method(org.springframework.http.HttpMethod.DELETE)
                    .uri("/admin/realms/{realm}/users/{userId}/role-mappings/clients/{cid}",
                            props.getTargetRealm(), keycloakUserId, clientUuid)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(assignedRoleMaps)
                    .retrieve()
                    .toEntity(Void.class);
        }

        assignFrontendClientRoles(keycloakUserId, roleNames, token);
    }

    private String resolveFrontendClientUuid(String token) throws Exception {
        String path = "/admin/realms/{realm}/clients?clientId={cid}";
        String json = client().get()
                .uri(path, props.getTargetRealm(), props.getFrontendClientId())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(String.class);
        JsonNode arr = objectMapper.readTree(json);
        if (!arr.isArray() || arr.isEmpty() || !arr.get(0).has("id")) {
            throw new IllegalStateException("Client Keycloak introuvable : " + props.getFrontendClientId());
        }
        return arr.get(0).get("id").asText();
    }
}
