import { useState, useEffect } from 'react';
import { 
  FilePlus, 
  CheckCircle, 
  Building, 
  Shield, 
  AlertCircle,
  Calendar,
  User,
  FileText,
  X,
  TrendingUp,
  Eye,
  Grid3X3,
  List
} from 'lucide-react';
import axios from 'axios';
import LoadingSkeleton from './LoadingSkeleton';
import CreateMarketWizard from './market/CreateMarketWizard';
import MarketCard from './market/MarketCard';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import { formatCurrency } from '../utils/currency';
import { designSystem } from '../styles/designSystem';
import PageHeader from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Button from './ui/Button';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';

// Create API instance for operation service
const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const MarketManagement = () => {
  const [markets, setMarkets] = useState([]);
  const [budgetLines, setBudgetLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both budget lines and existing markets
      const [budgetResponse, marketsResponse] = await Promise.all([
        operationApi.get('/budget/all'),
        operationApi.get('/markets/my-org')
      ]);

      setBudgetLines(budgetResponse.data);
      setMarkets(marketsResponse.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Échec du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarket = async (formData) => {
    try {
      setSubmitting(true);
      
      const payload = {
        title: formData.title.trim(),
        supplier: formData.supplierName.trim(),
        totalAmount: parseFloat(formData.totalAmount),
        budgetLineUuid: formData.budgetLineId, // Form stores UUID in budgetLineId field
      };

      console.log('Sending payload:', payload);
      const response = await operationApi.post('/markets/create', payload);
      
      // Add the new market to the list
      setMarkets(prev => [response.data, ...prev]);
      
      // Close wizard
      setShowCreateWizard(false);
      
      // Refresh data to get updated budget commitments
      await fetchInitialData();
      
    } catch (err) {
      console.error('Failed to create market:', err);
      setError('Échec de la création du marché. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignMarket = async (marketUuid) => {
    try {
      const response = await operationApi.patch(`/markets/${marketUuid}/sign`);
      
      // Update the market status in the list
      setMarkets(prev => prev.map(market => 
        market.uuid === marketUuid 
          ? { ...market, status: 'SIGNED' }
          : market
      ));
      
    } catch (err) {
      console.error('Failed to sign market:', err);
      setError('Échec de la signature du marché. Veuillez réessayer.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            📝 BROUILLON
          </span>
        );
      case 'SIGNED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            SIGNÉ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-80 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse w-48"></div>
            </div>
          </div>
          
          {/* Table Skeleton */}
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          {/* Header */}
          <PageHeader
            title="Gestion des Marchés Publics"
            subtitle="Gérer les contrats et les opérations de marché"
            icon={Building}
            action={
              <Button
                variant="primary"
                icon={FilePlus}
                onClick={() => setShowCreateWizard(true)}
              >
                Créer un Nouveau Marché
              </Button>
            }
          />

          {/* Summary Dashboard */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            <StatCard
              label="Total des Marchés"
              value={markets.length}
              icon={Building}
              color="blue"
            />
            <StatCard
              label="Marchés Signés"
              value={markets.filter(m => m.status === 'SIGNED').length}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              label="En Attente"
              value={markets.filter(m => m.status === 'DRAFT').length}
              icon={Calendar}
              color="yellow"
            />
            <StatCard
              label="Valeur Totale"
              value={formatCurrency(markets.reduce((sum, market) => sum + (market.totalAmount || 0), 0))}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 flex-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Create Market Wizard */}
          <CreateMarketWizard
            isOpen={showCreateWizard}
            onClose={() => setShowCreateWizard(false)}
            onSubmit={handleCreateMarket}
            budgetLines={budgetLines}
            submitting={submitting}
          />

          {/* Markets Table/Cards */}
          <Card
            title="Aperçu des Marchés"
            icon={FileText}
            action={
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>Tableau</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>Cartes</span>
                </button>
              </div>
            }
            padding={false}
          >
            {markets.length === 0 ? (
              <EmptyState
                icon={Building}
                title="Aucun Marché Trouvé"
                description="Commencez par créer votre premier contrat de marché."
                action={
                  <Button
                    variant="primary"
                    icon={FilePlus}
                    onClick={() => setShowCreateWizard(true)}
                  >
                    Créer un Nouveau Marché
                  </Button>
                }
              />
            ) : viewMode === 'cards' ? (
              /* Card View */
              <div className="p-6">
                <div className={`${designSystem.layout.grid.cols3} ${designSystem.layout.grid.gap}`}>
                  {markets.map((market) => {
                    const linkedBudget = budgetLines.find(line => 
                      line.uuid === market.budgetLineUuid
                    );
                    
                    return (
                      <MarketCard
                        key={market.uuid}
                        market={market}
                        linkedBudget={linkedBudget}
                        onSign={handleSignMarket}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fournisseur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget Lié
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {markets.map((market) => {
                      // Find linked budget using the UUID from backend response
                      const linkedBudget = budgetLines.find(line => 
                        line.uuid === market.budgetLineUuid
                      );
                      
                      return (
                        <tr key={market.uuid} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{market.title}</div>
                                <div className="text-sm text-gray-500">ID: {market.uuid?.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{market.supplier}</div>
                                <div className="text-xs text-gray-500">Fournisseur</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(market.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {linkedBudget ? (
                              <div className="bg-gray-50 rounded-lg p-3 border">
                                <div className="text-sm font-mono font-medium text-gray-900">{linkedBudget.fullCode}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs mt-1">{linkedBudget.label}</div>
                                <div className="text-xs text-blue-600 mt-1">
                                  Budget: {formatCurrency(linkedBudget.initialAmount)}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <span className="text-sm text-red-600 font-medium">Budget non trouvé</span>
                                <div className="text-xs text-red-500 mt-1">
                                  ID: {market.budgetLineUuid || market.budgetLineId || 'N/A'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(market.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {market.status === 'DRAFT' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  icon={CheckCircle}
                                  onClick={() => handleSignMarket(market.uuid)}
                                >
                                  Signer
                                </Button>
                              )}
                              {market.status === 'SIGNED' && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-green-600 font-medium text-sm">Terminé</span>
                                </div>
                              )}
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketManagement;