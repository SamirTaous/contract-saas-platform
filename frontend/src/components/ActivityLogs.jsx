import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogIn,
  Users,
  DollarSign,
  Building,
  Hammer,
  Shield,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { setupApiInterceptors } from '../utils/apiInterceptors';
import {
  describeActivity,
  formatDayGroup,
  formatRelativeTime,
  formatRole,
  groupActivitiesByDay,
  isSuccess,
  shouldShowActivity,
} from '../utils/activityLabels';
import { designSystem } from '../styles/designSystem';
import PageHeader from './ui/PageHeader';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';

const auditApi = setupApiInterceptors(axios.create({
  baseURL: 'http://localhost:8083/api',
}));

const CATEGORY_ICONS = {
  auth: LogIn,
  team: Users,
  budget: DollarSign,
  market: Building,
  construction: Hammer,
  admin: Shield,
  other: Activity,
};

const ActivityLogs = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const pageSize = 50;

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
      setError('Impossible de charger le journal d\'activité. Vérifiez que le service audit est démarré.');
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

  const visibleActivities = useMemo(
    () => activities.filter((activity) => shouldShowActivity(activity, showAll)),
    [activities, showAll]
  );

  const groupedActivities = useMemo(
    () => groupActivitiesByDay(visibleActivities),
    [visibleActivities]
  );

  const handlePrevPage = () => {
    if (page > 0) fetchActivities(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) fetchActivities(page + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          <PageHeader
            title="Journal d'Activité"
            subtitle="Suivez les actions importantes de votre équipe sur la plateforme."
            icon={Activity}
            action={
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Inclure les consultations
                </label>
                <button
                  onClick={() => fetchActivities(page)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
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
              title={showAll
                ? `${visibleActivities.length} événement${visibleActivities.length !== 1 ? 's' : ''}`
                : `${visibleActivities.length} action${visibleActivities.length !== 1 ? 's' : ''} notable${visibleActivities.length !== 1 ? 's' : ''}`}
              padding={false}
            >
              {visibleActivities.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title={showAll ? 'Aucune activité enregistrée' : 'Aucune action notable pour le moment'}
                  description={showAll
                    ? 'Les actions de votre équipe apparaîtront ici au fur et à mesure.'
                    : 'Connexions, imports budget, créations de marchés et projets seront listés ici. Cochez « Inclure les consultations » pour voir aussi les navigations.'}
                />
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {[...groupedActivities.entries()].map(([dayLabel, dayActivities]) => (
                      <div key={dayLabel}>
                        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {dayLabel}
                          </p>
                        </div>

                        <ul className="divide-y divide-gray-100">
                          {dayActivities.map((activity) => {
                            const { action, failureAction, category, meta } = describeActivity(activity);
                            const Icon = CATEGORY_ICONS[category] || Activity;
                            const success = isSuccess(activity.statusCode);
                            const displayName = activity.username || 'Utilisateur inconnu';
                            const initials = displayName.charAt(0).toUpperCase();

                            return (
                              <li key={activity.eventId} className="px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                <div className="flex gap-4">
                                  <div className="flex-shrink-0">
                                    <div className="relative">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {initials}
                                      </div>
                                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${meta.color} flex items-center justify-center ring-2 ring-white`}>
                                        <Icon className="h-3 w-3" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 leading-relaxed">
                                      <span className="font-semibold">{displayName}</span>
                                      {' '}
                                      {!success ? (
                                        <span className="text-red-700">n'a pas pu {failureAction}</span>
                                      ) : (
                                        <span className="text-gray-700">{action}</span>
                                      )}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                                        {meta.label}
                                      </span>

                                      {activity.role && (
                                        <span className="text-xs text-gray-500">
                                          {formatRole(activity.role)}
                                        </span>
                                      )}

                                      <span className="text-xs text-gray-400">·</span>
                                      <span className="text-xs text-gray-500" title={formatDayGroup(activity.timestamp)}>
                                        {formatRelativeTime(activity.timestamp)}
                                      </span>

                                      {!success && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                          <AlertCircle className="h-3.5 w-3.5" />
                                          Échec
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Page {page + 1} sur {totalPages}
                        {!showAll && totalElements > visibleActivities.length && (
                          <span className="text-gray-400"> · {totalElements} événements au total</span>
                        )}
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
