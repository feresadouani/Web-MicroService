# Micro-Service Platform

This repository contains a full microservice-based application with:

- Spring Boot microservices (business services)
- One NestJS microservice (`reclamation`)
- One Angular frontend
- Service discovery with Eureka
- Centralized configuration with Spring Cloud Config
- Dockerized deployment using `docker-compose`

## Architecture Overview

### Core infrastructure

- `eureka` - service registry (`:8761`)
- `Config` - centralized config server (`:8082`)
- `gateway` - API gateway (`:8081`)

### Business microservices

- `user` - user management
- `cours` - courses domain
- `Reservation` - reservations domain
- `events` - events domain
- `clubs` - clubs domain
- `reclamation` - NestJS reclamation service

### Frontend

- `frontend` - Angular application served with Nginx in Docker (`:4200`)

### Databases

- MySQL (`univer`) for Spring services
- MongoDB for NestJS reclamation service

## Tech Stack

- Java 17, Spring Boot, Spring Cloud
- NestJS (Node.js 20)
- Angular 18
- Docker & Docker Compose

## Run with Docker (recommended)

### 1) Build Spring Boot JARs

From repository root:

```powershell
./Config/mvnw -f ./Config/pom.xml clean package -DskipTests
./eureka/mvnw -f ./eureka/pom.xml clean package -DskipTests
./gateway/mvnw -f ./gateway/pom.xml clean package -DskipTests
./user/mvnw -f ./user/pom.xml clean package -DskipTests
./cours/mvnw -f ./cours/pom.xml clean package -DskipTests
./Reservation/mvnw -f ./Reservation/pom.xml clean package -DskipTests
./events/mvnw -f ./events/pom.xml clean package -DskipTests
./clubs/mvnw -f ./clubs/pom.xml clean package -DskipTests
```

### 2) Start all containers

```powershell
docker compose up -d --build
```

### 3) Verify services

```powershell
docker compose ps
docker compose logs -f eureka
```

## Main URLs

- Eureka dashboard: `http://localhost:8761`
- Config server: `http://localhost:8082`
- Gateway: `http://localhost:8081`
- Frontend: `http://localhost:4200`

## Notes

- Most Spring services load their runtime configuration from `Config/src/main/resources/configuration`.
- In Docker mode, service-to-service communication uses Docker service names (`eureka`, `config`, `mysql`, `mongo`, etc.).
- Authentication/Keycloak-related URLs are configured to support host access from containers via `host.docker.internal`.

## Team Workflow (suggested)

- Keep service configuration in Config Server files
- Build/test each service independently when needed
- Use Docker Compose for end-to-end integration testing

