import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpDown,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';

const budgetApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api/budget'
}));

const BudgetYearComparison = ({ years }) => {
  const [comparisonData, setComparisonData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('fullCode');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (years && years.length > 0) {
      fetchComparisonData();
    }
  }, [years]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data for each year
      const yearDataPromises = years.map(year =>
        budgetApi.get('/all', { params: { year } })
          .then(response => ({ year, data: response.data }))
      );

      const results = await Promise.all(yearDataPromises);

      // Organize data by fullCode
      const organized = {};
      
      results.forEach(({ year, data }) => {
        data.forEach(line => {
          const key = `${line.fullCode}`;
          if (!organized[key]) {
            organized[key] = {
              fullCode: line.fullCode,
              label: line.label,
              type: line.type,
              article: line.article,
              paragraph: line.paragraph,
              line: line.line,
              years: {}
            };
          }
          organized[key].years[year] = {
            initialAmount: line.initialAmount || 0,
            committedAmount: line.committedAmount || 0,
            spentAmount: line.spentAmount || 0,
            fiscalYear: line.fiscalYear
          };
        });
      });

      setComparisonData(organized);
    } catch (err) {
      console.error('Failed to fetch comparison data:', err);
      setError('Impossible de charger les données de comparaison');
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

  const calculateChange = (currentYear, previousYear, field) => {
    const current = comparisonData[field]?.years[currentYear]?.initialAmount || 0;
    const previous = comparisonData[field]?.years[previousYear]?.initialAmount || 0;
    
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const getChangeColor = (change) => {
    if (change === null) return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const sortedLines = Object.values(comparisonData).sort((a, b) => {
    let aValue = a[sortField] || a.fullCode;
    let bValue = b[sortField] || b.fullCode;
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la comparaison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!years || years.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800">Veuillez sélectionner au moins une année pour la comparaison</p>
        </div>
      </div>
    );
  }

  // Calculate totals for each year
  const yearTotals = {};
  years.forEach(year => {
    yearTotals[year] = {
      totalInitial: 0,
      totalCommitted: 0,
      totalSpent: 0,
      lineCount: 0
    };
  });

  Object.values(comparisonData).forEach(line => {
    years.forEach(year => {
      if (line.years[year]) {
        yearTotals[year].totalInitial += line.years[year].initialAmount || 0;
        yearTotals[year].totalCommitted += line.years[year].committedAmount || 0;
        yearTotals[year].totalSpent += line.years[year].spentAmount || 0;
        yearTotals[year].lineCount++;
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {years.map(year => (
          <div key={year} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{year}</h3>
              </div>
              <span className="text-sm text-gray-600">{yearTotals[year].lineCount} lignes</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Budget Initial Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(yearTotals[year].totalInitial)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">Engagé Total</p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatCurrency(yearTotals[year].totalCommitted)}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-600">Dépensé Total</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(yearTotals[year].totalSpent)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Comparaison Détaillée par Ligne</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchComparisonData}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Actualiser</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Download className="h-4 w-4" />
                <span className="text-sm">Exporter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="sticky left-0 z-10 px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('fullCode')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Code</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                {years.map(year => (
                  <th key={year} colSpan="3" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-300 bg-blue-50">
                    {year}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-100">
                <th className="sticky left-0 z-10 px-6 py-2 bg-gray-100"></th>
                <th className="px-6 py-2"></th>
                <th className="px-6 py-2"></th>
                {years.map(year => (
                  <>
                    <th key={`${year}-initial`} className="px-2 py-2 text-center text-xs font-medium text-gray-600 border-l border-gray-300">
                      Initial
                    </th>
                    <th key={`${year}-committed`} className="px-2 py-2 text-center text-xs font-medium text-gray-600">
                      Engagé
                    </th>
                    <th key={`${year}-spent`} className="px-2 py-2 text-center text-xs font-medium text-gray-600">
                      Dépensé
                    </th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLines.map((line) => (
                <tr key={line.fullCode} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap bg-white">
                    <div className="text-sm font-medium text-gray-900">{line.fullCode}</div>
                    <div className="text-xs text-gray-500">{line.article}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {line.label || 'Aucune description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      line.type === 'MDD' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {line.type}
                    </span>
                  </td>
                  {years.map(year => {
                    const yearData = line.years[year];
                    return (
                      <>
                        <td key={`${line.fullCode}-${year}-initial`} className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right border-l border-gray-300">
                          {yearData ? formatCurrency(yearData.initialAmount) : '-'}
                        </td>
                        <td key={`${line.fullCode}-${year}-committed`} className="px-2 py-4 whitespace-nowrap text-sm text-orange-600 text-right">
                          {yearData ? formatCurrency(yearData.committedAmount) : '-'}
                        </td>
                        <td key={`${line.fullCode}-${year}-spent`} className="px-2 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                          {yearData ? formatCurrency(yearData.spentAmount) : '-'}
                        </td>
                      </>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetYearComparison;
