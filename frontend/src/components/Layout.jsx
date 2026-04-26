import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X,
  Home,
  ChevronDown,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import axios from 'axios';

// Create API instance for organizations
const orgApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8081/api'
}));

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const location = useLocation();

  // Track route changes for loading state
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300); // Short loading time for smooth transition

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      fetchOrganizationInfo(user);
    }
  }, [user]);

  const fetchOrganizationInfo = async (userData) => {
    try {
      const response = await orgApi.get('/organizations/me');
      setOrganization(response.data);
    } catch (err) {
      console.error('Failed to fetch organization info:', err);
      // Fallback organization info
      if (userData) {
        setOrganization({
          name: userData.orgName || 'Your Organization',
          type: 'Enterprise',
          description: 'Contract management organization'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
  };

  const navigation = [
    { 
      name: 'Tableau de Bord', 
      href: '/dashboard', 
      icon: Home,
      description: 'Vue d\'ensemble et analyses'
    },
    { 
      name: 'Membres de l\'Équipe', 
      href: '/users', 
      icon: Users,
      description: 'Gérer votre équipe'
    },
    { 
      name: 'Gestion Budgétaire', 
      href: '/budget', 
      icon: DollarSign, 
      adminOnly: true,
      description: 'Service Comptabilité'
    },
    { 
      name: 'Marchés Publics', 
      href: '/markets', 
      icon: Building, 
      adminOnly: true,
      description: 'Service Marché'
    },
    { 
      name: 'Paramètres', 
      href: '/settings', 
      icon: Settings,
      description: 'Configuration système'
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && user && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-inter">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-inter">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Sidebar - Fixed position */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>
        
        {/* User Profile Section - Top */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Organization Workspace Switcher */}
        {organization && (
          <div className="px-3 py-4 border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {organization.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {organization.type || 'Espace de travail'}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                orgDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Organization dropdown content */}
            {orgDropdownOpen && organization.description && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  {organization.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center space-x-3 w-full">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.description && (
                        <p className={`text-xs truncate ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom spacer - no content needed */}
        <div className="flex-shrink-0 p-4"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-900">Dashboard</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 relative">
          {pageLoading ? (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;