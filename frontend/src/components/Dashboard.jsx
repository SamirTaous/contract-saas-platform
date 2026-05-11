import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  DollarSign,
  Users,
  FileText,
  Settings,
  BarChart3,
  AlertTriangle,
  Activity,
  RefreshCw,
  Upload,
  Eye,
  PieChart
} from 'lucide-react';
import { designSystem } from '../styles/designSystem';
import StatCard from './ui/StatCard';
import Button from './ui/Button';
import Card from './ui/Card';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import api from '../api';

// API instances
const budgetApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/budget'
}));

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/auth');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch budget data
      const budgetResponse = await budgetApi.get('/all');
      const budgetLines = budgetResponse.data;

      // Calculate budget statistics
      const totalBudget = budgetLines.reduce((sum, line) => sum + (line.initialAmount || 0), 0);
      const totalCommitted = budgetLines.reduce((sum, line) => sum + (line.committedAmount || 0), 0);
      const totalSpent = budgetLines.reduce((sum, line) => sum + (line.spentAmount || 0), 0);
      const totalRemaining = totalBudget - totalCommitted;
      const utilizationRate = totalBudget > 0 ? (totalCommitted / totalBudget) * 100 : 0;

      // Count budget lines by type
      const mddLines = budgetLines.filter(line => line.type === 'MDD').length;
      const invLines = budgetLines.filter(line => line.type === 'INV').length;

      // Find critical budget lines (>90% utilization)
      const criticalLines = budgetLines.filter(line => {
        const util = line.initialAmount > 0 ? (line.committedAmount / line.initialAmount) * 100 : 0;
        return util > 90;
      }).length;

      setBudgetData({
        totalBudget,
        totalCommitted,
        totalSpent,
        totalRemaining,
        utilizationRate,
        totalLines: budgetLines.length,
        mddLines,
        invLines,
        criticalLines,
        budgetLines: budgetLines.slice(0, 5) // Top 5 for recent activity
      });

      // Fetch user data
      try {
        const usersResponse = await api.get('/users/all');
        const users = usersResponse.data;

        setUserData({
          totalUsers: users.length,
          activeUsers: users.filter(u => u.enabled !== false).length,
          adminUsers: users.filter(u => u.role === 'ADMIN').length,
          recentUsers: users.slice(-3) // Last 3 users for activity
        });
      } catch (userError) {
        console.warn('Could not fetch user data:', userError);
        // Set default user data if API fails
        setUserData({
          totalUsers: 1,
          activeUsers: 1,
          adminUsers: 1,
          recentUsers: []
        });
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!user || !budgetData || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Generate real statistics based on actual system data
  const stats = [
    {
      name: 'Lignes Budgétaires',
      value: budgetData.totalLines.toString(),
      change: `${budgetData.mddLines} MDD, ${budgetData.invLines} INV`,
      icon: FileText,
      color: 'blue'
    },
    {
      name: 'Utilisateurs Actifs',
      value: userData.activeUsers.toString(),
      change: `${userData.adminUsers} Admin${userData.adminUsers > 1 ? 's' : ''}`,
      icon: Users,
      color: 'green'
    },
    {
      name: 'Lignes Critiques',
      value: budgetData.criticalLines.toString(),
      change: '>90% utilisé',
      icon: AlertTriangle,
      color: budgetData.criticalLines > 0 ? 'red' : 'yellow'
    },
    {
      name: 'Taux d\'Utilisation',
      value: `${budgetData.utilizationRate.toFixed(1)}%`,
      change: formatCurrency(budgetData.totalRemaining) + ' disponible',
      icon: Activity,
      color: budgetData.utilizationRate > 90 ? 'red' : budgetData.utilizationRate > 75 ? 'yellow' : 'green'
    },
  ];

  // Generate real recent activity based on system data
  const recentActivity = [
    ...budgetData.budgetLines.slice(0, 3).map((line) => ({
      action: 'Ligne budgétaire',
      contract: `${line.fullCode} - ${formatCurrency(line.initialAmount)}`,
      time: `Utilisation: ${line.initialAmount > 0 ? ((line.committedAmount / line.initialAmount) * 100).toFixed(1) : 0}%`
    })),
    ...userData.recentUsers.map(user => ({
      action: 'Utilisateur actif',
      contract: `${user.username} (${user.role || 'USER'})`,
      time: user.email || 'Pas d\'email'
    }))
  ].slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
                <p className="text-gray-600 mt-2">Bienvenue, {user.username}! Vue d'ensemble de votre système de gestion budgétaire</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            {stats.map((stat) => (
              <StatCard
                key={stat.name}
                label={stat.name}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                change={stat.change}
                changeType="positive"
              />
            ))}
          </div>

          {/* Content Grid */}
          <div className={`${designSystem.layout.grid.cols3} ${designSystem.layout.grid.gap}`}>
            {/* Quick Actions */}
            <Card
              title="Actions Rapides"
              className="lg:col-span-1"
            >
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  icon={Upload}
                  className="w-full justify-start"
                  onClick={() => navigate('/budget')}
                >
                  Importer Budget Excel
                </Button>

                <Button
                  variant="secondary"
                  icon={Users}
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  Gérer les Utilisateurs
                </Button>

                <Button
                  variant="secondary"
                  icon={FileText}
                  className="w-full justify-start"
                  onClick={() => navigate('/budget')}
                >
                  Lignes Budgétaires
                </Button>

                <Button
                  variant="secondary"
                  icon={BarChart3}
                  className="w-full justify-start"
                  onClick={() => navigate('/budget/analytics')}
                >
                  Analyses Budgétaires
                </Button>

                <Button
                  variant="secondary"
                  icon={Settings}
                  className="w-full justify-start"
                >
                  Paramètres
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card
              title="Aperçu du Système"
              className="lg:col-span-2"
            >
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span> - {activity.contract}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune activité récente</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/budget')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir Budget
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/budget/analytics')}
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Analyses
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Budget Overview Section */}
          {budgetData && (
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span>Résumé Budgétaire</span>
                  </h3>
                  <button
                    onClick={() => navigate('/budget/analytics')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir détails →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Budget Total</p>
                        <p className="text-xl font-bold text-blue-900 mt-1">
                          {formatCurrency(budgetData.totalBudget)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Engagé</p>
                        <p className="text-xl font-bold text-orange-900 mt-1">
                          {formatCurrency(budgetData.totalCommitted)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Disponible</p>
                        <p className="text-xl font-bold text-green-900 mt-1">
                          {formatCurrency(budgetData.totalRemaining)}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 border ${budgetData.utilizationRate > 90 ? 'bg-red-50 border-red-200' :
                    budgetData.utilizationRate > 75 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-emerald-50 border-emerald-200'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${budgetData.utilizationRate > 90 ? 'text-red-700' :
                          budgetData.utilizationRate > 75 ? 'text-yellow-700' : 'text-emerald-700'
                          }`}>Utilisation</p>
                        <p className={`text-xl font-bold mt-1 ${budgetData.utilizationRate > 90 ? 'text-red-900' :
                          budgetData.utilizationRate > 75 ? 'text-yellow-900' : 'text-emerald-900'
                          }`}>
                          {budgetData.utilizationRate.toFixed(1)}%
                        </p>
                      </div>
                      <Activity className={`h-8 w-8 ${budgetData.utilizationRate > 90 ? 'text-red-600' :
                        budgetData.utilizationRate > 75 ? 'text-yellow-600' : 'text-emerald-600'
                        }`} />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression Budgétaire</span>
                    <span className="text-sm text-gray-500">
                      {budgetData.totalLines} ligne{budgetData.totalLines > 1 ? 's' : ''} budgétaire{budgetData.totalLines > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${budgetData.utilizationRate > 90 ? 'bg-red-500' :
                        budgetData.utilizationRate > 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${Math.min(budgetData.utilizationRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;