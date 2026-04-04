# Smart Contract SaaS Platform - Core Identity

This repository contains the microservices architecture for an intelligent contract management platform.

## System Architecture
The platform follows a **Stateless Microservices** pattern.
- **Identity Provider (Auth Service):** Centralized service for user authentication, organization management, and security token issuance.
- **API Gateway (Planned):** Central entry point for routing and global security.

## Security Implementation
- **Authentication:** Stateless JWT (JSON Web Tokens).
- **Password Safety:** BCrypt hashing (Adaptive salting).
- **Authorization:** Role-Based Access Control (RBAC).
- **Multi-tenancy:** Logical isolation via `Organization` entities and `Invite Codes`.

## Getting Started
1. **Database:** Create a PostgreSQL database named `smart_contract_db`.
2. **Configuration:** Update `application.properties` with your DB credentials.
3. **Execution:** Run `AuthServiceApplication.java` (Port 8081).