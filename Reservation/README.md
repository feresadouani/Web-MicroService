# Reservation Service

A Spring Boot microservice for managing event reservations with Keycloak authentication and OAuth2 security.

## Architecture

```
com.example.reservation/
├── entity/
│   ├── Reservation.java
│   └── ReservationStatus.java
├── repository/
│   └── ReservationRepository.java
├── service/
│   └── ReservationService.java
├── controller/
│   └── ReservationController.java
├── security/
│   └── SecurityConfig.java
└── ReservationApplication.java
```

## Features

- **Full CRUD REST API** for reservations
- **MySQL Database** integration with JPA/Hibernate
- **Keycloak OAuth2 Security** for token-based authentication
- **Eureka Service Discovery** for microservice communication
- **Spring Cloud Config** server integration
- **Reservation Status Management** (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- **Role-Based Access Control** (User, Admin)

## Prerequisites

- Java 17+
- Maven 3.9+
- MySQL 8.0+
- Keycloak 23.0.0+
- Spring Cloud Config Server running on port 8082
- Eureka Server running on port 8761

## Database Configuration

The service uses MySQL with the following default properties (can be overridden in Config Server):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/univer?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
```

## Running the Service

### Development Mode

```bash
./mvnw spring-boot:run
```

### Production Build

```bash
./mvnw clean package
java -jar target/reservation-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### GET Endpoints

- `GET /reservations` - Get all reservations (Admin only)
- `GET /reservations/{id}` - Get reservation by ID
- `GET /reservations/user/my-reservations` - Get current user's reservations (Authenticated)
- `GET /reservations/user/{userId}` - Get reservations by user ID (Admin)
- `GET /reservations/event/{eventId}` - Get reservations by event ID
- `GET /reservations/status/{status}` - Get reservations by status
- `GET /reservations/event/{eventId}/confirmed-count` - Get confirmed reservations count
- `GET /reservations/check/{userId}/{eventId}` - Check if user has reserved event

### POST Endpoints

- `POST /reservations` - Create new reservation
  - Required fields: `userId`, `eventId`, `reservationDate`
  - Optional fields: `status`, `notes`

### PUT Endpoints

- `PUT /reservations/{id}` - Update reservation

### PATCH Endpoints

- `PATCH /reservations/{id}/status?status=CONFIRMED` - Update reservation status
- `PATCH /reservations/{id}/confirm` - Confirm reservation (shortcut)
- `PATCH /reservations/{id}/cancel` - Cancel reservation (shortcut)

### DELETE Endpoints

- `DELETE /reservations/{id}` - Delete reservation (Admin only)

## Reservation Entity

```java
{
  "id": 1,
  "userId": 1,
  "eventId": 1,
  "reservationDate": "2026-04-21T14:00:00",
  "status": "PENDING",
  "notes": "VIP seating preferred",
  "createdAt": "2026-04-14T10:30:00",
  "updatedAt": "2026-04-14T10:30:00"
}
```

## Security & Keycloak Configuration

The service requires:

1. **Keycloak Running**: http://localhost:8080
2. **Realm**: `spring`
3. **Client Roles**: `CLIENT_USER`, `CLIENT_ADMIN`
4. **OAuth2 JWT Issuer**: http://localhost:8080/realms/spring

### User Roles

- **CLIENT_USER**: Can view and create their own reservations
- **CLIENT_ADMIN**: Can manage all reservations

## Status Transitions

- `PENDING` → `CONFIRMED` (by admin or user)
- `PENDING` → `CANCELLED` (by admin or user)
- `CONFIRMED` → `COMPLETED` (by admin)
- `CONFIRMED` → `CANCELLED` (by admin)

## Integration with Other Services

- **User Service**: References user IDs (manage separately)
- **Event Service**: References event IDs (manage separately)
- **Eureka Discovery**: Automatic service registration
- **Config Server**: Centralized property management

## Testing

Run unit tests:

```bash
./mvnw test
```

## Troubleshooting

### Service not starting?
- Check MySQL connection
- Verify Config Server is running (port 8082)
- Verify Eureka is running (port 8761)
- Check Keycloak is running (port 8080)

### Authorization errors?
- Ensure JWT token is included in Authorization header: `Authorization: Bearer {token}`
- Verify user has required roles in Keycloak

### Database errors?
- Ensure database `univer` exists
- Check MySQL credentials in Config Server properties
- Verify tables are created (should auto-create on startup)

## Contributing

Follow the existing service architecture:
- Use Lombok annotations for entities
- Implement custom query methods in repository
- Add comprehensive business logic in service
- Use proper HTTP methods in controllers
- Add security annotations for endpoints
