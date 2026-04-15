package com.example.user.keycloak;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "keycloak.admin")
public class KeycloakAdminProperties {

    private boolean enabled = true;
    private String serverUrl = "http://localhost:8080";

    private String grantType = "password";

    private String tokenRealm = "";


    private String adminRealm = "master";

    private String username = "admin";
    private String password = "admin";


    private String tokenClientId = "";
    private String tokenClientSecret = "";


    private String targetRealm = "spring";
    private String frontendClientId = "frontend";

    public String getTokenRealm() {
        if (tokenRealm != null && !tokenRealm.isBlank()) {
            return tokenRealm;
        }
        return adminRealm != null && !adminRealm.isBlank() ? adminRealm : "master";
    }
}
