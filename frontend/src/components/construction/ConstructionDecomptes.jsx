import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Eye, 
  Search,
  Filter,
  Grid3X3,
  List,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Building,
  Calendar,
  AlertTriangle,
  TrendingUp,
  User
} from 'lucide-react';
import axios from 'axios';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import { canEdit } from '../../utils/roles';
import ReadOnlyBanner from '../ui/ReadOnlyBanner';
import { setupApiInterceptors } from '../../utils/apiInterceptors';
import { formatCurrency } from '../../utils/currency';
import { designSystem, getContainerClasses } from '../../styles/designSystem';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../LoadingSkeleton';
import CreateDecompteModal from './CreateDecompteModal';

// API setup
const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const ConstructionDecomptes = () => {
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const editable = canEdit(user);
  const navigate = useNavigate();
  const [decomptes, setDecomptes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDecomptesData();
  }, []);

  const fetchDecomptesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsResponse, decomptesResponse] = await Promise.all([
        operationApi.get('/projects/'),
        operationApi.get('/decomptes')
      ]);

      setProjects(projectsResponse.data);
      setDecomptes(decomptesResponse.data);
      
    } catch (err) {
      console.error('Failed to fetch decomptes:', err);
      setError('Échec du chargement des décomptes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDecompte = async (formData) => {
    try {
      setSubmitting(true);
      
      const payload = {
        label: formData.label.trim(),
        amount: parseFloat(formData.amount),
        projectUuid: formData.projectUuid,
      };

      const response = await operationApi.post('/decomptes/create', payload);
      setDecomptes(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      await fetchDecomptesData();
      
    } catch (err) {
      console.error('Failed to create decompte:', err);
      setError('Échec de la création du décompte. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayDecompte = async (decompteUuid) => {
    try {
      await operationApi.patch(`/decomptes/${decompteUuid}/pay`);
      
      setDecomptes(prev => prev.map(decompte => 
        decompte.uuid === decompteUuid 
          ? { ...decompte, status: 'PAID', validationDate: new Date().toISOString() }
          : decompte
      ));
      
      await fetchDecomptesData();
      
    } catch (err) {
      console.error('Failed to pay decompte:', err);
      setError('Échec du paiement du décompte. Veuillez réessayer.');
    }
  };

  const getDecompteStats = () => {
    const totalDecomptes = decomptes.length;
    const pendingDecomptes = decomptes.filter(d => d.status === 'PENDING').length;
    const paidDecomptes = decomptes.filter(d => d.status === 'PAID').length;
    const rejectedDecomptes = decomptes.filter(d => d.status === 'REJECTED').length;
    const totalAmount = decomptes.reduce((sum, decompte) => sum + (parseFloat(decompte.amount) || 0), 0);
    const paidAmount = decomptes.filter(d => d.status === 'PAID')
      .reduce((sum, decompte) => sum + (parseFloat(decompte.amount) || 0), 0);

    return {
      totalDecomptes,
      pendingDecomptes,
      paidDecomptes,
      rejectedDecomptes,
      totalAmount,
      paidAmount
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Payé' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'En Attente' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Rejeté' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const filteredAndSortedDecomptes = () => {
    let filtered = decomptes;

    if (searchTerm) {
      filtered = filtered.filter(decompte => 
        decompte.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decompte.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(decompte => decompte.status === filterStatus.toUpperCase());
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'label':
          return a.label?.localeCompare(b.label);
        case 'amount':
          return (b.amount || 0) - (a.amount || 0);
        case 'status':
          return a.status?.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
      }
    });

    return filtered;
  };

  const DecompteGridCard = ({ decompte }) => {
    const project = projects.find(p => p.uuid === decompte.projectUuid);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                {decompte.label}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                Projet: {decompte.projectName || project?.name}
              </p>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(decompte.status)}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Montant</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(parseFloat(decompte.amount) || 0)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {project && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Projet</span>
                </div>
                <span className="font-medium text-gray-900 truncate ml-2">
                  {project.name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {decompte.status === 'PAID' ? 'Payé le' : 'Créé le'}
                </span>
              </div>
              <span className="font-medium text-gray-900">
                {new Date(decompte.validationDate || decompte.createdDate).toLocaleDateString('fr-FR')}
              </span>
            </div>

            {project?.marketSupplier && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Fournisseur</span>
                </div>
                <span className="font-medium text-gray-900 truncate ml-2">
                  {project.marketSupplier}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            {decompte.status === 'PENDING' ? (
              <div className="flex space-x-2">
                {editable && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    className="flex-1"
                    onClick={() => handlePayDecompte(decompte.uuid)}
                  >
                    Valider et Payer
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  className="flex-1"
                  onClick={() => navigate(`/construction/decomptes/${decompte.uuid}`)}
                >
                  Voir Détails
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                icon={Eye}
                onClick={() => navigate(`/construction/decomptes/${decompte.uuid}`)}
              >
                Voir Détails
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DecompteListRow = ({ decompte }) => {
    const project = projects.find(p => p.uuid === decompte.projectUuid);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {decompte.label}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {decompte.projectName || project?.name}
              </p>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Montant</p>
                <p className="font-bold text-green-600">
                  {formatCurrency(parseFloat(decompte.amount) || 0)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">Status</p>
                <div className="flex justify-center mt-1">
                  {getStatusBadge(decompte.status)}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(decompte.validationDate || decompte.createdDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {editable && decompte.status === 'PENDING' && (
                <Button
                  variant="success"
                  size="sm"
                  icon={CheckCircle}
                  onClick={() => handlePayDecompte(decompte.uuid)}
                >
                  Payer
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                onClick={() => navigate(`/construction/decomptes/${decompte.uuid}`)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={getContainerClasses(sidebarCollapsed)}>
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-80 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  const stats = getDecompteStats();
  const filteredDecomptes = filteredAndSortedDecomptes();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={getContainerClasses(sidebarCollapsed)}>
        <div className={designSystem.layout.section}>
          {/* Header */}
          <PageHeader
            title="Décomptes de Construction"
            subtitle={`${stats.totalDecomptes} décomptes • ${stats.pendingDecomptes} en attente • ${stats.paidDecomptes} payés`}
            icon={FileText}
            action={
              editable ? (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowCreateModal(true)}
                >
                  Nouveau Décompte
                </Button>
              ) : null
            }
          />

          {!editable && <ReadOnlyBanner />}

          {/* Statistics */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            <StatCard
              label="Total Décomptes"
              value={stats.totalDecomptes}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="En Attente"
              value={stats.pendingDecomptes}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              label="Montant Total"
              value={formatCurrency(stats.totalAmount)}
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              label="Montant Payé"
              value={formatCurrency(stats.paidAmount)}
              icon={TrendingUp}
              color="green"
            />
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher des décomptes..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payés</option>
                  <option value="rejected">Rejetés</option>
                </select>

                {/* Sort */}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Trier par date</option>
                  <option value="label">Trier par libellé</option>
                  <option value="amount">Trier par montant</option>
                  <option value="status">Trier par statut</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={Grid3X3}
                  onClick={() => setViewMode('grid')}
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={List}
                  onClick={() => setViewMode('list')}
                />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 flex-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {/* Decomptes Grid/List */}
          {filteredDecomptes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun Décompte Trouvé"
              description={
                searchTerm || filterStatus !== 'all' 
                  ? "Aucun décompte ne correspond aux critères de recherche." 
                  : "Les décomptes de paiement apparaîtront ici une fois créés."
              }
              action={
                editable && !searchTerm && filterStatus === 'all' ? (
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Créer un Décompte
                  </Button>
                ) : null
              }
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDecomptes.map((decompte) => (
                    <DecompteGridCard key={decompte.uuid} decompte={decompte} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDecomptes.map((decompte) => (
                    <DecompteListRow key={decompte.uuid} decompte={decompte} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Decompte Modal */}
          {editable && (
            <CreateDecompteModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateDecompte}
              projects={projects}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstructionDecomptes;