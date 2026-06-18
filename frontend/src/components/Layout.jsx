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
  ChevronRight,
  Building,
  FileText,
  BarChart3,
  ChevronLeft,
  Hammer,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import { isAdmin } from '../utils/roles';
import axios from 'axios';

// Create API instance for organizations
const orgApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8081/api'
}));

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [organization, setOrganization] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [budgetSubmenuOpen, setBudgetSubmenuOpen] = useState(false);
  const location = useLocation();

  // Track route changes for loading state
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300); // Short loading time for smooth transition

    // Auto-open budget submenu if on budget pages
    if (location.pathname.startsWith('/budget')) {
      setBudgetSubmenuOpen(true);
    }

    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      fetchOrganizationInfo(user);
    }
  }, [user]);

  const fetchOrganizationInfo = async (userData) => {
    if (!isAdmin(userData)) {
      setOrganization({
        name: userData.orgName || 'Your Organization',
        type: 'Enterprise',
        description: 'Contract management organization',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await orgApi.get('/organizations/me');
      setOrganization(response.data);
    } catch (err) {
      console.error('Failed to fetch organization info:', err);
      if (userData) {
        setOrganization({
          name: userData.orgName || 'Your Organization',
          type: 'Enterprise',
          description: 'Contract management organization',
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
      description: 'Consulter votre équipe'
    },
    { 
      name: 'Gestion Budgétaire', 
      icon: DollarSign, 
      description: 'Lignes budgétaires & analyses',
      hasSubmenu: true,
      submenu: [
        {
          name: 'Lignes Budgétaires',
          href: '/budget',
          icon: FileText,
          description: 'Tableau des lignes budgétaires'
        },
        {
          name: 'Analyses & Graphiques',
          href: '/budget/analytics',
          icon: BarChart3,
          description: 'Visualisations et analyses'
        }
      ]
    },
    { 
      name: 'Marchés Publics', 
      href: '/markets', 
      icon: Building, 
      description: 'Contrats et marchés'
    },
    { 
      name: 'Gestion de Construction', 
      href: '/construction', 
      icon: Hammer, 
      description: 'Projets et décomptes'
    },
    { 
      name: 'Journal d\'Activité', 
      href: '/activity-logs', 
      icon: Activity, 
      adminOnly: true,
      description: 'Audit & conformité'
    },
    { 
      name: 'Paramètres', 
      href: '/settings', 
      icon: Settings,
      description: 'Configuration système'
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && user && !isAdmin(user)) {
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
      <div className={`fixed inset-y-0 left-0 z-50 bg-[#fafbfc] border-r border-gray-200/80 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64 backdrop-blur-xl`}>
        
        {/* Collapse/Expand Button - Desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 z-10 shadow-sm hover:shadow ${
            sidebarCollapsed ? 'rotate-180' : ''
          }`}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-3 w-3 text-gray-500" />
        </button>
        
        {/* Unified Profile + Organization Card */}
        <div className={`p-3 flex-shrink-0 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200">
              {/* Row 1 - User Identity */}
              <div className="p-3 pb-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center ring-2 ring-blue-100/50 ring-offset-1">
                        <span className="text-white text-sm font-semibold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
                        {user?.username}
                      </p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 uppercase tracking-wide mt-0.5">
                        {user?.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden lg:flex p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 -mr-1 -mt-0.5"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 -mr-1 -mt-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Row 2 - Quick Actions (subtle, secondary) */}
                <div className="flex items-center space-x-1 ml-12">
                  <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all duration-200 relative">
                    <Bell className="h-3.5 w-3.5" />
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Divider */}
              <div className="px-3">
                <div className="h-px bg-gray-100"></div>
              </div>
              
              {/* Row 3 - Organization Switcher */}
              {organization && (
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 rounded-b-lg group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-md flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[11px] font-semibold text-gray-700 truncate leading-snug">
                        {organization.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate leading-snug">
                        {organization.type || 'Workspace'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-all duration-200 flex-shrink-0 ${
                    orgDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
              )}
              
              {/* Organization dropdown content */}
              {orgDropdownOpen && organization?.description && (
                <div className="px-3 pb-3 pt-2">
                  <div className="p-2.5 bg-gray-50 rounded-md border border-gray-100">
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {organization.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed state */
            <div className="hidden lg:flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center ring-2 ring-blue-100 ring-offset-1 cursor-pointer hover:ring-blue-200 transition-all duration-200">
                  <span className="text-white text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#fafbfc] rounded-full"></div>
              </div>
              <div className="w-full h-px bg-gray-200"></div>
              {organization && (
                <div 
                  className="w-8 h-8 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-md flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                  title={organization.name}
                >
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="w-full h-px bg-gray-200"></div>
              <button 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all duration-200 relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-all duration-200"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Larger spacing before navigation */}
        <div className={`px-3 pt-1 pb-2 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 overflow-y-auto sidebar-scroll ${sidebarCollapsed ? 'lg:px-2' : 'px-3'}`}>
          {/* Main Section */}
          {!sidebarCollapsed && (
            <div className="px-3 mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Principal
              </p>
            </div>
          )}
          
          <div className="space-y-0.5">
            {filteredNavigation.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center rounded-lg transition-all duration-200 ${
                    sidebarCollapsed 
                      ? 'lg:justify-center lg:p-2.5' 
                      : 'px-3 py-2'
                  } text-sm font-medium relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  {isActive && !sidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full"></div>
                  )}
                  <div className={`flex items-center w-full ${
                    sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'
                  }`}>
                    <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} strokeWidth={2} />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0 lg:block">
                        <span className="truncate block">{item.name}</span>
                        {item.description && (
                          <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                            isActive ? 'text-blue-600/70' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
          
          {/* Divider */}
          <div className={`my-3 ${sidebarCollapsed ? 'px-0' : 'px-3'}`}>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </div>
          
          {/* Operations Section */}
          {!sidebarCollapsed && (
            <div className="px-3 mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Opérations
              </p>
            </div>
          )}
          
          <div className="space-y-0.5">
            {filteredNavigation.slice(2, 5).map((item) => {
              const Icon = item.icon;
              
              // Handle items with submenu (Budget)
              if (item.hasSubmenu) {
                const isActive = location.pathname.startsWith('/budget');
                
                return (
                  <div key={item.name}>
                    {sidebarCollapsed ? (
                      <div className="hidden lg:block">
                        <button
                          onClick={() => setSidebarCollapsed(false)}
                          className={`group flex items-center justify-center w-full p-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                          title={item.name}
                        >
                          <Icon className={`h-[18px] w-[18px] ${
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`} strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setBudgetSubmenuOpen(!budgetSubmenuOpen)}
                          className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full"></div>
                          )}
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                            }`} strokeWidth={2} />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="truncate block">{item.name}</span>
                              {item.description && (
                                <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                                  isActive ? 'text-blue-600/70' : 'text-gray-500'
                                }`}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            budgetSubmenuOpen ? 'rotate-90' : ''
                          } ${isActive ? 'text-blue-600' : 'text-gray-400'}`} strokeWidth={2} />
                        </button>
                        
                        {/* Submenu */}
                        {budgetSubmenuOpen && (
                          <div className="mt-1 ml-6 pl-3 border-l-2 border-gray-200 space-y-0.5">
                            {item.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const subIsActive = location.pathname === subItem.href;
                              
                              return (
                                <NavLink
                                  key={subItem.name}
                                  to={subItem.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`group flex items-center px-3 py-1.5 text-sm rounded-lg transition-all duration-200 relative ${
                                    subIsActive
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                  }`}
                                >
                                  {subIsActive && (
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-600 rounded-r-full"></div>
                                  )}
                                  <div className="flex items-center space-x-2.5 w-full">
                                    <SubIcon className={`h-[16px] w-[16px] flex-shrink-0 ${
                                      subIsActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} strokeWidth={2} />
                                    <div className="flex-1 min-w-0">
                                      <span className="truncate block text-[13px]">{subItem.name}</span>
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }
              
              // Handle regular navigation items
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center rounded-lg transition-all duration-200 ${
                    sidebarCollapsed 
                      ? 'lg:justify-center lg:p-2.5' 
                      : 'px-3 py-2'
                  } text-sm font-medium relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  {isActive && !sidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full"></div>
                  )}
                  <div className={`flex items-center w-full ${
                    sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'
                  }`}>
                    <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} strokeWidth={2} />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0 lg:block">
                        <span className="truncate block">{item.name}</span>
                        {item.description && (
                          <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                            isActive ? 'text-blue-600/70' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
          
          {/* Divider */}
          <div className={`my-3 ${sidebarCollapsed ? 'px-0' : 'px-3'}`}>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </div>
          
          {/* System Section */}
          {!sidebarCollapsed && (
            <div className="px-3 mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Système
              </p>
            </div>
          )}
          
          <div className="space-y-0.5">
            {filteredNavigation.slice(5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center rounded-lg transition-all duration-200 ${
                    sidebarCollapsed 
                      ? 'lg:justify-center lg:p-2.5' 
                      : 'px-3 py-2'
                  } text-sm font-medium relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  {isActive && !sidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full"></div>
                  )}
                  <div className={`flex items-center w-full ${
                    sidebarCollapsed ? 'lg:justify-center' : 'space-x-3'
                  }`}>
                    <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} strokeWidth={2} />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0 lg:block">
                        <span className="truncate block">{item.name}</span>
                        {item.description && (
                          <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                            isActive ? 'text-blue-600/70' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom spacer - no content needed */}
        <div className="flex-shrink-0 p-4"></div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200/80 px-4 py-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">
                {organization?.name || 'Dashboard'}
              </span>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 relative">
          {pageLoading ? (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Chargement...</p>
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