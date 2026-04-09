package com.example.user.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/users/admin/**").hasRole("CLIENT_ADMIN")
                        .requestMatchers("/users/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

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