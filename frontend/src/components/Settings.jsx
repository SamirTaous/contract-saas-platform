import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Shield,
  Copy,
  Check,
  Users,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { designSystem } from '../styles/designSystem';
import { formatRole } from '../utils/activityLabels';
import PageHeader from './ui/PageHeader';
import Card from './ui/Card';

const ROLE_BADGE_CLASSES = {
  SUPER_ADMIN: 'bg-red-100 text-red-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  USER: 'bg-gray-100 text-gray-800',
};

const InfoField = ({ label, value, mono = false }) => (
  <div>
    <dt className={designSystem.typography.label}>{label}</dt>
    <dd className={`mt-1 text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>
      {value || '—'}
    </dd>
  </div>
);

const Settings = () => {
  const { user: cachedUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = profile && ['ADMIN', 'SUPER_ADMIN'].includes(profile.role);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profileRes = await api.get('/auth/me');
      setProfile(profileRes.data);

      if (['ADMIN', 'SUPER_ADMIN'].includes(profileRes.data.role)) {
        const orgRes = await api.get('/organizations/me');
        setOrganization(orgRes.data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
      setError('Impossible de charger vos paramètres. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleCopyInviteCode = async () => {
    if (!organization?.inviteCode) return;

    try {
      await navigator.clipboard.writeText(organization.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite code', err);
    }
  };

  const displayName = profile?.username || cachedUser?.username;
  const role = profile?.role || cachedUser?.role;
  const roleBadgeClass = ROLE_BADGE_CLASSES[role] || ROLE_BADGE_CLASSES.USER;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          <PageHeader
            title="Paramètres"
            subtitle="Consultez votre profil et la configuration de votre organisation."
            icon={SettingsIcon}
          />

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className={`${designSystem.layout.grid.cols2} ${designSystem.layout.grid.gap}`}>
              <Card title="Profil" icon={User} subtitle="Informations de votre compte">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-semibold">
                      {displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 pt-1">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h4>
                    <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleBadgeClass}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {formatRole(role)}
                    </span>
                  </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField label="Nom d'utilisateur" value={profile?.username} />
                  <InfoField label="Rôle" value={formatRole(profile?.role)} />
                  <InfoField label="Identifiant utilisateur" value={profile?.userUuid} mono />
                </dl>
              </Card>

              <Card
                title="Organisation"
                icon={Building2}
                subtitle={isAdmin ? 'Détails de votre espace de travail' : 'Votre espace de travail'}
              >
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField
                    label="Nom de l'organisation"
                    value={organization?.name || profile?.orgName}
                  />
                  <InfoField label="Identifiant organisation" value={profile?.orgUuid} mono />
                  {isAdmin && organization?.userCount != null && (
                    <InfoField
                      label="Membres"
                      value={`${organization.userCount} membre${organization.userCount > 1 ? 's' : ''}`}
                    />
                  )}
                </dl>

                {isAdmin && organization?.inviteCode && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <KeyRound className="h-4 w-4 text-blue-600" />
                      <h4 className={designSystem.typography.subtitle}>Code d'invitation</h4>
                    </div>
                    <p className={`${designSystem.typography.body} mb-4`}>
                      Partagez ce code avec les nouveaux membres pour qu'ils rejoignent votre organisation lors de l'inscription.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg tracking-wider text-gray-900">
                        {organization.inviteCode}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyInviteCode}
                        className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          copied
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {isAdmin && organization?.users?.length > 0 && (
                <Card
                  title="Équipe"
                  icon={Users}
                  subtitle={`${organization.users.length} membre${organization.users.length > 1 ? 's' : ''} dans votre organisation`}
                  className="md:col-span-2"
                  padding={false}
                >
                  <div className="divide-y divide-gray-200">
                    {organization.users.map((member) => (
                      <div key={member.uuid} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                              {member.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.username}</p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          ROLE_BADGE_CLASSES[member.role] || ROLE_BADGE_CLASSES.USER
                        }`}>
                          {formatRole(member.role)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
