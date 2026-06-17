import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import BudgetTable from './components/BudgetTable';
import BudgetDashboard from './components/BudgetDashboard';
import BudgetLineDetails from './components/BudgetLineDetails';
import MarketManagement from './components/MarketManagement';
import ConstructionManagement from './components/ConstructionManagement';
import ConstructionProjects from './components/construction/ConstructionProjects';
import ConstructionDecomptes from './components/construction/ConstructionDecomptes';
import ProjectDetailsView from './components/construction/ProjectDetailsView';
import DecompteDetailsView from './components/construction/DecompteDetailsView';
import ActivityLogs from './components/ActivityLogs';
import Settings from './components/Settings';
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
            <Route path="construction" element={<ConstructionManagement />} />
            <Route path="construction/projects" element={<ConstructionProjects />} />
            <Route path="construction/projects/:id" element={<ProjectDetailsView />} />
            <Route path="construction/decomptes" element={<ConstructionDecomptes />} />
            <Route path="construction/decomptes/:id" element={<DecompteDetailsView />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
