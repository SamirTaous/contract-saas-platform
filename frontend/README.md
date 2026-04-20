ContractSaaS - Frontend Application

This is the React-based frontend for the Smart Contract SaaS Platform. It provides a high-performance, responsive interface for managing multi-tenant organizational structures and budgetary governance.
UI Overview

The application follows a modern Enterprise SaaS aesthetic, focusing on data clarity and user efficiency.

    Unified Dashboard: Real-time financial summary cards (Total Budget, Committed, Remaining).

    Budgetary Governance: Automated Excel provisioning and hierarchical budget line tracking.

    Team Management: Role-based member listing and administrative controls.

    Secure Authentication: Dual-mode registration (Create Org vs. Join Team) and protected session management.

Tech Stack

    Core: React 18 + Vite (Lightning-fast build tool).

    Styling: Tailwind CSS (Utility-first CSS for custom UI).

    Routing: React Router 6 (Client-side navigation and Protected Routes).

    HTTP Client: Axios (Centralized API management with JWT interceptors).

    Icons: Lucide React (Consistent, high-quality stroke icons).

Key Features

    Stateless JWT Authentication: Securely stores and manages tokens in localStorage with automated headers for API requests.

    Multi-tenant Logic: The UI dynamically adapts based on the UserContext (Org Name, Role, Permissions).

    Data Visualization: Custom budget utilization progress bars and financial health indicators.

    Bulk Provisioning: Drag-and-drop Excel upload interface for initializing organization budgets.

    Role-Based UI: Specific views and actions restricted to USER, ADMIN, or SUPER_ADMIN.

Project Structure
code Text

frontend/
├── src/
│   ├── api/              # Axios instances and API definitions
│   ├── components/       # Reusable UI elements (Buttons, Inputs, Sidebar)
│   ├── pages/            # Main views (Login, Dashboard, Budget, Team)
│   ├── hooks/            # Custom logic (Auth state, Data fetching)
│   ├── context/          # Global UserContext state management
│   ├── App.jsx           # Main routing and layout configuration
│   └── main.jsx          # Application entry point
├── tailwind.config.js    # Design system configuration
└── vite.config.js        # Build tool settings

Getting Started
Prerequisites

    Node.js (v18 or higher)

    Back-end microservices running on ports 8081 and 8082.

Installation

    Navigate to the frontend directory:
    code Bash

    cd frontend

    Install dependencies:
    code Bash

    npm install

    Launch the development server:
    code Bash

    npm run dev

    Access the application at http://localhost:5173.