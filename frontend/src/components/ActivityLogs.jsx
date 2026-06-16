import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import { designSystem } from '../styles/designSystem';
import PageHeader from './ui/PageHeader';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';

const auditApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8083/api',
}));

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
};

const statusBadgeClass = (statusCode) => {
  if (statusCode >= 500) return 'bg-red-100 text-red-800';
  if (statusCode >= 400) return 'bg-amber-100 text-amber-800';
  if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const ActivityLogs = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const pageSize = 20;

  const fetchActivities = useCallback(async (pageNumber = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditApi.get('/activities', {
        params: { page: pageNumber, size: pageSize },
      });
      setActivities(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
      setPage(response.data.number ?? pageNumber);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
      setError('Impossible de charger les journaux d\'activité. Vérifiez que le service audit (8083) et RabbitMQ sont démarrés.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/auth');
      return;
    }

    const user = JSON.parse(userData);
    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }

    fetchActivities(0);
  }, [navigate, fetchActivities]);

  const handlePrevPage = () => {
    if (page > 0) {
      fetchActivities(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      fetchActivities(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          <PageHeader
            title="Journal d'Activité"
            subtitle="Historique des actions API enregistrées via RabbitMQ."
            icon={Activity}
            action={
              <button
                onClick={() => fetchActivities(page)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            }
          />

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <Card
              title={`Activités (${totalElements})`}
              padding={false}
            >
              {activities.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="Aucune activité enregistrée"
                  description="Utilisez la plateforme (connexion, budget, projets…) puis actualisez. Les événements transitent par RabbitMQ vers le service audit."
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requête</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activities.map((activity) => (
                          <tr key={activity.eventId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {formatTimestamp(activity.timestamp)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{activity.username || 'Anonyme'}</div>
                              {activity.role && (
                                <div className="text-xs text-gray-500">{activity.role.replace('_', ' ')}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {activity.sourceService}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">
                                {activity.httpMethod}
                              </span>
                              <span className="text-gray-900 break-all">{activity.requestPath}</span>
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(activity.statusCode)}`}>
                                {activity.statusCode}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Page {page + 1} sur {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={page === 0}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Précédent
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={page >= totalPages - 1}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-50"
                        >
                          Suivant
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
