import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import BudgetTable from './components/BudgetTable';
import BudgetDashboard from './components/BudgetDashboard';
import BudgetLineDetails from './components/BudgetLineDetails';
import MarketManagement from './components/MarketManagement';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="budget" element={<BudgetTable />} />
            <Route path="budget/analytics" element={<BudgetDashboard />} />
            <Route path="budget/line/:id" element={<BudgetLineDetails />} />
            <Route path="markets" element={<MarketManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
