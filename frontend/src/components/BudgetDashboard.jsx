import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import { useSidebar } from '../contexts/SidebarContext';
import BudgetComparison from './BudgetComparison';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const budgetApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/budget'
}));

const BudgetDashboard = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();
  const [budgetLines, setBudgetLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await budgetApi.get('/all');
      
      // Use only real data from backend - no mock data at all
      const enhancedData = response.data.map((line, index) => ({
        ...line,
        id: index,
        // Use real committedAmount and spentAmount from backend only
        committedAmount: line.committedAmount || 0,
        spentAmount: line.spentAmount || 0,
        // Only add fields that don't exist in backend
        createdDate: line.createdDate || new Date().toISOString().split('T')[0],
        lastModified: line.lastModified || new Date().toISOString().split('T')[0],
        status: line.status || 'active'
      }));
      
      setBudgetLines(enhancedData);
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
      setError('Impossible de charger les données budgétaires');
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

  // Calculate summary statistics
  const totalBudget = budgetLines.reduce((sum, line) => sum + (line.initialAmount || 0), 0);
  const totalCommitted = budgetLines.reduce((sum, line) => sum + (line.committedAmount || 0), 0);
  const totalRemaining = totalBudget - totalCommitted;
  const utilizationRate = totalBudget > 0 ? (totalCommitted / totalBudget) * 100 : 0;

  // Filter budget lines
  const filteredLines = budgetLines.filter(line => {
    if (selectedType !== 'all' && line.type !== selectedType) return false;
    return true;
  });

  // Chart data for budget overview
  const overviewChartData = {
    labels: ['Budget Total', 'Engagé', 'Disponible'],
    datasets: [
      {
        label: 'Montants (MAD)',
        data: [totalBudget, totalCommitted, totalRemaining],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for utilization by type
  const typeUtilizationData = {
    labels: ['MDD', 'INV'],
    datasets: [
      {
        data: [
          budgetLines.filter(l => l.type === 'MDD').reduce((sum, l) => sum + (l.committedAmount || 0), 0),
          budgetLines.filter(l => l.type === 'INV').reduce((sum, l) => sum + (l.committedAmount || 0), 0)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Top budget lines by utilization
  const topLines = [...filteredLines]
    .sort((a, b) => {
      const aUtil = a.initialAmount > 0 ? (a.committedAmount / a.initialAmount) * 100 : 0;
      const bUtil = b.initialAmount > 0 ? (b.committedAmount / b.initialAmount) * 100 : 0;
      return bUtil - aUtil;
    })
    .slice(0, 5);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
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
            onClick={fetchBudgetData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
        sidebarCollapsed ? 'max-w-none' : 'max-w-7xl'
      }`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Budgétaire</h1>
              <p className="text-gray-600 mt-2">Vue d'ensemble et analyses des lignes budgétaires</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchBudgetData}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualiser</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current">Période Actuelle</option>
              <option value="previous">Période Précédente</option>
              <option value="ytd">Année en Cours</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les Types</option>
              <option value="MDD">MDD</option>
              <option value="INV">INV</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-blue-700 mb-1">Budget Total</p>
                <p className="text-2xl font-bold text-blue-900 truncate">
                  {formatCurrency(totalBudget)}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-xs text-blue-600 truncate">Montant alloué</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-orange-700 mb-1">Montant Engagé</p>
                <p className="text-2xl font-bold text-orange-900 truncate">
                  {formatCurrency(totalCommitted)}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-xs text-orange-600 truncate">Dépenses actuelles</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-green-700 mb-1">Disponible</p>
                <p className="text-2xl font-bold text-green-900 truncate">
                  {formatCurrency(totalRemaining)}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-xs text-green-600 truncate">Solde restant</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
            utilizationRate > 90 ? 'from-red-50 to-red-100 border-red-200' :
            utilizationRate > 75 ? 'from-yellow-50 to-yellow-100 border-yellow-200' : 
            'from-emerald-50 to-emerald-100 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className={`text-sm font-medium mb-1 ${
                  utilizationRate > 90 ? 'text-red-700' :
                  utilizationRate > 75 ? 'text-yellow-700' : 'text-emerald-700'
                }`}>Taux d'Utilisation</p>
                <p className={`text-2xl font-bold truncate ${
                  utilizationRate > 90 ? 'text-red-900' :
                  utilizationRate > 75 ? 'text-yellow-900' : 'text-emerald-900'
                }`}>
                  {utilizationRate.toFixed(1)}%
                </p>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                    utilizationRate > 90 ? 'bg-red-500' :
                    utilizationRate > 75 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}></div>
                  <span className={`text-xs truncate ${
                    utilizationRate > 90 ? 'text-red-600' :
                    utilizationRate > 75 ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>
                    {utilizationRate > 90 ? 'Critique' :
                     utilizationRate > 75 ? 'Attention' : 'Optimal'}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                utilizationRate > 90 ? 'bg-red-500' :
                utilizationRate > 75 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}>
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Budget Overview Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Aperçu Budgétaire</span>
            </h3>
            <div className="h-64">
              <Bar data={overviewChartData} options={chartOptions} />
            </div>
          </div>

          {/* Utilization by Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              <span>Utilisation par Type</span>
            </h3>
            <div className="h-64">
              <Doughnut data={typeUtilizationData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${formatCurrency(context.parsed)}`;
                      }
                    }
                  }
                },
                // Remove scales to hide numbers on the chart
                elements: {
                  arc: {
                    borderWidth: 2,
                    borderColor: '#ffffff'
                  }
                },
                cutout: '60%'
              }} />
            </div>
          </div>
        </div>

        {/* Top Budget Lines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Top 5 - Lignes les Plus Utilisées</span>
          </h3>
          
          <div className="space-y-3">
            {topLines.map((line, index) => {
              const utilization = line.initialAmount > 0 ? (line.committedAmount / line.initialAmount) * 100 : 0;
              const remaining = (line.initialAmount || 0) - (line.committedAmount || 0);
              
              return (
                <div
                  key={line.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                  onClick={() => navigate(`/budget/line/${line.id}`, { state: { budgetLine: line } })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{line.fullCode}</h4>
                      <p className="text-sm text-gray-600 truncate">{line.label || 'Aucune description'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatCurrency(line.committedAmount)} / {formatCurrency(line.initialAmount)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Restant: {formatCurrency(remaining)}
                      </p>
                    </div>
                    
                    <div className="w-24 flex-shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Utilisation</span>
                        <span className={`text-xs font-medium ${
                          utilization > 90 ? 'text-red-600' :
                          utilization > 75 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            utilization > 90 ? 'bg-red-500' :
                            utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Comparison */}
        <BudgetComparison availableBudgetLines={budgetLines} />
      </div>
    </div>
  );
};

export default BudgetDashboard;