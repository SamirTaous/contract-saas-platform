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
  PieChart,
  Hammer,
  Building,
  ChevronRight
} from 'lucide-react';
import { designSystem } from '../styles/designSystem';
import StatCard from './ui/StatCard';
import Button from './ui/Button';
import Card from './ui/Card';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import { useAuth } from '../contexts/AuthContext';
import { canEdit } from '../utils/roles';
import api from '../api';

// API instances
const budgetApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/budget'
}));

const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [decomptesData, setDecomptesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const editable = canEdit(user || authUser);

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

      // Fetch decomptes data
      try {
        const decomptesResponse = await operationApi.get('/decomptes');
        const decomptes = decomptesResponse.data;

        // Calculate decomptes statistics
        const totalDecomptes = decomptes.length;
        const pendingDecomptes = decomptes.filter(d => d.status === 'PENDING').length;
        const paidDecomptes = decomptes.filter(d => d.status === 'PAID').length;
        const rejectedDecomptes = decomptes.filter(d => d.status === 'REJECTED').length;
        const totalDecomptesAmount = decomptes.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const paidDecomptesAmount = decomptes
          .filter(d => d.status === 'PAID')
          .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

        setDecomptesData({
          totalDecomptes,
          pendingDecomptes,
          paidDecomptes,
          rejectedDecomptes,
          totalDecomptesAmount,
          paidDecomptesAmount,
          decomptes: decomptes.slice(0, 3) // Top 3 for recent activity
        });
      } catch (decomptesError) {
        console.warn('Could not fetch decomptes data:', decomptesError);
        // Set default decomptes data if API fails
        setDecomptesData({
          totalDecomptes: 0,
          pendingDecomptes: 0,
          paidDecomptes: 0,
          rejectedDecomptes: 0,
          totalDecomptesAmount: 0,
          paidDecomptesAmount: 0,
          decomptes: []
        });
      }

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

  if (!user || !budgetData || !userData || !decomptesData) {
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
      name: 'Décomptes Total',
      value: decomptesData.totalDecomptes.toString(),
      change: `${decomptesData.pendingDecomptes} en attente • ${decomptesData.paidDecomptes} payés`,
      icon: Building,
      color: 'purple'
    },
    {
      name: 'Utilisateurs Actifs',
      value: userData.activeUsers.toString(),
      change: `${userData.adminUsers} Admin${userData.adminUsers > 1 ? 's' : ''}`,
      icon: Users,
      color: 'green'
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
    ...budgetData.budgetLines.slice(0, 2).map((line) => ({
      action: 'Ligne budgétaire',
      contract: `${line.fullCode} - ${formatCurrency(line.initialAmount)}`,
      time: `Utilisation: ${line.initialAmount > 0 ? ((line.committedAmount / line.initialAmount) * 100).toFixed(1) : 0}%`
    })),
    ...decomptesData.decomptes.map(decompte => ({
      action: 'Décompte',
      contract: `${decompte.label} - ${formatCurrency(decompte.amount)}`,
      time: `Statut: ${decompte.status === 'PAID' ? 'Payé' : decompte.status === 'PENDING' ? 'En attente' : 'Rejeté'}`
    })),
    ...userData.recentUsers.slice(0, 1).map(user => ({
      action: 'Utilisateur actif',
      contract: `${user.username} (${user.role || 'USER'})`,
      time: user.email || 'Pas d\'email'
    }))
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Tableau de Bord</h1>
                <p className="text-gray-600 text-base">
                  Bienvenue, <span className="font-semibold text-gray-900">{user.username}</span>!{' '}
                  {editable
                    ? 'Vue d\'ensemble de votre système de gestion budgétaire'
                    : 'Consultez l\'état de votre organisation en lecture seule'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 group"
                >
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-medium">Actualiser</span>
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
              title={editable ? 'Actions Rapides' : 'Accès Rapide'}
              className="lg:col-span-1 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="space-y-2">
                {editable && (
                  <button
                    onClick={() => navigate('/budget')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                      <Upload className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <span className="font-medium">Importer Budget Excel</span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/users')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-100 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Users className="h-5 w-5 text-green-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">{editable ? 'Gérer les Utilisateurs' : 'Voir l\'Équipe'}</span>
                </button>

                <button
                  onClick={() => navigate('/budget')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <FileText className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">Lignes Budgétaires</span>
                </button>

                <button
                  onClick={() => navigate('/construction')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Hammer className="h-5 w-5 text-orange-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">Tableau de Bord Construction</span>
                </button>

                <button
                  onClick={() => navigate('/construction/projects')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Building className="h-5 w-5 text-indigo-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">{editable ? 'Gérer les Projets' : 'Voir les Projets'}</span>
                </button>

                <button
                  onClick={() => navigate('/construction/decomptes')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-pink-100 group-hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <FileText className="h-5 w-5 text-pink-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">{editable ? 'Gérer les Décomptes' : 'Voir les Décomptes'}</span>
                </button>

                <button
                  onClick={() => navigate('/budget/analytics')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-teal-100 group-hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <BarChart3 className="h-5 w-5 text-teal-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">Analyses Budgétaires</span>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <Settings className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="font-medium">Paramètres</span>
                </button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card
              title="Aperçu du Système"
              className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100 group cursor-pointer">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium group-hover:text-blue-700 transition-colors">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 truncate">{activity.contract}</p>
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Aucune activité récente</p>
                    <p className="text-xs text-gray-400 mt-1">Les activités apparaîtront ici</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/budget')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-200 group"
                  >
                    <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Voir Budget</span>
                  </button>
                  <button
                    onClick={() => navigate('/budget/analytics')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-200 group"
                  >
                    <PieChart className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Analyses</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Budget Overview Section */}
          {budgetData && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Résumé Budgétaire</h3>
                      <p className="text-sm text-gray-500">Vue d'ensemble financière</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/budget/analytics')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <span>Voir détails</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-semibold text-blue-700">Budget Total</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(budgetData.totalBudget)}
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        <p className="text-sm font-semibold text-orange-700">Engagé</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">
                        {formatCurrency(budgetData.totalCommitted)}
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-semibold text-green-700">Disponible</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(budgetData.totalRemaining)}
                      </p>
                    </div>
                  </div>

                  <div className={`relative rounded-xl p-5 border hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer ${
                    budgetData.utilizationRate > 90 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                    budgetData.utilizationRate > 75 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                    'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                  }`}>
                    <div className={`absolute top-3 right-3 w-12 h-12 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity ${
                      budgetData.utilizationRate > 90 ? 'bg-red-600' :
                      budgetData.utilizationRate > 75 ? 'bg-yellow-600' : 'bg-emerald-600'
                    }`}></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className={`h-5 w-5 ${
                          budgetData.utilizationRate > 90 ? 'text-red-600' :
                          budgetData.utilizationRate > 75 ? 'text-yellow-600' : 'text-emerald-600'
                        }`} />
                        <p className={`text-sm font-semibold ${
                          budgetData.utilizationRate > 90 ? 'text-red-700' :
                          budgetData.utilizationRate > 75 ? 'text-yellow-700' : 'text-emerald-700'
                        }`}>Utilisation</p>
                      </div>
                      <p className={`text-2xl font-bold ${
                        budgetData.utilizationRate > 90 ? 'text-red-900' :
                        budgetData.utilizationRate > 75 ? 'text-yellow-900' : 'text-emerald-900'
                      }`}>
                        {budgetData.utilizationRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Progression Budgétaire</span>
                    <span className="text-sm text-gray-600 px-3 py-1 bg-white rounded-full border border-gray-200">
                      {budgetData.totalLines} ligne{budgetData.totalLines > 1 ? 's' : ''} budgétaire{budgetData.totalLines > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 shadow-md ${
                        budgetData.utilizationRate > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        budgetData.utilizationRate > 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${Math.min(budgetData.utilizationRate, 100)}%` }}
                    >
                      <div className="h-full w-full bg-white opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decomptes Overview Section */}
          {decomptesData && (
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Décomptes de Construction</h3>
                      <p className="text-sm text-gray-500">État des paiements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/construction/decomptes')}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-200 font-medium group"
                  >
                    <span>Voir tous les décomptes</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <p className="text-sm font-semibold text-purple-700">Total Décomptes</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {decomptesData.totalDecomptes}
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm font-semibold text-yellow-700">En Attente</p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900">
                        {decomptesData.pendingDecomptes}
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-semibold text-green-700">Payés</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {decomptesData.paidDecomptes}
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer">
                    <div className="absolute top-3 right-3 w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-indigo-600" />
                        <p className="text-sm font-semibold text-indigo-700">Montant Total</p>
                      </div>
                      <p className="text-2xl font-bold text-indigo-900">
                        {formatCurrency(decomptesData.totalDecomptesAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Decomptes */}
                {decomptesData.decomptes.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <span className="w-1 h-4 bg-purple-600 rounded-full mr-2"></span>
                      Décomptes Récents
                    </h4>
                    <div className="space-y-3">
                      {decomptesData.decomptes.map((decompte) => (
                        <div key={decompte.uuid} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 group">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-200">
                              <FileText className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors duration-200" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{decompte.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{decompte.projectName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatCurrency(decompte.amount)}
                            </p>
                            <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mt-1 ${
                              decompte.status === 'PAID' ? 'bg-green-100 text-green-800' :
                              decompte.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {decompte.status === 'PAID' ? 'Payé' :
                                decompte.status === 'PENDING' ? 'En Attente' : 'Rejeté'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;