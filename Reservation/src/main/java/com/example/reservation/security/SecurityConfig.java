package com.example.reservation.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

import java.util.*;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    /**
     * Configure HTTP security with OAuth2 JWT and Keycloak role mapping
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/", "/index.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // User endpoints - authenticated users can access their own reservations
                .requestMatchers(HttpMethod.GET, "/reservations/user/my-reservations").authenticated()
                
                // Admin endpoints - admin role required
                .requestMatchers(HttpMethod.GET, "/reservations").hasAnyRole("CLIENT_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/reservations/**").hasAnyRole("CLIENT_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/reservations").hasAnyRole("CLIENT_ADMIN", "CLIENT_USER")
                .requestMatchers(HttpMethod.PUT, "/reservations/**").hasAnyRole("CLIENT_ADMIN", "CLIENT_USER")
                .requestMatchers(HttpMethod.PATCH, "/reservations/**").hasAnyRole("CLIENT_ADMIN", "CLIENT_USER")
                .requestMatchers(HttpMethod.DELETE, "/reservations/**").hasRole("CLIENT_ADMIN")
                
                // All other authenticated
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        return http.build();
    }

    /**
     * Password encoder for user credentials
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Convert JWT to Spring Security Authentication with Keycloak roles
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(this::extractKeycloakAuthorities);
        return jwtConverter;
    }

    private Collection<GrantedAuthority> extractKeycloakAuthorities(Jwt jwt) {
        Set<String> roleNames = new LinkedHashSet<>();
        addRolesFromMap(jwt.getClaimAsMap("realm_access"), roleNames);
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            for (Object clientVal : resourceAccess.values()) {
                if (clientVal instanceof Map<?, ?> m) {
                    addRoleStrings(m.get("roles"), roleNames);
                }
            }
        }
        if (roleNames.isEmpty()) {
            return Collections.emptyList();
        }
        return roleNames.stream()
                .map(String::toUpperCase)
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.replace('-', '_')))
                .collect(Collectors.toList());
    }

    private static void addRolesFromMap(Map<String, Object> map, Set<String> out) {
        if (map == null) {
            return;
        }
        addRoleStrings(map.get("roles"), out);
    }

    private static void addRoleStrings(Object rolesObject, Set<String> out) {
        if (!(rolesObject instanceof List<?> roles)) {
            return;
        }
        for (Object r : roles) {
            if (r instanceof String s && !s.isBlank()) {
                out.add(s);
            }
        }
    }
}
