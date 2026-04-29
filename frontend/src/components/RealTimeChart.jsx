import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Activity, Play, Pause, RotateCcw } from 'lucide-react';

const RealTimeChart = ({ budgetLine, className = '' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const intervalRef = useRef(null);
  const maxDataPoints = 20;

  // Real budget line values
  const initialAmount = budgetLine?.initialAmount || 0;
  const committedAmount = budgetLine?.committedAmount || 0;
  const spentAmount = budgetLine?.spentAmount || 0;

  useEffect(() => {
    // Initialize with real data points
    initializeData();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [budgetLine]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        addDataPoint();
      }, 3000); // Update every 3 seconds for more realistic simulation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const initializeData = () => {
    const initialData = [];
    const initialLabels = [];
    
    // Start from spent amount and gradually increase to committed amount
    const startValue = spentAmount;
    const endValue = committedAmount;
    const steps = 10;
    
    for (let i = 0; i < steps; i++) {
      const time = new Date(Date.now() - (steps - 1 - i) * 30000); // 30 seconds apart
      initialLabels.push(time.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
      
      // Progressive increase from spent to committed with some realistic variation
      const progress = i / (steps - 1);
      const baseValue = startValue + (endValue - startValue) * progress;
      const variation = (Math.random() - 0.5) * Math.max(baseValue * 0.05, 1000); // ±5% or ±1000 MAD
      const value = Math.max(0, Math.min(initialAmount, baseValue + variation));
      
      initialData.push(value);
    }
    
    setDataPoints(initialData);
    setTimeLabels(initialLabels);
  };

  const addDataPoint = () => {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    setTimeLabels(prev => {
      const newLabels = [...prev, timeLabel];
      return newLabels.length > maxDataPoints ? newLabels.slice(1) : newLabels;
    });

    setDataPoints(prev => {
      const lastValue = prev[prev.length - 1] || committedAmount;
      
      // Simulate realistic budget changes based on actual budget constraints
      const maxChange = Math.min(initialAmount * 0.01, 5000); // Max 1% of initial or 5000 MAD
      const change = (Math.random() - 0.5) * maxChange;
      
      // Ensure new value stays within realistic bounds
      const newValue = Math.max(
        spentAmount * 0.9, // Don't go below 90% of spent amount
        Math.min(
          Math.min(initialAmount, committedAmount * 1.1), // Don't exceed initial amount or 110% of committed
          lastValue + change
        )
      );
      
      const newData = [...prev, newValue];
      return newData.length > maxDataPoints ? newData.slice(1) : newData;
    });
  };

  const resetData = () => {
    setIsRunning(false);
    initializeData();
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Montant Engagé',
        data: dataPoints,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2
      },
      {
        label: 'Budget Initial',
        data: timeLabels.map(() => initialAmount),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Montant Dépensé',
        data: timeLabels.map(() => spentAmount),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
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
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
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
        },
        ticks: {
          maxTicksLimit: 8
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(59, 130, 246)',
        hoverBorderColor: 'white',
        hoverBorderWidth: 2
      }
    }
  };

  const currentValue = dataPoints[dataPoints.length - 1] || 0;
  const previousValue = dataPoints[dataPoints.length - 2] || currentValue;
  const change = currentValue - previousValue;
  const changePercentage = previousValue !== 0 ? (change / previousValue) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Suivi en Temps Réel</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Simulation basée sur les données réelles du budget
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={resetData}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={toggleRunning}
              className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                isRunning 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Démarrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Value Display */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Engagé Actuel</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(currentValue)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Budget Initial</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(initialAmount)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Dépensé</p>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {formatCurrency(spentAmount)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Variation</p>
            <p className={`text-2xl font-bold mt-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? '+' : ''}{formatCurrency(Math.abs(change))}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isRunning ? 'Mise à jour en cours...' : 'En pause'}
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            {dataPoints.length} points de données
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;