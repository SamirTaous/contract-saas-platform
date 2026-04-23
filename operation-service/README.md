# Operation Service (Budget & Procurement)

The **Operation Service** is the functional core of the platform. It handles the complete lifecycle of government credits, from initial budget provisioning via Excel to the legal commitment of funds through public markets (Procurement).

##  Core Business Modules

### 1. Service Comptabilité (Budgetary Governance)

- **Automated Provisioning:** Extracts hierarchical budget lines from governmental Excel/CSV files using **Apache POI**.

- **Data Sanitization:** Robust parsing logic that handles inconsistent cell formats, leading zeros in codes, and ignores non-data rows (separators/headers).

- **Hierarchical Addressing:** Organizes funds using the official **Article.Paragraph.Line (APL)** nomenclature.

- **Transactional Upsert:** Intelligent import logic that detects existing codes and updates amounts or creates new records without duplicating data.


### 2. Service Marché (Procurement & Contracts)

- **Contract Lifecycle:** Manages the transition of procurement projects from DRAFT to SIGNED and COMPLETED.

- **Fund Commitment (Engagement):** Implements a "Locking" mechanism. Signing a contract automatically updates the linked Budget Line, moving funds from "Available" to "Committed."

- **Solvency Validation:** Prevents the creation or signature of contracts that exceed the organization's available budget.


##  Technical Features

- **Multi-tenant Isolation:** Every record is tagged with an organizationId. The service uses **Composite Unique Constraints** (full_code + organization_id) to allow different organizations to use the same budget codes without data collision.

- **Stateless JWT Security:** Bypasses database lookups for security by extracting a signed UserContext (Roles, OrgID, UUIDs) directly from the JWT.

- **Shadow ID Pattern:** Uses **UUIDs** for all public API endpoints and frontend navigation, keeping internal database IDs hidden.

- **Financial Precision:** Uses BigDecimal for all monetary calculations to ensure zero rounding errors, adhering to banking and accounting standards.


##  API Endpoints

### Budget Management (/api/budget)

|   |   |   |   |
|---|---|---|---|
|Method|Endpoint|Access|Description|
|POST|/import|ADMIN|Uploads Excel file and populates budget lines.|
|GET|/all|ADMIN / SUPER_ADMIN|Lists budget lines (Scoped to Org or Global).|
|GET|/search|USER / ADMIN|Filter budget by Article, Paragraph, or Type.|

### Market/Procurement (/api/markets)

|   |   |   |   |
|---|---|---|---|
|Method|Endpoint|Access|Description|
|POST|/create|ADMIN|Creates a new DRAFT market linked to a Budget Line.|
|PATCH|/{uuid}/sign|ADMIN|Signs contract and commits budget funds.|
|GET|/my-org|USER / ADMIN|Retrieves all contracts for the organization.|

##  Tech Stack

- **Backend:** Spring Boot 3, Spring Data JPA, Spring Security.

- **Database:** PostgreSQL (with Multi-tenant logical isolation).

- **Libraries:**

    - **Apache POI:** Excel file processing.

    - **JJWT:** JSON Web Token parsing.

    - **Lombok:** Boilerplate reduction.

- **Architecture:** Modular Monolith (Layered: Controller -> Service -> Repository).


##  Data Model (Current)

- **BudgetLine**: The financial reference (Initial, Committed, Spent).

- **Market**: The procurement entity (Title, Supplier, Total Amount, Status).

- **UserContext**: The cross-service security DTO