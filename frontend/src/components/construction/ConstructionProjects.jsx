import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Plus, 
  Eye, 
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  Percent,
  DollarSign,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp
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
import CreateProjectWizard from './CreateProjectWizard';

// API setup
const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const ConstructionProjects = () => {
  const { sidebarCollapsed } = useSidebar();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'progress', 'amount', 'date'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [marketsResponse, projectsResponse] = await Promise.all([
        operationApi.get('/markets/my-org'),
        operationApi.get('/projects/')
      ]);

      const allMarkets = marketsResponse.data;
      const signedMarkets = allMarkets.filter(market => market.status === 'SIGNED');
      
      setMarkets(signedMarkets);
      setProjects(projectsResponse.data);
      
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Échec du chargement des projets. Veuillez réessayer.');
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

      const response = await operationApi.post('/projects/create', payload);
      setProjects(prev => [response.data, ...prev]);
      setShowCreateWizard(false);
      await fetchProjectsData();
      
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Échec de la création du projet. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => (p.physicalProgress || 0) < 100).length;
    const completedProjects = projects.filter(p => (p.physicalProgress || 0) >= 100).length;
    const totalValue = projects.reduce((sum, project) => sum + (project.marketAmount || 0), 0);
    const totalPaid = projects.reduce((sum, project) => sum + (project.totalPaidAmount || 0), 0);
    const avgProgress = totalProjects > 0 
      ? projects.reduce((sum, project) => sum + (project.physicalProgress || 0), 0) / totalProjects 
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalValue,
      totalPaid,
      avgProgress
    };
  };

  const filteredAndSortedProjects = () => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.marketTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.marketSupplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => {
        const progress = project.physicalProgress || 0;
        if (filterStatus === 'active') return progress < 100;
        if (filterStatus === 'completed') return progress >= 100;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return (b.physicalProgress || 0) - (a.physicalProgress || 0);
        case 'amount':
          return (b.marketAmount || 0) - (a.marketAmount || 0);
        case 'date':
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const ProjectGridCard = ({ project }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {project.marketTitle}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progrès</span>
            <span className="text-sm font-bold text-blue-600">
              {(project.physicalProgress || 0).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                (project.physicalProgress || 0) >= 90 ? 'bg-green-500' :
                (project.physicalProgress || 0) >= 50 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(project.physicalProgress || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Fournisseur</span>
            </div>
            <span className="font-medium text-gray-900 truncate ml-2">
              {project.marketSupplier}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Valeur</span>
            </div>
            <span className="font-medium text-gray-900">
              {formatCurrency(project.marketAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Payé</span>
            </div>
            <span className="font-bold text-green-600">
              {formatCurrency(project.totalPaidAmount || 0)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate(`/construction/projects/${project.uuid}`)}
          >
            Voir Détails
          </Button>
        </div>
      </div>
    </div>
  );

  const ProjectListRow = ({ project }) => (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {project.marketTitle}
            </p>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Fournisseur</p>
              <p className="font-medium text-gray-900">{project.marketSupplier}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">Progrès</p>
              <p className="font-bold text-blue-600">
                {(project.physicalProgress || 0).toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">Valeur</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(project.marketAmount || 0)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">Payé</p>
              <p className="font-bold text-green-600">
                {formatCurrency(project.totalPaidAmount || 0)}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/construction/projects/${project.uuid}`)}
          />
        </div>
      </div>
    </div>
  );

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

  const stats = getProjectStats();
  const filteredProjects = filteredAndSortedProjects();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={getContainerClasses(sidebarCollapsed)}>
        <div className={designSystem.layout.section}>
          {/* Header */}
          <PageHeader
            title="Projets de Construction"
            subtitle={`${stats.totalProjects} projets • ${stats.activeProjects} actifs • ${stats.completedProjects} terminés`}
            icon={Building}
            action={
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateWizard(true)}
              >
                Nouveau Projet
              </Button>
            }
          />

          {/* Statistics */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            <StatCard
              label="Total Projets"
              value={stats.totalProjects}
              icon={Building}
              color="blue"
            />
            <StatCard
              label="Projets Actifs"
              value={stats.activeProjects}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label="Valeur Totale"
              value={formatCurrency(stats.totalValue)}
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              label="Progrès Moyen"
              value={`${stats.avgProgress.toFixed(1)}%`}
              icon={Percent}
              color="yellow"
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
                    placeholder="Rechercher des projets..."
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
                  <option value="active">Projets actifs</option>
                  <option value="completed">Projets terminés</option>
                </select>

                {/* Sort */}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Trier par nom</option>
                  <option value="progress">Trier par progrès</option>
                  <option value="amount">Trier par montant</option>
                  <option value="date">Trier par date</option>
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

          {/* Projects Grid/List */}
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={Building}
              title="Aucun Projet Trouvé"
              description={
                searchTerm || filterStatus !== 'all' 
                  ? "Aucun projet ne correspond aux critères de recherche." 
                  : "Créez votre premier projet de construction à partir d'un marché signé."
              }
              action={
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowCreateWizard(true)}
                >
                  Créer un Projet
                </Button>
              }
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectGridCard key={project.uuid} project={project} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <ProjectListRow key={project.uuid} project={project} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Project Wizard */}
          <CreateProjectWizard
            isOpen={showCreateWizard}
            onClose={() => setShowCreateWizard(false)}
            onSubmit={handleCreateProject}
            markets={markets}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ConstructionProjects;