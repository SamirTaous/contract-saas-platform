import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  Hash,
  Building,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
  BarChart3,
  Activity
} from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import BudgetCharts from './BudgetCharts';
import BudgetAnalytics from './BudgetAnalytics';
import RealTimeChart from './RealTimeChart';

const budgetApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/budget'
}));

const BudgetLineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [budgetLine, setBudgetLine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLine, setEditedLine] = useState({});
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Check if budget line data was passed via navigation state
    if (location.state?.budgetLine) {
      const line = location.state.budgetLine;
      // Use real data from backend - no mock data
      const enhancedLine = {
        ...line,
        id: id,
        // Use real committedAmount and spentAmount from backend
        committedAmount: line.committedAmount || 0,
        spentAmount: line.spentAmount || 0,
        // Only add missing fields if they don't exist
        createdDate: line.createdDate || new Date().toISOString().split('T')[0],
        lastModified: line.lastModified || new Date().toISOString().split('T')[0]
      };
      setBudgetLine(enhancedLine);
      setEditedLine(enhancedLine);
      setLoading(false);
    } else {
      // Fallback to fetching from API
      fetchBudgetLineDetails();
    }
  }, [id, location.state]);

  const fetchBudgetLineDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching budget line details for ID:', id);

      // For now, we'll fetch all budget lines and find the one by index
      // In a real app, you'd have a specific endpoint for individual budget lines
      const response = await budgetApi.get('/all');
      const budgetLines = response.data;
      const lineIndex = parseInt(id);

      console.log('Budget lines count:', budgetLines.length);
      console.log('Requested index:', lineIndex);

      if (lineIndex >= 0 && lineIndex < budgetLines.length) {
        const line = budgetLines[lineIndex];
        console.log('Found budget line:', line);

        // Use real data from backend - no mock data
        const enhancedLine = {
          ...line,
          id: lineIndex,
          // Use real committedAmount and spentAmount from backend
          committedAmount: line.committedAmount || 0,
          spentAmount: line.spentAmount || 0,
          // Only add missing fields if they don't exist
          createdDate: line.createdDate || new Date().toISOString().split('T')[0],
          lastModified: line.lastModified || new Date().toISOString().split('T')[0]
        };
        setBudgetLine(enhancedLine);
        setEditedLine(enhancedLine);
      } else {
        console.log('Budget line not found - index out of range');
        setError('Budget line not found.');
      }
    } catch (err) {
      console.error('Failed to fetch budget line details:', err);
      setError('Failed to load budget line details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // For now, we'll just update the local state since we don't have a real update endpoint
      // In a real app, you'd call: await budgetApi.put(`/line/${id}`, editedLine);
      setBudgetLine(editedLine);
      setIsEditing(false);
      // Show a success message or notification here
    } catch (err) {
      console.error('Failed to update budget line:', err);
      setError('Failed to update budget line. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedLine(budgetLine);
    setIsEditing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'MDD':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INV':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateUtilization = () => {
    if (!budgetLine) return 0;
    const initial = budgetLine.initialAmount || 0;
    const committed = budgetLine.committedAmount || 0;
    return initial > 0 ? (committed / initial) * 100 : 0;
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails de la ligne budgétaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/budget')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Budget
          </button>
        </div>
      </div>
    );
  }

  if (!budgetLine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ligne Budgétaire Non Trouvée</h2>
          <p className="text-gray-600 mb-6">La ligne budgétaire demandée n'a pas pu être trouvée.</p>
          <button
            onClick={() => navigate('/budget')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Budget
          </button>
        </div>
      </div>
    );
  }

  const utilization = calculateUtilization();
  const remainingAmount = (budgetLine.initialAmount || 0) - (budgetLine.committedAmount || 0);
  const availableAmount = (budgetLine.initialAmount || 0) - (budgetLine.spentAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/budget')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour au Budget</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Détails de la Ligne Budgétaire</h1>
                <p className="text-gray-600 mt-1">Vue complète de la ligne budgétaire {budgetLine.fullCode}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Enregistrer</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Annuler</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Détails</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'charts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Graphiques</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('realtime')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'realtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Temps Réel</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Analyses</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Informations de Base</span>
                  </h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeBadgeColor(budgetLine.type)}`}>
                    {budgetLine.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code Complet</label>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg border">
                          {budgetLine.fullCode}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedLine.article || ''}
                          onChange={(e) => setEditedLine({ ...editedLine, article: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
                          {budgetLine.article || 'N/A'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paragraphe</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedLine.paragraph || ''}
                          onChange={(e) => setEditedLine({ ...editedLine, paragraph: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
                          {budgetLine.paragraph || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ligne</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedLine.line || ''}
                          onChange={(e) => setEditedLine({ ...editedLine, line: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
                          {budgetLine.line || 'N/A'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      {isEditing ? (
                        <select
                          value={editedLine.type || ''}
                          onChange={(e) => setEditedLine({ ...editedLine, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="MDD">MDD</option>
                          <option value="INV">INV</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border">
                          {budgetLine.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <div className="flex items-center space-x-2">
                        {availableAmount >= 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${availableAmount >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                          {availableAmount >= 0 ? 'Budget Disponible' : 'Budget Dépassé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span>Description et Libellé</span>
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Libellé</label>
                  {isEditing ? (
                    <textarea
                      value={editedLine.label || ''}
                      onChange={(e) => setEditedLine({ ...editedLine, label: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Entrez la description de la ligne budgétaire..."
                    />
                  ) : (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {budgetLine.label || 'Aucune description disponible'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Financial Summary */}
            <div className="space-y-6">
              {/* Financial Overview Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span>Aperçu Financier</span>
                </h2>

                <div className="space-y-6">
                  {/* Initial Amount */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Budget Initial</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(budgetLine.initialAmount)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Committed Amount */}
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Engagé</p>
                        <p className="text-2xl font-bold text-orange-900 mt-1">
                          {formatCurrency(budgetLine.committedAmount)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* Spent Amount */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Dépensé</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">
                          {formatCurrency(budgetLine.spentAmount || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  <div className={`rounded-lg p-4 border ${availableAmount >= 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${availableAmount >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                          Disponible
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${availableAmount >= 0 ? 'text-green-900' : 'text-red-900'
                          }`}>
                          {formatCurrency(availableAmount)}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${availableAmount >= 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {availableAmount >= 0 ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utilization Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilisation du Budget</h2>

                <div className="space-y-6">
                  {/* Commitment Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Taux d'Engagement</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${getUtilizationColor(utilization)}`}>
                        {utilization.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${utilization >= 90 ? 'bg-red-500' :
                          utilization >= 75 ? 'bg-orange-500' :
                            utilization >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Spending Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Taux de Dépense</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${getUtilizationColor((budgetLine.spentAmount || 0) / (budgetLine.initialAmount || 1) * 100)}`}>
                        {((budgetLine.spentAmount || 0) / (budgetLine.initialAmount || 1) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${((budgetLine.spentAmount || 0) / (budgetLine.initialAmount || 1) * 100) >= 90 ? 'bg-red-500' :
                          ((budgetLine.spentAmount || 0) / (budgetLine.initialAmount || 1) * 100) >= 75 ? 'bg-orange-500' :
                            ((budgetLine.spentAmount || 0) / (budgetLine.initialAmount || 1) * 100) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(((budgetLine.spentAmount || 0) / (budgetLine.initialAmount || 1) * 100), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Efficacité Engagement</span>
                      <span className="text-sm font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">
                        {budgetLine.committedAmount > 0 ? ((budgetLine.spentAmount || 0) / budgetLine.committedAmount * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Pourcentage des engagements effectivement dépensés
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>

                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-colors border border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Ajouter une Transaction</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-colors border border-gray-200">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Générer un Rapport</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">Voir les Analyses</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <BudgetCharts budgetLine={budgetLine} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <BudgetAnalytics budgetLine={budgetLine} />
        )}

        {/* Real-time Tab */}
        {activeTab === 'realtime' && (
          <RealTimeChart budgetLine={budgetLine} />
        )}
      </div>
    </div>
  );
};

export default BudgetLineDetails;