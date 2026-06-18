import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hammer, 
  Plus, 
  CheckCircle, 
  Building, 
  AlertTriangle,
  Calendar,
  FileText,
  X,
  TrendingUp,
  Eye,
  Grid3X3,
  List,
  DollarSign,
  Truck,
  ClipboardCheck,
  Percent
} from 'lucide-react';
import axios from 'axios';
import { useSidebar } from '../contexts/SidebarContext';
import LoadingSkeleton from './LoadingSkeleton';
import CreateProjectWizard from './construction/CreateProjectWizard';
import CreateDecompteModal from './construction/CreateDecompteModal';
import ProjectCard from './construction/ProjectCard';
import DecompteCard from './construction/DecompteCard';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import { useAuth } from '../contexts/AuthContext';
import { canEdit } from '../utils/roles';
import ReadOnlyBanner from './ui/ReadOnlyBanner';
import { formatCurrency } from '../utils/currency';
import { designSystem, getContainerClasses } from '../styles/designSystem';
import PageHeader from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Button from './ui/Button';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';

// Create API instance for operation service
const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const ConstructionManagement = () => {
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const editable = canEdit(user);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [decomptes, setDecomptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateProjectWizard, setShowCreateProjectWizard] = useState(false);
  const [showCreateDecompteModal, setShowCreateDecompteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('projects'); // 'projects' or 'decomptes'

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch signed markets (for creating projects) and existing projects
      const [marketsResponse, projectsResponse] = await Promise.all([
        operationApi.get('/markets/my-org'),
        operationApi.get('/projects/')
      ]);

      // Only get signed markets that don't already have projects
      const allMarkets = marketsResponse.data;
      const signedMarkets = allMarkets.filter(market => market.status === 'SIGNED');
      const projectData = projectsResponse.data;

      setMarkets(signedMarkets);
      setProjects(projectData);
      
      // Fetch all decomptes from backend
      if (projectData.length > 0) {
        try {
          // Try to fetch all decomptes
          const decomptesResponse = await operationApi.get('/decomptes');
          let allDecomptes = decomptesResponse.data;
          
          // Enrich decomptes with project information for display
          allDecomptes = allDecomptes.map(decompte => {
            const associatedProject = projectData.find(p => p.uuid === decompte.projectUuid);
            return {
              ...decompte,
              projectName: associatedProject ? associatedProject.name : 'Projet inconnu',
              project: associatedProject
            };
          });
          
          console.log('Fetched decomptes:', allDecomptes);
          setDecomptes(allDecomptes);
        } catch (decompteError) {
          console.warn('Could not fetch all decomptes, trying individual project decomptes:', decompteError);
          
          // Fallback: fetch decomptes for each project individually
          try {
            const allDecomptes = [];
            for (const project of projectData) {
              try {
                const projectDecomptesResponse = await operationApi.get(`/decomptes/project/${project.uuid}`);
                const projectDecomptes = projectDecomptesResponse.data.map(decompte => ({
                  ...decompte,
                  projectName: project.name,
                  project: project
                }));
                allDecomptes.push(...projectDecomptes);
              } catch (projectDecompteError) {
                console.warn(`Could not fetch decomptes for project ${project.uuid}:`, projectDecompteError);
              }
            }
            setDecomptes(allDecomptes);
          } catch (individualError) {
            console.warn('Could not fetch individual project decomptes:', individualError);
            setDecomptes([]);
          }
        }
      } else {
        setDecomptes([]);
      }
      
    } catch (err) {
      console.error('Failed to fetch construction data:', err);
      setError('Échec du chargement des données de construction. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      setSubmitting(true);
      
      const payload = {
        name: formData.projectName.trim(),
        marketUuid: formData.marketUuid,
      };

      console.log('Creating project with payload:', payload);
      const response = await operationApi.post('/projects/create', payload);
      
      // Add the new project to the list
      setProjects(prev => [response.data, ...prev]);
      
      // Close wizard
      setShowCreateProjectWizard(false);
      
      // Refresh data
      await fetchInitialData();
      
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Échec de la création du projet. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
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

      console.log('Creating decompte with payload:', payload);
      const response = await operationApi.post('/decomptes/create', payload);
      
      // Add the new decompte to the list
      setDecomptes(prev => [response.data, ...prev]);
      
      // Close modal
      setShowCreateDecompteModal(false);
      setSelectedProject(null);
      
      // Refresh data
      await fetchInitialData();
      
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
      
      // Update the decompte status in the list
      setDecomptes(prev => prev.map(decompte => 
        decompte.uuid === decompteUuid 
          ? { ...decompte, status: 'PAID' }
          : decompte
      ));
      
      // Refresh data to get updated project totals
      await fetchInitialData();
      
    } catch (err) {
      console.error('Failed to pay decompte:', err);
      setError('Échec du paiement du décompte. Veuillez réessayer.');
    }
  };

  const openCreateDecompteModal = (project) => {
    setSelectedProject(project);
    setShowCreateDecompteModal(true);
  };

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const totalPaidAmount = projects.reduce((sum, project) => sum + (project.totalPaidAmount || 0), 0);
    const avgProgress = totalProjects > 0 
      ? projects.reduce((sum, project) => sum + (project.physicalProgress || 0), 0) / totalProjects 
      : 0;
    
    // Comprehensive decompte statistics
    const totalDecomptes = decomptes.length;
    const pendingDecomptes = decomptes.filter(d => d.status === 'PENDING').length;
    const paidDecomptes = decomptes.filter(d => d.status === 'PAID').length;
    const rejectedDecomptes = decomptes.filter(d => d.status === 'REJECTED').length;
    const totalDecomptesAmount = decomptes.reduce((sum, d) => sum + (d.amount || 0), 0);
    const pendingDecomptesAmount = decomptes
      .filter(d => d.status === 'PENDING')
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      totalProjects,
      totalPaidAmount,
      avgProgress,
      totalDecomptes,
      pendingDecomptes,
      paidDecomptes,
      rejectedDecomptes,
      totalDecomptesAmount,
      pendingDecomptesAmount
    };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={getContainerClasses(sidebarCollapsed)}>
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
          
          {/* Content Skeleton */}
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={getContainerClasses(sidebarCollapsed)}>
        <div className={designSystem.layout.section}>
          {/* Header */}
          <PageHeader
            title="Gestion de Construction"
            subtitle={editable ? 'Gérer les projets de construction et les décomptes' : 'Consulter les projets de construction et les décomptes'}
            icon={Hammer}
            action={
              editable ? (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    icon={Plus}
                    onClick={() => setShowCreateDecompteModal(true)}
                  >
                    Créer Décompte
                  </Button>
                  <Button
                    variant="primary"
                    icon={Hammer}
                    onClick={() => setShowCreateProjectWizard(true)}
                  >
                    Nouveau Projet
                  </Button>
                </div>
              ) : null
            }
          />

          {!editable && <ReadOnlyBanner />}

          {/* Statistics Dashboard */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            <StatCard
              label="Projets Actifs"
              value={stats.totalProjects}
              icon={Building}
              color="blue"
            />
            <StatCard
              label="Montant Total Payé"
              value={formatCurrency(stats.totalPaidAmount)}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              label="Progrès Moyen"
              value={`${stats.avgProgress.toFixed(1)}%`}
              icon={Percent}
              color="purple"
            />
            <StatCard
              label="Décomptes en Attente"
              value={stats.pendingDecomptes}
              icon={ClipboardCheck}
              color="yellow"
            />
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div onClick={() => navigate('/construction/projects')} className="block">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Projets de Construction</h3>
                    <p className="text-sm text-gray-600">Gérer tous les projets en cours et terminés</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">{stats.totalProjects}</span>
                      <p className="text-gray-500">Total</p>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-green-600">{projects.filter(p => (p.physicalProgress || 0) < 100).length}</span>
                      <p className="text-gray-500">Actifs</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir Tous →
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div onClick={() => navigate('/construction/decomptes')} className="block">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Décomptes de Paiement</h3>
                    <p className="text-sm text-gray-600">Suivre et valider les demandes de paiement</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-sm">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{stats.totalDecomptes}</span>
                      <p className="text-gray-500">Total</p>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-yellow-600">{stats.pendingDecomptes}</span>
                      <p className="text-gray-500">En attente</p>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-blue-600">{stats.paidDecomptes}</span>
                      <p className="text-gray-500">Payés</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir Tous →
                  </Button>
                </div>
              </div>
            </Card>
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
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Create Project Wizard */}
          {editable && (
            <>
              <CreateProjectWizard
                isOpen={showCreateProjectWizard}
                onClose={() => setShowCreateProjectWizard(false)}
                onSubmit={handleCreateProject}
                markets={markets}
                submitting={submitting}
              />

              {/* Create Decompte Modal */}
              <CreateDecompteModal
                isOpen={showCreateDecompteModal}
                onClose={() => {
                  setShowCreateDecompteModal(false);
                  setSelectedProject(null);
                }}
                onSubmit={handleCreateDecompte}
                projects={projects}
                selectedProject={selectedProject}
                submitting={submitting}
              />
            </>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Projects Section */}
            <Card
              title="Projets de Construction"
              icon={Building}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => navigate('/construction/projects')}
                >
                  Voir Tout
                </Button>
              }
            >
              {projects.length === 0 ? (
                <EmptyState
                  icon={Building}
                  title="Aucun Projet Trouvé"
                  description={editable ? 'Créez votre premier projet de construction à partir d\'un marché signé.' : 'Aucun projet de construction n\'a encore été enregistré.'}
                  action={
                    editable ? (
                      <Button
                        variant="primary"
                        icon={Hammer}
                        onClick={() => setShowCreateProjectWizard(true)}
                      >
                        Créer un Projet
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <ProjectCard
                      key={project.uuid}
                      project={project}
                      onCreateDecompte={() => openCreateDecompteModal(project)}
                      canEdit={editable}
                    />
                  ))}
                  {projects.length > 5 && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/construction/projects')}
                      >
                        Voir {projects.length - 5} projets de plus
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Decomptes Section */}
            <Card
              title="Décomptes Récents"
              icon={FileText}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => navigate('/construction/decomptes')}
                >
                  Voir Tout
                </Button>
              }
            >
              {decomptes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Aucun Décompte"
                  description="Les décomptes de paiement apparaîtront ici une fois créés."
                  action={
                    editable ? (
                      <Button
                        variant="secondary"
                        icon={Plus}
                        onClick={() => setShowCreateDecompteModal(true)}
                      >
                        Créer Décompte
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <div className="space-y-4">
                  {decomptes.slice(0, 5).map((decompte) => (
                    <DecompteCard
                      key={decompte.uuid}
                      decompte={decompte}
                      onPay={handlePayDecompte}
                      canEdit={editable}
                    />
                  ))}
                  {decomptes.length > 5 && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/construction/decomptes')}
                      >
                        Voir {decomptes.length - 5} décomptes de plus
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card
              title={editable ? 'Actions Rapides' : 'Accès Rapide'}
              subtitle={editable ? 'Raccourcis pour les tâches fréquentes' : 'Consulter les sections principales'}
              icon={TrendingUp}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {editable && (
                  <>
                    <Button
                      variant="secondary"
                      icon={Building}
                      className="w-full justify-start h-auto py-4"
                      onClick={() => setShowCreateProjectWizard(true)}
                    >
                      <div className="text-left">
                        <div className="font-medium">Nouveau Projet</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Créer à partir d'un marché signé
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      icon={FileText}
                      className="w-full justify-start h-auto py-4"
                      onClick={() => setShowCreateDecompteModal(true)}
                    >
                      <div className="text-left">
                        <div className="font-medium">Créer Décompte</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Demande de paiement
                        </div>
                      </div>
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  icon={Eye}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => navigate('/construction/projects')}
                >
                  <div className="text-left">
                    <div className="font-medium">Voir Projets</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Liste complète des projets
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="secondary"
                  icon={ClipboardCheck}
                  className="w-full justify-start h-auto py-4"
                  onClick={() => navigate('/construction/decomptes')}
                >
                  <div className="text-left">
                    <div className="font-medium">Voir Décomptes</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Gestion des paiements
                    </div>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionManagement;