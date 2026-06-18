import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building, 
  ArrowLeft, 
  Plus,
  FileText,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  PieChart
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
import DecompteCard from './DecompteCard';

// API setup
const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

// Chart Components
const CircularProgressChart = ({ percentage, size = 120, strokeWidth = 8, color = '#3B82F6', label, value }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{value}</p>
      </div>
    </div>
  );
};

const DonutChart = ({ data, size = 140, strokeWidth = 20 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  let cumulativePercentage = 0;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercentage * (circumference / 100);
          cumulativePercentage += item.percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900">
          {data.reduce((sum, item) => sum + item.value, 0)}
        </span>
        <span className="text-xs text-gray-500">Total</span>
      </div>
    </div>
  );
};

const VerticalBarChart = ({ data, height = 100, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end space-x-2" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.value / max) * (height - 20);
        return (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-gray-600 mb-1">
              {formatCurrency(item.value)}
            </div>
            <div
              className="rounded-t transition-all duration-500 ease-out"
              style={{
                height: `${barHeight}px`,
                width: '24px',
                backgroundColor: item.color,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-500 mt-1 text-center">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TimelineChart = ({ decomptes }) => {
  if (!decomptes || decomptes.length === 0) return null;

  const sortedDecomptes = [...decomptes].sort((a, b) => 
    new Date(a.validationDate || a.createdDate || 0) - new Date(b.validationDate || b.createdDate || 0)
  );

  let cumulativeAmount = 0;

  return (
    <div className="space-y-3">
      {sortedDecomptes.map((decompte, index) => {
        cumulativeAmount += parseFloat(decompte.amount) || 0;
        const isPaid = decompte.status === 'PAID';
        
        return (
          <div key={decompte.uuid} className="flex items-center space-x-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${
                isPaid 
                  ? 'bg-green-500 border-green-500' 
                  : decompte.status === 'PENDING'
                  ? 'bg-yellow-500 border-yellow-500'
                  : 'bg-red-500 border-red-500'
              }`} />
              {index < sortedDecomptes.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 mt-1" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {decompte.label}
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(parseFloat(decompte.amount) || 0)}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {decompte.validationDate 
                    ? new Date(decompte.validationDate).toLocaleDateString('fr-FR')
                    : 'En attente'
                  }
                </span>
                <span>Cumul: {formatCurrency(cumulativeAmount)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProjectDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const editable = canEdit(user);
  const [project, setProject] = useState(null);
  const [decomptes, setDecomptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDecompte, setShowCreateDecompte] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct GET endpoint for project details
      const projectResponse = await operationApi.get(`/projects/${id}`);
      const projectData = projectResponse.data;
      
      setProject(projectData);
      
      // Set decomptes from the ProjectDetailsResponse - it includes all decomptes for this project
      if (projectData.decomptes && Array.isArray(projectData.decomptes)) {
        setDecomptes(projectData.decomptes);
      } else {
        setDecomptes([]);
      }
      
    } catch (err) {
      console.error('Failed to fetch project details:', err);
      setError('Échec du chargement des détails du projet.');
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
        projectUuid: id,
      };

      const response = await operationApi.post('/decomptes/create', payload);
      setDecomptes(prev => [response.data, ...prev]);
      setShowCreateDecompte(false);
      await fetchProjectDetails();
      
    } catch (err) {
      console.error('Failed to create decompte:', err);
      setError('Échec de la création du décompte.');
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
      
      await fetchProjectDetails();
      
    } catch (err) {
      console.error('Failed to pay decompte:', err);
      setError('Échec du paiement du décompte.');
    }
  };

  const getProjectStats = () => {
    if (!project) return {};
    
    const totalDecomptes = decomptes.length;
    const pendingDecomptes = decomptes.filter(d => d.status === 'PENDING').length;
    const paidDecomptes = decomptes.filter(d => d.status === 'PAID').length;
    const totalDecomptesAmount = decomptes.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const paidAmount = parseFloat(project.totalPaidAmount) || 0; // From ProjectDetailsResponse
    const progressPercent = project.physicalProgress || 0;
    const contractAmount = parseFloat(project.contractTotalAmount) || 0; // From ProjectDetailsResponse
    const financialProgress = contractAmount > 0 ? (paidAmount / contractAmount) * 100 : 0;

    return {
      totalDecomptes,
      pendingDecomptes,
      paidDecomptes,
      totalDecomptesAmount,
      paidAmount,
      progressPercent,
      financialProgress,
      contractAmount
    };
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/construction/projects')}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              variant="primary"
              onClick={fetchProjectDetails}
              className="flex-1"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projet non trouvé</h2>
          <p className="text-gray-600 mb-6">Le projet demandé n'existe pas ou a été supprimé.</p>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate('/construction/projects')}
          >
            Retour aux Projets
          </Button>
        </div>
      </div>
    );
  }

  const stats = getProjectStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={getContainerClasses(sidebarCollapsed)}>
        <div className="py-4 space-y-4">
          {!editable && <ReadOnlyBanner />}

          {/* Compact Header with Project Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => navigate('/construction/projects')}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{project.marketTitle}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{project.marketSupplier}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{project.budgetLineCode}</span>
                    </div>
                  </div>
                </div>
              </div>
              {editable && (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowCreateDecompte(true)}
                >
                  Nouveau Décompte
                </Button>
              )}
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valeur Contrat</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.contractAmount)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant Payé</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progrès Physique</p>
                  <p className="text-lg font-bold text-blue-600">{stats.progressPercent.toFixed(1)}%</p>
                </div>
                <Percent className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Décomptes ({stats.totalDecomptes})</p>
                  <p className="text-lg font-bold text-purple-600">{stats.pendingDecomptes} en attente</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Progress & Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Circular Progress Charts */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Progression
              </h3>
              <div className="flex justify-around">
                <CircularProgressChart
                  percentage={stats.progressPercent}
                  color="#3B82F6"
                  label="Physique"
                  value={`${stats.progressPercent.toFixed(1)}%`}
                  size={100}
                />
                <CircularProgressChart
                  percentage={stats.financialProgress}
                  color="#10B981"
                  label="Financier"
                  value={`${stats.financialProgress.toFixed(1)}%`}
                  size={100}
                />
              </div>
            </div>

            {/* Financial Breakdown Donut Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Répartition Financière
              </h3>
              <div className="flex items-center space-x-4">
                <DonutChart
                  size={120}
                  data={[
                    {
                      percentage: stats.financialProgress,
                      value: Math.round(stats.paidAmount / 1000),
                      color: '#10B981',
                      label: 'Payé'
                    },
                    {
                      percentage: 100 - stats.financialProgress,
                      value: Math.round((stats.contractAmount - stats.paidAmount) / 1000),
                      color: '#E5E7EB',
                      label: 'Restant'
                    }
                  ]}
                />
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Payé</p>
                      <p className="text-xs text-gray-500">{formatCurrency(stats.paidAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Restant</p>
                      <p className="text-xs text-gray-500">{formatCurrency(stats.contractAmount - stats.paidAmount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decomptes Status Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Statut Décomptes
              </h3>
              {stats.totalDecomptes > 0 ? (
                <div className="space-y-3">
                  <DonutChart
                    size={120}
                    data={[
                      {
                        percentage: (stats.paidDecomptes / stats.totalDecomptes) * 100,
                        value: stats.paidDecomptes,
                        color: '#10B981',
                        label: 'Payés'
                      },
                      {
                        percentage: (stats.pendingDecomptes / stats.totalDecomptes) * 100,
                        value: stats.pendingDecomptes,
                        color: '#F59E0B',
                        label: 'En attente'
                      },
                      {
                        percentage: ((stats.totalDecomptes - stats.paidDecomptes - stats.pendingDecomptes) / stats.totalDecomptes) * 100,
                        value: stats.totalDecomptes - stats.paidDecomptes - stats.pendingDecomptes,
                        color: '#EF4444',
                        label: 'Rejetés'
                      }
                    ].filter(item => item.percentage > 0)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Payés</span>
                      </div>
                      <span className="font-medium">{stats.paidDecomptes}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>En attente</span>
                      </div>
                      <span className="font-medium">{stats.pendingDecomptes}</span>
                    </div>
                    {stats.totalDecomptes - stats.paidDecomptes - stats.pendingDecomptes > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>Rejetés</span>
                        </div>
                        <span className="font-medium">{stats.totalDecomptes - stats.paidDecomptes - stats.pendingDecomptes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun décompte</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Analysis Charts */}
          {decomptes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Decomptes Amount Bar Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                  Montants par Décompte
                </h3>
                <VerticalBarChart
                  data={decomptes.slice(0, 6).map((decompte, index) => ({
                    label: `D${index + 1}`,
                    value: parseFloat(decompte.amount) || 0,
                    color: decompte.status === 'PAID' ? '#10B981' : 
                           decompte.status === 'PENDING' ? '#F59E0B' : '#EF4444'
                  }))}
                  height={120}
                />
                <div className="mt-3 flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Payé</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>En attente</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Rejeté</span>
                  </div>
                </div>
              </div>

              {/* Payment Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Chronologie des Paiements
                </h3>
                <div className="max-h-32 overflow-y-auto">
                  <TimelineChart decomptes={decomptes} />
                </div>
              </div>
            </div>
          )}

          {/* Decomptes Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Décomptes du Projet ({stats.totalDecomptes})
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {stats.pendingDecomptes > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.pendingDecomptes} en attente
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => navigate(`/construction/decomptes?project=${id}`)}
                >
                  Voir Tout
                </Button>
                {editable && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setShowCreateDecompte(true)}
                  >
                    Nouveau
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4">
              {decomptes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Aucun Décompte"
                  description="Ce projet n'a pas encore de décomptes de paiement."
                  action={
                    editable ? (
                      <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setShowCreateDecompte(true)}
                      >
                        Créer le Premier Décompte
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <div className="grid gap-3">
                  {decomptes.slice(0, 5).map((decompte) => (
                    <DecompteCard
                      key={decompte.uuid}
                      decompte={decompte}
                      onPay={handlePayDecompte}
                      showProject={false}
                      canEdit={editable}
                    />
                  ))}
                  
                  {decomptes.length > 5 && (
                    <div className="text-center pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/construction/decomptes?project=${id}`)}
                      >
                        Voir Tous les Décomptes (+{decomptes.length - 5} de plus)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Create Decompte Modal */}
          {editable && (
            <CreateDecompteModal
              isOpen={showCreateDecompte}
              onClose={() => setShowCreateDecompte(false)}
              onSubmit={handleCreateDecompte}
              projects={project ? [project] : []}
              selectedProject={project}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsView;