import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import BudgetDashboard from './components/BudgetDashboard';
import './App.css';

// Protected routes wrapper that uses Layout
function ProtectedLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="budget" element={<BudgetDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
