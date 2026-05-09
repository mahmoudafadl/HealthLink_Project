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

---

## System Architecture

1. User opens frontend
2. Frontend sends requests to API Gateway
3. Gateway discovers services through Eureka Server
4. Gateway routes requests to target microservices
5. Services load centralized configuration from Config Server
6. Services communicate inside the Docker network
7. Data is stored in MySQL container

---

## Services & Ports

| Service | Port |
|---------|------|
| Eureka Server | 8761 |
| Config Server | 8888 |
| API Gateway | 8080 |
| Backend Service | 8082 |
| Notification Service | 8081 |
| MySQL Container | 3313 |
| Frontend | 5500 |

---

## How to Run

Start all containers:

```bash
docker compose up --build
```

---

## Access URLs

### Frontend

```text
http://127.0.0.1:5500/HealthLink_Frontend_Enhanced/HealthLink/index.html
```

### Eureka Dashboard

```text
http://localhost:8761
```

### Config Server

```text
http://localhost:8888/application/default
```

### API Gateway

```text
http://localhost:8080
```

---

## Features

- Authentication & Authorization
- Patient Dashboard
- Doctor Dashboard
- Nurse Dashboard
- Admin Dashboard
- SuperAdmin Dashboard
- Notification System
- Appointment Management
- Home Services
- Wallet & Payments
- Emergency Services

---

## Deployment

This project is fully containerized using Docker and supports microservices deployment with Spring Cloud.

---

## Academic Project

Software Engineering Project  
Hospital Management System
