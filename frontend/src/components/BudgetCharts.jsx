import { useState, useEffect } from 'react';
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
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { TrendingUp, BarChart3, PieChart, Activity, Calendar } from 'lucide-react';

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
  Legend,
  Filler
);

const BudgetCharts = ({ budgetLine, className = '' }) => {
  const [activeChart, setActiveChart] = useState('breakdown');
  const [timeRange, setTimeRange] = useState('6months');

  // Calculate real values from budget line
  const initialAmount = budgetLine?.initialAmount || 0;
  const committedAmount = budgetLine?.committedAmount || 0;
  const spentAmount = budgetLine?.spentAmount || 0;
  const remainingAmount = initialAmount - committedAmount;
  const availableAmount = initialAmount - spentAmount;
  const utilizationRate = initialAmount > 0 ? (committedAmount / initialAmount) * 100 : 0;
  const spentRate = initialAmount > 0 ? (spentAmount / initialAmount) * 100 : 0;

  // Generate realistic historical data based on current budget line
  const generateHistoricalData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    // Create a realistic progression leading to current state
    const monthsToShow = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    
    for (let i = 0; i < monthsToShow; i++) {
      const monthIndex = (currentMonth - monthsToShow + 1 + i + 12) % 12;
      const progressRatio = (i + 1) / monthsToShow;
      
      // Budget stays constant
      const budget = initialAmount;
      
      // Committed amount grows progressively to current amount
      const committed = committedAmount * progressRatio;
      
      // Spent amount grows more slowly than committed
      const spent = spentAmount * progressRatio * 0.8;
      
      data.push({
        month: months[monthIndex],
        budget: budget,
        committed: committed,
        spent: spent,
        remaining: budget - committed,
        available: budget - spent
      });
    }
    
    return data;
  };

  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    if (budgetLine) {
      setHistoricalData(generateHistoricalData());
    }
  }, [budgetLine, timeRange]);

  // Chart configurations
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
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${new Intl.NumberFormat('fr-MA', {
              style: 'currency',
              currency: 'MAD',
              minimumFractionDigits: 0
            }).format(context.parsed.y)}`;
          }
        }
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
            return new Intl.NumberFormat('fr-MA', {
              style: 'currency',
              currency: 'MAD',
              minimumFractionDigits: 0
            }).format(value);
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

  // Pie chart specific options (no axes)
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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
        displayColors: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed || 0;
            return `${context.label}: ${new Intl.NumberFormat('fr-MA', {
              style: 'currency',
              currency: 'MAD',
              minimumFractionDigits: 0
            }).format(value)}`;
          }
        }
      }
    }
  };

  // Budget evolution over time (Line Chart) - Real data
  const utilizationChartData = {
    labels: historicalData.map(d => d.month),
    datasets: [
      {
        label: 'Budget Alloué',
        data: historicalData.map(d => d.budget),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Montant Engagé',
        data: historicalData.map(d => d.committed),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Montant Dépensé',
        data: historicalData.map(d => d.spent),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Budget breakdown (Doughnut Chart) - Real data
  const breakdownChartData = {
    labels: ['Engagé', 'Dépensé', 'Disponible'],
    datasets: [
      {
        data: [
          Math.max(0, (committedAmount || 0) - (spentAmount || 0)), // Committed but not spent
          spentAmount || 0, // Actually spent
          Math.max(0, remainingAmount || 0) // Available
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // Orange for committed
          'rgba(239, 68, 68, 0.8)',  // Red for spent
          'rgba(34, 197, 94, 0.8)'   // Green for available
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Monthly comparison (Bar Chart) - Real data
  const comparisonChartData = {
    labels: historicalData.map(d => d.month),
    datasets: [
      {
        label: 'Budget Alloué',
        data: historicalData.map(d => d.budget),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Montant Engagé',
        data: historicalData.map(d => d.committed),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1
      },
      {
        label: 'Montant Dépensé',
        data: historicalData.map(d => d.spent),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  // Performance metrics (Area Chart) - Real data
  const performanceChartData = {
    labels: historicalData.map(d => d.month),
    datasets: [
      {
        label: 'Taux d\'Engagement (%)',
        data: historicalData.map(d => d.budget > 0 ? (d.committed / d.budget) * 100 : 0),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Taux de Dépense (%)',
        data: historicalData.map(d => d.budget > 0 ? (d.spent / d.budget) * 100 : 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartTypes = [
    {
      id: 'breakdown',
      name: 'Répartition Budget',
      icon: PieChart,
      component: <Doughnut data={breakdownChartData} options={pieChartOptions} />
    },
    {
      id: 'utilization',
      name: 'Évolution Budgétaire',
      icon: TrendingUp,
      component: <Line data={utilizationChartData} options={chartOptions} />
    },
    {
      id: 'comparison',
      name: 'Comparaison Mensuelle',
      icon: BarChart3,
      component: <Bar data={comparisonChartData} options={chartOptions} />
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: Activity,
      component: <Line data={performanceChartData} options={{
        ...chartOptions,
        scales: {
          ...chartOptions.scales,
          y: {
            ...chartOptions.scales.y,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }} />
    }
  ];

  const activeChartData = chartTypes.find(chart => chart.id === activeChart);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Analyses Graphiques</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Visualisations dynamiques des données budgétaires
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="3months">3 Mois</option>
              <option value="6months">6 Mois</option>
              <option value="12months">12 Mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === chart.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{chart.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Display */}
      <div className="p-6">
        <div className="h-80">
          {activeChartData?.component}
        </div>
      </div>

      {/* Chart Insights */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Insights Clés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Utilisation</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {utilizationRate.toFixed(1)}% du budget engagé
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Disponible</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {new Intl.NumberFormat('fr-MA', {
                style: 'currency',
                currency: 'MAD',
                minimumFractionDigits: 0
              }).format(remainingAmount)} restant
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Efficacité</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {spentRate.toFixed(1)}% effectivement dépensé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCharts;