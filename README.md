# ContractSaaS - Intelligent Management Platform

A professional full-stack SaaS platform designed for multi-tenant budgetary governance and contract management. This project implements a stateless microservices architecture with a modern React frontend.

## System Architecture
The platform is built on three main pillars:
1. **Identity Provider (Auth Service - 8081):** Manages user lifecycles, organizations, and issues secure JWT "passports."
2. **Operation Service (Budget Service - 8082):** Handles governmental budget provisioning, hierarchical data parsing, and multi-tenant financial isolation.
3. **SaaS Dashboard (Frontend - 5173):** A responsive React application featuring real-time financial tracking and administrative controls.

## Technical Implementation & Security
- **Stateless JWT Security:** Unified authentication across all microservices using cryptographically signed tokens containing UserContext (Roles, OrgID, UUIDs).
- **Multi-tenant Data Isolation:** Implemented at the database level using composite unique constraints and logical discriminator columns.
- **Budgetary Intelligence:** Automated Excel parsing using Apache POI with robust data sanitization and accumulation logic (Upsert).
- **Shadow IDs:** All public API exposures utilize UUIDs to prevent ID enumeration and Direct Object Reference (IDOR) attacks.
- **Modern UI/UX:** Built with React 18 and Tailwind CSS, featuring conditional rendering, protected routing, and data visualization.

## Project Structure
- `/services/auth-service`: User authentication & RBAC. [Details](./services/auth-service/README.md)
- `/services/operation-service`: Budget provisioning & Excel parsing. [Details](./services/operation-service/README.md)
- `/frontend`: React & Tailwind interface. [Details](./frontend/README.md)

## Getting Started

### Prerequisites
- Java 17+ & Maven
- Node.js 18+
- PostgreSQL database named `smart_contract_db`

### Execution Order
1. **Database:** Ensure PostgreSQL is running.
2. **Back-end:** 
   - Run `AuthServiceApplication` (8081)
   - Run `OperationServiceApplication` (8082)
3. **Front-end:**
   - Navigate to `/frontend`
   - Run `npm install` then `npm run dev` (5173)

