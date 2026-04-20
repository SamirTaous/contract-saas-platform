import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  FileText,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/auth');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { name: 'Active Contracts', value: '24', change: '+12%', icon: FileText, color: 'blue' },
    { name: 'Team Members', value: '8', change: '+2', icon: Users, color: 'green' },
    { name: 'Pending Reviews', value: '3', change: '-1', icon: Clock, color: 'yellow' },
    { name: 'Completed', value: '156', change: '+8%', icon: CheckCircle, color: 'purple' },
  ];

  const recentActivity = [
    { action: 'Contract signed', contract: 'Service Agreement #2024-001', time: '2 hours ago' },
    { action: 'Review requested', contract: 'NDA Template Update', time: '4 hours ago' },
    { action: 'New team member', contract: 'Sarah Johnson joined', time: '1 day ago' },
    { action: 'Contract expired', contract: 'Vendor Agreement #2023-045', time: '2 days ago' },
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your contracts today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            purple: 'bg-purple-50 text-purple-600',
          };

          return (
            <div key={stat.name} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02]">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">Create New Contract</span>
            </button>
            
            <button 
              onClick={() => navigate('/users')}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02]"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">View Team Members</span>
            </button>
            
            <button 
              onClick={() => navigate('/budget')}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02]"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-gray-700 font-medium">Budget Management</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02]">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">View Analytics</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02]">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-gray-700 font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span> - {activity.contract}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;