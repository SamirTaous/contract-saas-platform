import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  GitCompare,
  Plus,
  X,
  ArrowUpDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const BudgetComparison = ({ availableBudgetLines = [], className = '' }) => {
  const [selectedLines, setSelectedLines] = useState([]);
  const [comparisonType, setComparisonType] = useState('amounts');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Initialize with first two budget lines if available
    if (availableBudgetLines.length >= 2) {
      setSelectedLines(availableBudgetLines.slice(0, 2));
    }
  }, [availableBudgetLines]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const addBudgetLine = (line) => {
    if (selectedLines.length < 5 && !selectedLines.find(l => l.id === line.id)) {
      setSelectedLines([...selectedLines, line]);
    }
    setShowAddModal(false);
  };

  const removeBudgetLine = (lineId) => {
    setSelectedLines(selectedLines.filter(line => line.id !== lineId));
  };

  // Generate colors for each budget line
  const colors = [
    'rgb(59, 130, 246)',   // Blue
    'rgb(245, 158, 11)',   // Orange
    'rgb(34, 197, 94)',    // Green
    'rgb(168, 85, 247)',   // Purple
    'rgb(239, 68, 68)'     // Red
  ];

  // Comparison chart data based on type
  const getChartData = () => {
    const labels = selectedLines.map(line => line.fullCode || `Ligne ${line.id}`);
    
    switch (comparisonType) {
      case 'amounts':
        return {
          labels,
          datasets: [
            {
              label: 'Budget Initial',
              data: selectedLines.map(line => line.initialAmount || 0),
              backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
              borderColor: colors,
              borderWidth: 1
            },
            {
              label: 'Montant Engagé',
              data: selectedLines.map(line => line.committedAmount || 0),
              backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.6)')),
              borderColor: colors,
              borderWidth: 1
            }
          ]
        };
      
      case 'utilization':
        return {
          labels,
          datasets: [
            {
              label: 'Taux d\'Utilisation (%)',
              data: selectedLines.map(line => {
                const initial = line.initialAmount || 0;
                const committed = line.committedAmount || 0;
                return initial > 0 ? (committed / initial) * 100 : 0;
              }),
              backgroundColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
              borderColor: colors,
              borderWidth: 1
            }
          ]
        };
      
      case 'efficiency':
        return {
          labels: ['Budget', 'Utilisation', 'Efficacité Engagement', 'Disponibilité', 'Performance'],
          datasets: selectedLines.map((line, index) => {
            const utilization = line.initialAmount > 0 ? (line.committedAmount / line.initialAmount) * 100 : 0;
            const spentEfficiency = line.committedAmount > 0 ? (line.spentAmount / line.committedAmount) * 100 : 0;
            const availability = line.initialAmount > 0 ? ((line.initialAmount - line.spentAmount) / line.initialAmount) * 100 : 0;
            
            return {
              label: line.fullCode || `Ligne ${line.id}`,
              data: [
                Math.min(100, (line.initialAmount || 0) / 100000 * 100), // Normalized budget (relative to 100k)
                utilization, // Real utilization rate
                spentEfficiency, // Real spending efficiency
                Math.max(0, availability), // Real availability
                Math.min(100, 100 - Math.abs(utilization - 75)) // Performance based on optimal 75% utilization
              ],
              backgroundColor: colors[index].replace('rgb', 'rgba').replace(')', ', 0.2)'),
              borderColor: colors[index],
              borderWidth: 2,
              pointBackgroundColor: colors[index],
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: colors[index]
            };
          })
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  };

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
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            if (comparisonType === 'amounts') {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            } else if (comparisonType === 'utilization') {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: comparisonType !== 'efficiency' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            if (comparisonType === 'amounts') {
              return formatCurrency(value);
            } else if (comparisonType === 'utilization') {
              return value + '%';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    } : {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const chartData = getChartData();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <GitCompare className="h-5 w-5 text-blue-600" />
              <span>Comparaison des Lignes Budgétaires</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Analyse comparative de {selectedLines.length} ligne(s) budgétaire(s)
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="amounts">Montants</option>
              <option value="utilization">Utilisation</option>
              <option value="efficiency">Performance</option>
            </select>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={selectedLines.length >= 5}
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Budget Lines */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Lignes Sélectionnées</h4>
        <div className="flex flex-wrap gap-2">
          {selectedLines.map((line, index) => (
            <div
              key={line.id}
              className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              ></div>
              <span className="text-sm font-medium text-gray-900">
                {line.fullCode || `Ligne ${line.id}`}
              </span>
              <button
                onClick={() => removeBudgetLine(line.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {selectedLines.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Aucune ligne budgétaire sélectionnée
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      {selectedLines.length > 0 && (
        <div className="p-6">
          <div className="h-96">
            {comparisonType === 'efficiency' ? (
              <Radar data={chartData} options={chartOptions} />
            ) : comparisonType === 'utilization' ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedLines.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Tableau Comparatif</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ligne Budgétaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Initial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dépensé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedLines.map((line, index) => {
                  const initial = line.initialAmount || 0;
                  const committed = line.committedAmount || 0;
                  const spent = line.spentAmount || 0;
                  const available = initial - spent;
                  const utilization = initial > 0 ? (committed / initial) * 100 : 0;
                  
                  return (
                    <tr key={line.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                          ></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {line.fullCode || `Ligne ${line.id}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {line.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(initial)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(committed)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={available >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(available)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilization > 90 ? 'bg-red-500' :
                                utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          utilization > 90 ? 'bg-red-100 text-red-800' :
                          utilization > 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {utilization > 90 ? 'Critique' :
                           utilization > 75 ? 'Attention' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Budget Line Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter une Ligne Budgétaire
              </h3>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {availableBudgetLines
                  .filter(line => !selectedLines.find(l => l.id === line.id))
                  .map(line => (
                    <button
                      key={line.id}
                      onClick={() => addBudgetLine(line)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {line.fullCode || `Ligne ${line.id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {line.type} - {formatCurrency(line.initialAmount)}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetComparison;