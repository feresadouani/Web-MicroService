package com.example.user.keycloak;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Compte d’administration Keycloak (realm {@code master}, client {@code admin-cli} par défaut).
 * À sécuriser en prod (secrets, compte de service dédié).
 */
@Data
@ConfigurationProperties(prefix = "keycloak.admin")
public class KeycloakAdminProperties {

    private boolean enabled = true;
    private String serverUrl = "http://localhost:8080";

    /**
     * {@code password} = admin-cli + login/mot de passe admin Keycloak (realm {@link #tokenRealm}).<br>
     * {@code client_credentials} = client confidentiel + secret (recommandé si Direct Access Grants est désactivé).
     */
    private String grantType = "password";

    /** Realm du endpoint token (vide = même valeur que {@link #adminRealm}). */
    private String tokenRealm = "";

    /** @deprecated utiliser {@link #tokenRealm} */
    private String adminRealm = "master";

    /** Compte admin Keycloak (realm master), si {@link #grantType} = {@code password}. */
    private String username = "admin";
    private String password = "admin";

    /** Client confidentiel si {@link #grantType} = {@code client_credentials}. */
    private String tokenClientId = "";
    private String tokenClientSecret = "";

    /** Realm applicatif où créent les utilisateurs finaux (API Admin sur /admin/realms/…). */
    private String targetRealm = "spring";
    /** Client dont on assigne les rôles {@code client_user} / {@code client_admin}. */
    private String frontendClientId = "frontend";

    public String getTokenRealm() {
        if (tokenRealm != null && !tokenRealm.isBlank()) {
            return tokenRealm;
        }
        return adminRealm != null && !adminRealm.isBlank() ? adminRealm : "master";
    }
}
