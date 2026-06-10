import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Building,
  User,
  Download
} from 'lucide-react';
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
import axios from 'axios';

const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const DecomptesList = () => {
  const { sidebarCollapsed } = useSidebar();
  const [decomptes, setDecomptes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects first, then we'll need to fetch decomptes for each
      const projectsResponse = await operationApi.get('/projects/');
      const projectsData = projectsResponse.data;
      setProjects(projectsData);
      
      // For now, we'll use mock data for decomptes since there's no "get all decomptes" endpoint
      // In a real implementation, you'd add this endpoint to the backend
      setDecomptes([]);
      
    } catch (err) {
      console.error('Failed to fetch decomptes data:', err);
      setError('Échec du chargement des décomptes.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayDecompte = async (decompteUuid) => {
    try {
      await operationApi.patch(`/decomptes/${decompteUuid}/pay`);
      
      // Update the decompte status
      setDecomptes(prev => prev.map(decompte => 
        decompte.uuid === decompteUuid 
          ? { ...decompte, status: 'PAID', validationDate: new Date().toISOString() }
          : decompte
      ));
      
    } catch (err) {
      console.error('Failed to pay decompte:', err);
      setError('Échec du paiement du décompte.');
    }
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
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PENDING': return 'En Attente';
      case 'REJECTED': return 'Rejeté';
      default: return status;
    }
  };

  const filteredDecomptes = decomptes.filter(decompte => {
    const matchesSearch = decompte.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decompte.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || decompte.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = decomptes.length;
    const pending = decomptes.filter(d => d.status === 'PENDING').length;
    const paid = decomptes.filter(d => d.status === 'PAID').length;
    const totalAmount = decomptes.reduce((sum, d) => sum + (d.amount || 0), 0);
    const paidAmount = decomptes.filter(d => d.status === 'PAID').reduce((sum, d) => sum + (d.amount || 0), 0);

    return { total, pending, paid, totalAmount, paidAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={getContainerClasses(sidebarCollapsed)}>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={getContainerClasses(sidebarCollapsed)}>
        <div className={designSystem.layout.section}>
          <PageHeader
            title="Liste des Décomptes"
            subtitle="Gérer tous les décomptes de paiement"
            icon={FileText}
            action={
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={Download}
                >
                  Exporter
                </Button>
                <Button
                  variant="primary"
                  icon={FileText}
                >
                  Nouveau Décompte
                </Button>
              </div>
            }
          />

          {/* Statistics */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            <StatCard
              label="Total Décomptes"
              value={stats.total}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="En Attente"
              value={stats.pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              label="Payés"
              value={stats.paid}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              label="Montant Total"
              value={formatCurrency(stats.totalAmount)}
              icon={DollarSign}
              color="purple"
            />
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par libellé ou projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="PENDING">En Attente</option>
                    <option value="PAID">Payé</option>
                    <option value="REJECTED">Rejeté</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {filteredDecomptes.length} résultat{filteredDecomptes.length > 1 ? 's' : ''}
              </div>
            </div>
          </Card>

          {/* Decomptes Table */}
          <Card padding={false}>
            {filteredDecomptes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucun Décompte Trouvé"
                description={decomptes.length === 0 
                  ? "Aucun décompte n'a été créé pour le moment."
                  : "Aucun décompte ne correspond aux critères de recherche."
                }
                action={
                  <Button variant="primary" icon={FileText}>
                    Créer un Décompte
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Décompte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDecomptes.map((decompte) => (
                      <tr key={decompte.uuid} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{decompte.label}</div>
                              <div className="text-sm text-gray-500">ID: {decompte.uuid?.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{decompte.projectName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(decompte.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(decompte.status)}`}>
                            {getStatusIcon(decompte.status)}
                            <span className="ml-1">{getStatusText(decompte.status)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {decompte.validationDate 
                              ? new Date(decompte.validationDate).toLocaleDateString('fr-FR')
                              : 'Non définie'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {decompte.status === 'PENDING' && (
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
                            >
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default DecomptesList;