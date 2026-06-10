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
  Download
} from 'lucide-react';
import axios from 'axios';
import { useSidebar } from '../../contexts/SidebarContext';
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

const ProjectDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();
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
        <div className={designSystem.layout.section}>
          {/* Header */}
          <PageHeader
            title={project.name}
            subtitle={project.marketTitle || 'Marché associé'}
            icon={Building}
            breadcrumb={[
              { label: 'Construction', href: '/construction' },
              { label: 'Projets', href: '/construction/projects' },
              { label: project.name }
            ]}
            action={
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={ArrowLeft}
                  onClick={() => navigate('/construction/projects')}
                >
                  Retour
                </Button>
                <Button
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setShowCreateDecompte(true)}
                >
                  Nouveau Décompte
                </Button>
              </div>
            }
          />

          {/* Project Statistics */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            <StatCard
              label="Progrès Physique"
              value={`${stats.progressPercent.toFixed(1)}%`}
              icon={Percent}
              color="blue"
            />
            <StatCard
              label="Progrès Financier"
              value={`${stats.financialProgress.toFixed(1)}%`}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Total Décomptes"
              value={stats.totalDecomptes}
              icon={FileText}
              color="purple"
            />
            <StatCard
              label="En Attente"
              value={stats.pendingDecomptes}
              icon={Clock}
              color="yellow"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Project Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* Main Project Info */}
              <Card title="Détails du Projet" icon={Building}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nom du Projet</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{project.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Marché Associé</label>
                      <p className="text-gray-900 mt-1">{project.marketTitle || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fournisseur</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{project.marketSupplier || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Code Ligne Budgétaire</label>
                      <p className="text-gray-900 mt-1">{project.budgetLineCode || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Valeur du Contrat</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(stats.contractAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Montant Payé</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(stats.paidAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Restant à Payer</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-xl font-bold text-gray-600">
                          {formatCurrency(stats.contractAmount - stats.paidAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="mt-8 space-y-6">
                  {/* Physical Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Progrès Physique</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {stats.progressPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Progrès Financier</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {stats.financialProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${Math.min(stats.financialProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Decomptes List */}
              <Card 
                title="Décomptes du Projet" 
                icon={FileText}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setShowCreateDecompte(true)}
                  >
                    Nouveau
                  </Button>
                }
              >
                {decomptes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Aucun Décompte"
                    description="Ce projet n'a pas encore de décomptes de paiement."
                    action={
                      <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setShowCreateDecompte(true)}
                      >
                        Créer le Premier Décompte
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {decomptes.map((decompte) => (
                      <DecompteCard
                        key={decompte.uuid}
                        decompte={decompte}
                        onPay={handlePayDecompte}
                        showProject={false}
                      />
                    ))}
                    
                    {decomptes.length > 5 && (
                      <div className="text-center pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/construction/decomptes?project=${id}`)}
                        >
                          Voir Tous les Décomptes ({decomptes.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Stats */}
              <Card title="Résumé" icon={BarChart3}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Statut Projet</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stats.progressPercent >= 100 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {stats.progressPercent >= 100 ? 'Terminé' : 'En Cours'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Décomptes Total</span>
                      <span className="font-medium text-gray-900">{stats.totalDecomptes}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">En Attente</span>
                      <span className="font-medium text-yellow-600">{stats.pendingDecomptes}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payés</span>
                      <span className="font-medium text-green-600">{stats.paidDecomptes}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Montant Total</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(stats.totalDecomptesAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card title="Actions" icon={Settings}>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    icon={Plus}
                    className="w-full"
                    onClick={() => setShowCreateDecompte(true)}
                  >
                    Nouveau Décompte
                  </Button>

                  <Button
                    variant="secondary"
                    icon={Eye}
                    className="w-full"
                    onClick={() => navigate(`/construction/decomptes?project=${id}`)}
                  >
                    Voir Décomptes
                  </Button>

                  <Button
                    variant="outline"
                    icon={Download}
                    className="w-full"
                  >
                    Exporter Rapport
                  </Button>

                  <Button
                    variant="outline"
                    icon={BarChart3}
                    className="w-full"
                  >
                    Analyses
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Create Decompte Modal */}
          <CreateDecompteModal
            isOpen={showCreateDecompte}
            onClose={() => setShowCreateDecompte(false)}
            onSubmit={handleCreateDecompte}
            projects={project ? [project] : []}
            selectedProject={project}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsView;