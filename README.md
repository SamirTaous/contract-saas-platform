# ContractSaaS - Intelligent Management Platform

A professional full-stack SaaS platform designed for multi-tenant budgetary governance and contract management. This project implements a stateless microservices architecture with a modern React frontend.

## System Architecture
The platform is built on four main pillars:
1. **Identity Provider (Auth Service - 8081):** Manages user lifecycles, organizations, and issues secure JWT "passports."
2. **Operation Service (Budget Service - 8082):** Handles governmental budget provisioning, hierarchical data parsing, and multi-tenant financial isolation.
3. **Audit Service (8083):** Consumes user activity events from RabbitMQ and persists them for compliance and monitoring.
4. **SaaS Dashboard (Frontend - 5173):** A responsive React application featuring real-time financial tracking and administrative controls.

## Technical Implementation & Security
- **Stateless JWT Security:** Unified authentication across all microservices using cryptographically signed tokens containing UserContext (Roles, OrgID, UUIDs).
- **Multi-tenant Data Isolation:** Implemented at the database level using composite unique constraints and logical discriminator columns.
- **Budgetary Intelligence:** Automated Excel parsing using Apache POI with robust data sanitization and accumulation logic (Upsert).
- **Shadow IDs:** All public API exposures utilize UUIDs to prevent ID enumeration and Direct Object Reference (IDOR) attacks.
- **User Activity Logging:** Asynchronous audit trail via RabbitMQ — auth and operation services publish API activity events; the audit service stores them in PostgreSQL.
- **Modern UI/UX:** Built with React 18 and Tailwind CSS, featuring conditional rendering, protected routing, and data visualization.

## Project Structure
- `/auth-service`: User authentication & RBAC.
- `/operation-service`: Budget provisioning & Excel parsing.
- `/audit-service`: User activity logging consumer & query API.
- `/frontend`: React & Tailwind interface.

## Getting Started

### Prerequisites
- Java 17+ & Maven
- Node.js 18+
- PostgreSQL database named `smart_contract_db`
- Docker (for RabbitMQ)

### Build all backend modules
From the repository root:
```bash
mvn clean install
```

Run a single module:
```bash
mvn spring-boot:run -pl audit-service
mvn spring-boot:run -pl auth-service
mvn spring-boot:run -pl operation-service
```

### Execution Order
1. **Database:** Ensure PostgreSQL is running.
2. **RabbitMQ:** Start the message broker:
   ```bash
   docker compose up -d
   ```
   Management UI: http://localhost:15672 (guest / guest)
3. **Back-end:**
   - Run `AuthServiceApplication` (8081)
   - Run `OperationServiceApplication` (8082)
   - Run `AuditServiceApplication` (8083)
4. **Front-end:**
   - Navigate to `/frontend`
   - Run `npm install` then `npm run dev` (5173)

