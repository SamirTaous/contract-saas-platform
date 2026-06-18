import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Building,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Download,
  AlertTriangle,
  Settings,
  Eye,
  Trash2
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
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSkeleton from '../LoadingSkeleton';

// API setup
const operationApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8082/api'
}));

const DecompteDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const editable = canEdit(user);
  const [decompte, setDecompte] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDecompteDetails();
    }
  }, [id]);

  const fetchDecompteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch decompte details (you'll need to implement this endpoint)
      const decompteResponse = await operationApi.get(`/decomptes/${id}`);
      const decompteData = decompteResponse.data;
      setDecompte(decompteData);
      
      // Fetch related project if projectUuid exists
      if (decompteData.projectUuid) {
        try {
          const projectResponse = await operationApi.get(`/projects/${decompteData.projectUuid}`);
          setProject(projectResponse.data);
        } catch (projectError) {
          console.warn('Could not fetch project details:', projectError);
        }
      }
      
    } catch (err) {
      console.error('Failed to fetch decompte details:', err);
      setError('Échec du chargement des détails du décompte.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayDecompte = async () => {
    try {
      setProcessing(true);
      await operationApi.patch(`/decomptes/${id}/pay`);
      
      // Update local state
      setDecompte(prev => ({
        ...prev,
        status: 'PAID',
        validationDate: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error('Failed to pay decompte:', err);
      setError('Échec du paiement du décompte.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDecompte = async () => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter ce décompte ?')) return;
    
    try {
      setProcessing(true);
      // Implement reject endpoint
      await operationApi.patch(`/decomptes/${id}/reject`);
      
      setDecompte(prev => ({
        ...prev,
        status: 'REJECTED',
        rejectionDate: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error('Failed to reject decompte:', err);
      setError('Échec du rejet du décompte.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PAID: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        border: 'border-green-200',
        label: 'Payé'
      },
      PENDING: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        border: 'border-yellow-200',
        label: 'En Attente'
      },
      REJECTED: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        border: 'border-red-200',
        label: 'Rejeté'
      }
    };

    return configs[status] || configs.PENDING;
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
              onClick={() => navigate('/construction/decomptes')}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              variant="primary"
              onClick={fetchDecompteDetails}
              className="flex-1"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!decompte) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Décompte non trouvé</h2>
          <p className="text-gray-600 mb-6">Le décompte demandé n'existe pas ou a été supprimé.</p>
          <Button
            variant="primary"
            icon={ArrowLeft}
            onClick={() => navigate('/construction/decomptes')}
          >
            Retour aux Décomptes
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(decompte.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={getContainerClasses(sidebarCollapsed)}>
        <div className={designSystem.layout.section}>
          {!editable && <ReadOnlyBanner />}

          {/* Header */}
          <PageHeader
            title={decompte.label}
            subtitle={`Décompte #${decompte.uuid?.substring(0, 8)}`}
            icon={FileText}
            breadcrumb={[
              { label: 'Construction', href: '/construction' },
              { label: 'Décomptes', href: '/construction/decomptes' },
              { label: decompte.label }
            ]}
            action={
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={ArrowLeft}
                  onClick={() => navigate('/construction/decomptes')}
                >
                  Retour
                </Button>
                {editable && decompte.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleRejectDecompte}
                      disabled={processing}
                    >
                      Rejeter
                    </Button>
                    <Button
                      variant="success"
                      icon={CheckCircle}
                      onClick={handlePayDecompte}
                      disabled={processing}
                    >
                      {processing ? 'Traitement...' : 'Valider et Payer'}
                    </Button>
                  </div>
                )}
              </div>
            }
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Decompte Details */}
              <Card title="Détails du Décompte" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Libellé</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{decompte.label}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Montant</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(decompte.amount)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Statut</label>
                      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium mt-1 ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {statusConfig.label}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Date de Création</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(decompte.createdDate).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Dates */}
                  <div className="space-y-4">
                    {project && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Projet Associé</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={() => navigate(`/construction/projects/${project.uuid}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {project.name}
                          </button>
                        </div>
                      </div>
                    )}

                    {project?.marketSupplier && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fournisseur</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{project.marketSupplier}</span>
                        </div>
                      </div>
                    )}

                    {decompte.status === 'PAID' && decompte.validationDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date de Paiement</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-900">
                            {new Date(decompte.validationDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    {decompte.status === 'REJECTED' && decompte.rejectionDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date de Rejet</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-gray-900">
                            {new Date(decompte.rejectionDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Project Context (if available) */}
              {project && (
                <Card title="Contexte du Projet" icon={Building}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Valeur du Marché</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(project.marketAmount || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Payé</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(project.totalPaidAmount || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progrès Physique</span>
                        <span className="font-medium text-blue-600">
                          {(project.physicalProgress || 0).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Fournisseur</span>
                        <span className="font-medium text-gray-900 truncate ml-2">
                          {project.marketSupplier}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/construction/projects/${project.uuid}`)}
                    >
                      Voir le Projet Complet
                    </Button>
                  </div>
                </Card>
              )}

              {/* Timeline/History */}
              <Card title="Historique" icon={Calendar}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Décompte créé</span>
                        <span className="text-sm text-gray-500">
                          {new Date(decompte.createdDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Le décompte a été créé et est en attente de validation.
                      </p>
                    </div>
                  </div>

                  {decompte.status === 'PAID' && decompte.validationDate && (
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Décompte payé</span>
                          <span className="text-sm text-gray-500">
                            {new Date(decompte.validationDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Le paiement a été validé et effectué.
                        </p>
                      </div>
                    </div>
                  )}

                  {decompte.status === 'REJECTED' && decompte.rejectionDate && (
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Décompte rejeté</span>
                          <span className="text-sm text-gray-500">
                            {new Date(decompte.rejectionDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Le décompte a été rejeté et ne sera pas payé.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions */}
              <Card title={editable ? 'Actions' : 'Informations'} icon={Settings}>
                <div className="space-y-3">
                  {editable && decompte.status === 'PENDING' && (
                    <>
                      <Button
                        variant="success"
                        icon={CheckCircle}
                        className="w-full"
                        onClick={handlePayDecompte}
                        disabled={processing}
                      >
                        {processing ? 'Traitement...' : 'Valider et Payer'}
                      </Button>

                      <Button
                        variant="danger"
                        icon={XCircle}
                        className="w-full"
                        onClick={handleRejectDecompte}
                        disabled={processing}
                      >
                        Rejeter
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    icon={Download}
                    className="w-full"
                  >
                    Télécharger PDF
                  </Button>

                  {editable && (
                    <Button
                      variant="outline"
                      icon={Edit}
                      className="w-full"
                      disabled={decompte.status !== 'PENDING'}
                    >
                      Modifier
                    </Button>
                  )}

                  {project && (
                    <Button
                      variant="secondary"
                      icon={Eye}
                      className="w-full"
                      onClick={() => navigate(`/construction/projects/${project.uuid}`)}
                    >
                      Voir le Projet
                    </Button>
                  )}
                </div>
              </Card>

              {/* Summary */}
              <Card title="Résumé" icon={FileText}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ID Décompte</span>
                    <span className="font-mono text-xs text-gray-900">
                      {decompte.uuid?.substring(0, 8)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Montant</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(decompte.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Statut</span>
                    <span className={statusConfig.color}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {project && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Projet</span>
                      <span className="font-medium text-gray-900 truncate ml-2">
                        {project.name}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Créé le {new Date(decompte.createdDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecompteDetailsView;