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

Frontend → API Gateway → Backend Services

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
