import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const BudgetAnalytics = ({ budgetLine, className = '' }) => {
  const [metrics, setMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (budgetLine) {
      calculateMetrics();
      generateAlerts();
    }
  }, [budgetLine]);

  const calculateMetrics = () => {
    const initial = budgetLine.initialAmount || 0;
    const committed = budgetLine.committedAmount || 0;
    const spent = budgetLine.spentAmount || 0;
    const remaining = initial - committed;
    const available = initial - spent;
    const utilizationRate = initial > 0 ? (committed / initial) * 100 : 0;
    const spentRate = initial > 0 ? (spent / initial) * 100 : 0;
    
    // Calculate realistic trend based on commitment vs spending ratio
    const commitmentEfficiency = committed > 0 ? (spent / committed) * 100 : 0;
    const trend = commitmentEfficiency > 50 ? 'up' : 'down';
    const trendPercentage = Math.abs(commitmentEfficiency - 50);

    // Calculate burn rate based on actual spending
    const currentDate = new Date();
    const monthsIntoYear = currentDate.getMonth() + 1;
    const monthlyBurnRate = monthsIntoYear > 0 ? spent / monthsIntoYear : 0;
    const projectedYearlySpending = monthlyBurnRate * 12;
    
    // Calculate efficiency score based on actual performance
    const targetUtilization = 75; // Optimal utilization target
    const utilizationDeviation = Math.abs(utilizationRate - targetUtilization);
    const efficiencyScore = Math.max(0, Math.min(100, 100 - (utilizationDeviation * 1.5)));

    // Calculate days until depletion based on current burn rate
    const dailyBurnRate = monthlyBurnRate / 30;
    const daysUntilDepletion = dailyBurnRate > 0 ? Math.floor(available / dailyBurnRate) : Infinity;

    setMetrics({
      utilizationRate,
      spentRate,
      commitmentEfficiency,
      trend,
      trendPercentage,
      burnRate: monthlyBurnRate,
      projectedYearlySpending,
      efficiencyScore,
      remaining,
      available,
      daysUntilDepletion
    });
  };

  const generateAlerts = () => {
    const newAlerts = [];
    const utilization = metrics.utilizationRate || 0;

    if (utilization > 90) {
      newAlerts.push({
        type: 'error',
        title: 'Budget Critique',
        message: 'Plus de 90% du budget est utilisé',
        icon: AlertTriangle
      });
    } else if (utilization > 75) {
      newAlerts.push({
        type: 'warning',
        title: 'Attention Budget',
        message: 'Plus de 75% du budget est utilisé',
        icon: AlertTriangle
      });
    }

    if (metrics.daysUntilDepletion < 30 && metrics.daysUntilDepletion !== Infinity) {
      newAlerts.push({
        type: 'error',
        title: 'Épuisement Imminent',
        message: `Budget épuisé dans ${metrics.daysUntilDepletion} jours`,
        icon: Calendar
      });
    }

    if (metrics.efficiencyScore > 80) {
      newAlerts.push({
        type: 'success',
        title: 'Performance Excellente',
        message: 'Utilisation optimale du budget',
        icon: CheckCircle
      });
    }

    setAlerts(newAlerts);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.high) return 'text-red-600 bg-red-50';
    if (value >= thresholds.medium) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Utilization Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'Utilisation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.utilizationRate?.toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                {metrics.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm ${metrics.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.trendPercentage?.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              getMetricColor(metrics.utilizationRate || 0, { high: 90, medium: 75 })
            }`}>
              <Target className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Burn Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dépense Mensuelle</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.burnRate)}
              </p>
              <p className="text-sm text-gray-500 mt-1">par mois</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Commitment Efficiency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficacité Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.commitmentEfficiency?.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">dépensé/engagé</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              getMetricColor(metrics.commitmentEfficiency || 0, { high: 80, medium: 50 })
            }`}>
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Available Budget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Disponible</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.available)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {metrics.daysUntilDepletion === Infinity ? 'Illimité' : `${metrics.daysUntilDepletion} jours`}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              metrics.daysUntilDepletion < 30 ? 'text-red-600 bg-red-50' :
              metrics.daysUntilDepletion < 90 ? 'text-yellow-600 bg-yellow-50' :
              'text-green-600 bg-green-50'
            }`}>
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Alertes et Notifications</span>
          </h3>
          
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Health Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          <span>Santé Budgétaire</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget Status */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
              metrics.utilizationRate > 90 ? 'bg-red-100' :
              metrics.utilizationRate > 75 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              {metrics.utilizationRate > 90 ? (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              ) : metrics.utilizationRate > 75 ? (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h4 className="font-semibold text-gray-900">Statut Global</h4>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.utilizationRate > 90 ? 'Critique' :
               metrics.utilizationRate > 75 ? 'Attention' : 'Sain'}
            </p>
          </div>

          {/* Performance Indicator */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
              metrics.commitmentEfficiency > 70 ? 'bg-green-100' :
              metrics.commitmentEfficiency > 40 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`h-8 w-8 ${
                metrics.commitmentEfficiency > 70 ? 'text-green-600' :
                metrics.commitmentEfficiency > 40 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <h4 className="font-semibold text-gray-900">Efficacité</h4>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.commitmentEfficiency > 70 ? 'Excellente' :
               metrics.commitmentEfficiency > 40 ? 'Bonne' : 'À améliorer'}
            </p>
          </div>

          {/* Risk Level */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
              metrics.daysUntilDepletion < 30 ? 'bg-red-100' :
              metrics.daysUntilDepletion < 90 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <Target className={`h-8 w-8 ${
                metrics.daysUntilDepletion < 30 ? 'text-red-600' :
                metrics.daysUntilDepletion < 90 ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <h4 className="font-semibold text-gray-900">Niveau de Risque</h4>
            <p className="text-sm text-gray-600 mt-1">
              {metrics.daysUntilDepletion < 30 ? 'Élevé' :
               metrics.daysUntilDepletion < 90 ? 'Modéré' : 'Faible'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations</h3>
        
        <div className="space-y-3">
          {metrics.utilizationRate > 85 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Surveiller de près les engagements
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Taux d'engagement élevé: {metrics.utilizationRate?.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
          
          {metrics.commitmentEfficiency < 40 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Améliorer l'efficacité des engagements
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Seulement {metrics.commitmentEfficiency?.toFixed(1)}% des engagements sont dépensés
                </p>
              </div>
            </div>
          )}
          
          {metrics.daysUntilDepletion > 365 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Budget bien géré
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Rythme de dépense soutenable, {formatCurrency(metrics.available)} disponible
                </p>
              </div>
            </div>
          )}
          
          {metrics.daysUntilDepletion < 90 && metrics.daysUntilDepletion !== Infinity && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Attention: Épuisement rapide du budget
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Au rythme actuel, budget épuisé dans {metrics.daysUntilDepletion} jours
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalytics;