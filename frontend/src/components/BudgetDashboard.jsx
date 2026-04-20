import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import axios from 'axios';

const budgetApi = axios.create({
  baseURL: 'http://localhost:8082/api/budget'
});

budgetApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const BudgetDashboard = () => {
  const [user, setUser] = useState(null);
  const [budgetLines, setBudgetLines] = useState([]);
  const [filteredLines, setFilteredLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/auth');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(parsedUser.role)) {
      setError('Access Denied: You need administrator privileges to access the Budget Management Dashboard.');
      setLoading(false);
      return;
    }
    
    fetchBudgetData();
  }, [navigate]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const response = await budgetApi.get('/all');
      setBudgetLines(response.data);
      setFilteredLines(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const totalBudget = budgetLines.reduce((sum, line) => sum + (line.initialAmount || 0), 0);
    const totalCommitted = budgetLines.reduce((sum, line) => sum + (line.committedAmount || 0), 0);
    const remainingBalance = totalBudget - totalCommitted;
    
    return {
      totalBudget,
      totalCommitted,
      remainingBalance
    };
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      setUploadSuccess(false);
      await budgetApi.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadSuccess(true);
      await fetchBudgetData();
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError('Failed to upload Excel file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const filterBudgetLines = useCallback(() => {
    let filtered = budgetLines;
    
    if (searchTerm) {
      filtered = filtered.filter(line => 
        line.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        line.fullCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(line => line.type === typeFilter);
    }
    
    setFilteredLines(filtered);
  }, [budgetLines, searchTerm, typeFilter]);

  useEffect(() => {
    filterBudgetLines();
  }, [filterBudgetLines]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budget data...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access Denied')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-1">Service Comptabilité - Manage your organization's budget</p>
          </div>
        </div>
      </div>
      
      {error && !error.includes('Access Denied') && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700">Excel file uploaded and processed successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalBudget)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Committed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalCommitted)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining Balance</p>
              <p className={`text-2xl font-bold mt-1 ${
                summary.remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.remainingBalance)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              summary.remainingBalance >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {summary.remainingBalance >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Budget Data</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
            )}
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Processing...' : 'Drop Excel file here or click to browse'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports .xlsx and .xls files
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Budget Lines</h2>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by article, label, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="MDD">MDD</option>
                <option value="INV">INV</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paragraph
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Line
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Label
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Initial Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No budget lines found</p>
                    <p className="text-sm">
                      {budgetLines.length === 0 
                        ? 'Import an Excel file to get started' 
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLines.map((line, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {line.fullCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(line.type)}`}>
                        {line.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {line.article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {line.paragraph}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {line.line}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {line.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(line.initialAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredLines.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {filteredLines.length} of {budgetLines.length} budget lines
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetDashboard;