# Procurement Management (Service Marché)

## Overview
The MarketManagement component provides a comprehensive interface for managing procurement contracts and market operations within the SaaS dashboard.

## Features

### 1. Create New Market Form
- **Professional Modal Design**: Clean, modern form layout with proper validation
- **Fields**:
  - Title (Text, required)
  - Supplier Name (Text, required)
  - Total Amount (Currency/Number, required)
- **Smart Budget Line Dropdown**: Searchable select component with real-time filtering
- **Validation**: Ensures total amount doesn't exceed available budget balance

### 2. Smart Budget Line Selection
- **Display Format**: Shows `fullCode` (e.g., MDD.900.10.79) + `initialAmount`
- **Search Functionality**: Real-time filtering by code or label
- **Value Handling**: Sends `budgetLineUuid` to API
- **Available Balance**: Shows remaining budget after committed amounts

### 3. Market Overview Table
- **Columns**: Title, Supplier, Amount, Linked Budget, Status, Actions
- **Status Badges**:
  - `DRAFT`: Gray badge
  - `SIGNED`: Blue badge with Shield icon
- **Actions**: "Approve & Sign" button for DRAFT status markets

### 4. Currency Support
- **Primary**: Moroccan Dirham (MAD) formatting
- **Formatting**: Uses `Intl.NumberFormat` with 'fr-MA' locale for proper localization
- **Display**: All monetary values are shown in MAD throughout the application

## API Integration

### Endpoints Used
- `GET /api/budget/all`: Fetch available budget lines
- `GET /api/markets/my-org`: List existing contracts
- `POST /api/markets/create`: Create new contract
- `PATCH /api/markets/{uuid}/sign`: Sign and commit funds

### Authentication
All requests include `Authorization: Bearer <token>` header from localStorage.

## Technical Implementation

### Dependencies
- React 19.2.4
- Lucide React icons
- Axios for API calls
- Tailwind CSS for styling

### Key Components
- **Form Validation**: Real-time validation with error display
- **Loading States**: Skeleton loading and spinner states
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### State Management
- Local state for form data, markets list, and budget lines
- Real-time updates after API operations
- Optimistic UI updates for better UX

## Usage

1. **Navigation**: Access via `/markets` route (admin-only)
2. **Creating Markets**: Click "Create New Market" button
3. **Budget Selection**: Search and select appropriate budget line
4. **Validation**: Form validates amounts against available budget
5. **Signing**: Use "Approve & Sign" for DRAFT contracts

## Security & Permissions
- Admin-only access (`ADMIN` or `SUPER_ADMIN` roles)
- JWT token validation on all API calls
- Budget validation prevents overspending

## Styling
- Tailwind CSS utility classes
- Consistent with existing dashboard design
- Professional color scheme (blue primary, gray neutrals)
- Responsive breakpoints for mobile/tablet/desktop