package com.example.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;



@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter) {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeExchange(exchange -> exchange
                        /* Preflight CORS: pas de JWT sur OPTIONS — sinon 401 sans en-têtes CORS */
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        /* Santé du microservice reclamation (routé par la gateway) — sans JWT pour Postman / probes */
                        .pathMatchers(HttpMethod.GET, "/health").permitAll()
                        .pathMatchers("/public/**").permitAll()
                        /* Keycloak : rôle client client_admin → ROLE_CLIENT_ADMIN */
                        .pathMatchers("/admin/**").hasRole("CLIENT_ADMIN")
                        /* Aligné sur le microservice user: JWT valide suffit (évite 403 si rôles uniquement client-side Keycloak) */
                        .pathMatchers("/users/**").authenticated()
                        .anyExchange().authenticated()
                )
                /*
                 * Pas de @Bean JwtDecoder ici : en WebFlux il est bloquant et casse la validation JWT (401).
                 * spring.security.oauth2.resourceserver.jwt.issuer-uri fournit un ReactiveJwtDecoder adapté.
                 */
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                )
                .build();
    }
    @Bean
    public ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(this::extractKeycloakAuthorities);
        return new ReactiveJwtAuthenticationConverterAdapter(jwtAuthenticationConverter);
    }

    /**
     * Keycloak : rôles realm dans {@code realm_access.roles}, rôles client souvent dans
     * {@code resource_access.&lt;clientId&gt;.roles} (ex. client public {@code frontend}).
     */
    private Collection<GrantedAuthority> extractKeycloakAuthorities(Jwt jwt) {
        Set<String> roleNames = new LinkedHashSet<>();
        addRolesFromMap(jwt.getClaimAsMap("realm_access"), roleNames);
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            for (Object clientVal : resourceAccess.values()) {
                if (clientVal instanceof Map<?, ?> m) {
                    Object rolesObj = m.get("roles");
                    addRoleStrings(rolesObj, roleNames);
                }
            }
        }
        return roleNames.stream()
                .map(String::toUpperCase)
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.replace('-', '_')))
                .collect(Collectors.toCollection(ArrayList::new));
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

    /**
     * Source CORS utilisée par {@link ServerHttpSecurity#cors(Customizer)} (WebFlux).
     * Évite le doublon CorsWebFilter + assure l’ordre correct avec la chaîne de sécurité.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}
