# Auth Service (Identity & Access Management)

## Features
- **Multi-tenant Registration:** Users can create a new Organization (assigned as `ADMIN`) or join an existing one using a unique `Invite Code` (assigned as `USER`).
- **Secure Login:** Validates credentials and issues a signed JWT containing User UUID, Role, and Organization context.
- **Shadow IDs:** Uses `UUID` for all public API exposures to prevent ID enumeration attacks.
- **Global Exception Handling:** Custom business exceptions are mapped to standard REST status codes (401, 403, 404).

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user/org. Returns success message + Invite Code. |
| `POST` | `/api/auth/login` | Authenticate user. Returns `{ "token": "..." }`. |

### Protected Endpoints (Requires Bearer Token)
| Method   | Endpoint | Required Role | Description                   |
|:---------| :--- |:--------------|:------------------------------|
| `GET`    | `/api/users/all` | `ADMIN`       | List all users in the system. |
| `DELETE` | `/api/users/{uuid}` | `ADMIN`       | Remove a user by their UUID.  |
| `GET`    | `/api/users/{uuid}` | `ADMIN`       | List a user by their UUID.    |

## Testing with Postman
1. Register a user via `/api/auth/register`.
2. Login via `/api/auth/login` to receive the JWT.
3. For protected calls, add the header: `Authorization: Bearer <your_token>`.