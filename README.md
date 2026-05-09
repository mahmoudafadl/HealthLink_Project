# HealthLink

Healthcare Management System built using:

- Java
- Spring Boot
- Spring Cloud
- Eureka Discovery Server
- API Gateway
- Config Server
- MySQL
- Docker
- HTML / CSS / JavaScript

## Architecture

1. User opens frontend
2. Frontend sends request to API Gateway
3. Gateway discovers services via Eureka
4. Gateway routes request to target service
5. Services load configuration from Config Server
6. Services communicate داخل Docker Network
7. Data stored in MySQL

## Services

1. Eureka Server (8761)
2. Config Server (8888)
3. API Gateway (8080)
4. Backend Service (8082)
5. Notification Service (8081)
6. MySQL Container (3313)

## Run Project

```bash
docker compose up --build
