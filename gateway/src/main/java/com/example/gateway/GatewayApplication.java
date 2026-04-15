package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
    @Bean
    public RouteLocator getRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("users",
                        r -> r.path("/users/**")
                                .uri("lb://user-service"))
            .route("cours",
                r->r.path("/cours/**")
                    .uri("lb://cours"))
                .route("events", r -> r.path("/events/**", "/api/events", "/api/events/**")
                        .filters(f -> f
                                .rewritePath("/api/events$", "/events")
                                .rewritePath("/api/events/(?<segment>.*)", "/events/${segment}"))
                        .uri("lb://events"))
                .route("reclamations", r -> r.path("/reclamations/**")
                        .uri("lb://reclamation-service"))
                .build();
    }
}
