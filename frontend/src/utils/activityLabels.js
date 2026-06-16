const ROLE_LABELS = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  USER: 'Utilisateur',
};

const ACTION_RULES = [
  { test: (m, p) => m === 'POST' && p === '/api/auth/login', label: 's\'est connecté', failure: 'se connecter', category: 'auth', noteworthy: true },
  { test: (m, p) => m === 'POST' && p === '/api/auth/register', label: 'a créé un compte', failure: 'créer un compte', category: 'auth', noteworthy: true },
  { test: (m, p) => m === 'POST' && p === '/api/budget/import', label: 'a importé un fichier budgétaire', failure: 'importer un fichier budgétaire', category: 'budget', noteworthy: true },
  { test: (m, p) => m === 'POST' && p === '/api/markets/create', label: 'a créé un marché public', failure: 'créer un marché public', category: 'market', noteworthy: true },
  { test: (m, p) => m === 'PATCH' && /^\/api\/markets\/[^/]+\/sign$/.test(p), label: 'a signé un marché public', failure: 'signer un marché public', category: 'market', noteworthy: true },
  { test: (m, p) => m === 'DELETE' && /^\/api\/markets\/[^/]+\/cancel$/.test(p), label: 'a annulé un marché public', failure: 'annuler un marché public', category: 'market', noteworthy: true },
  { test: (m, p) => m === 'POST' && p === '/api/projects/create', label: 'a créé un projet de construction', failure: 'créer un projet de construction', category: 'construction', noteworthy: true },
  { test: (m, p) => m === 'POST' && p === '/api/decomptes/create', label: 'a créé un décompte', failure: 'créer un décompte', category: 'construction', noteworthy: true },
  { test: (m, p) => m === 'PATCH' && /^\/api\/decomptes\/[^/]+\/pay$/.test(p), label: 'a validé et payé un décompte', failure: 'valider un décompte', category: 'construction', noteworthy: true },
  { test: (m, p) => m === 'PATCH' && /^\/api\/decomptes\/[^/]+\/reject$/.test(p), label: 'a rejeté un décompte', failure: 'rejeter un décompte', category: 'construction', noteworthy: true },
  { test: (m, p) => m === 'DELETE' && /^\/api\/users\/[^/]+$/.test(p), label: 'a supprimé un membre de l\'équipe', failure: 'supprimer un membre', category: 'team', noteworthy: true },
  { test: (m, p) => m === 'DELETE' && /^\/api\/organizations\/[^/]+$/.test(p), label: 'a supprimé une organisation', failure: 'supprimer une organisation', category: 'admin', noteworthy: true },
  { test: (m, p) => m === 'GET' && p === '/api/users/all', label: 'a consulté la liste de l\'équipe', category: 'team', noteworthy: false },
  { test: (m, p) => m === 'GET' && p === '/api/budget/all', label: 'a consulté le budget', category: 'budget', noteworthy: false },
  { test: (m, p) => m === 'GET' && p === '/api/markets/my-org', label: 'a consulté les marchés publics', category: 'market', noteworthy: false },
  { test: (m, p) => m === 'GET' && (p === '/api/projects/' || p === '/api/projects'), label: 'a consulté les projets de construction', category: 'construction', noteworthy: false },
  { test: (m, p) => m === 'GET' && /^\/api\/projects\/[^/]+$/.test(p), label: 'a ouvert un projet de construction', category: 'construction', noteworthy: false },
  { test: (m, p) => m === 'GET' && (p === '/api/decomptes' || p === '/api/decomptes/all'), label: 'a consulté les décomptes', category: 'construction', noteworthy: false },
  { test: (m, p) => m === 'GET' && /^\/api\/decomptes\/[^/]+$/.test(p), label: 'a ouvert un décompte', category: 'construction', noteworthy: false },
  { test: (m, p) => m === 'GET' && p === '/api/organizations/me', label: 'a consulté son organisation', category: 'admin', noteworthy: false },
  { test: (m, p) => m === 'GET' && p.startsWith('/api/budget/'), label: 'a consulté une ligne budgétaire', category: 'budget', noteworthy: false },
];

const CATEGORY_META = {
  auth: { label: 'Connexion', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  team: { label: 'Équipe', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  budget: { label: 'Budget', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  market: { label: 'Marchés', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  construction: { label: 'Construction', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  admin: { label: 'Administration', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  other: { label: 'Autre', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

const normalizePath = (path) => {
  if (!path) return '';
  const withoutQuery = path.split('?')[0];
  return withoutQuery.endsWith('/') && withoutQuery.length > 1
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
};

export const formatRole = (role) => ROLE_LABELS[role] || role?.replace(/_/g, ' ') || '';

export const isSuccess = (statusCode) => statusCode >= 200 && statusCode < 400;

export const describeActivity = (activity) => {
  const method = activity?.httpMethod?.toUpperCase() || 'GET';
  const path = normalizePath(activity?.requestPath);
  const rule = ACTION_RULES.find(({ test }) => test(method, path));

  if (rule) {
    return {
      action: rule.label,
      failureAction: rule.failure || rule.label.replace(/^a /, ''),
      category: rule.category,
      noteworthy: rule.noteworthy,
      meta: CATEGORY_META[rule.category] || CATEGORY_META.other,
    };
  }

  if (method === 'GET') {
    return {
      action: 'a navigué dans la plateforme',
      failureAction: 'accéder à cette section',
      category: 'other',
      noteworthy: false,
      meta: CATEGORY_META.other,
    };
  }

  return {
    action: 'a effectué une action',
    failureAction: 'effectuer cette action',
    category: 'other',
    noteworthy: true,
    meta: CATEGORY_META.other,
  };
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'À l\'instant';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `Il y a ${mins} min`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `Il y a ${hours} h`;
  }
  if (diffSec < 172800) return 'Hier';

  return new Date(timestamp).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDayGroup = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Aujourd\'hui';
  if (isSameDay(date, yesterday)) return 'Hier';

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const shouldShowActivity = (activity, showAll) => {
  const path = normalizePath(activity?.requestPath);
  if (path === '/api/activities') return false;

  if (showAll) return true;
  const { noteworthy } = describeActivity(activity);
  const failed = !isSuccess(activity.statusCode);
  return noteworthy || failed;
};

export const groupActivitiesByDay = (activities) => {
  const groups = new Map();
  activities.forEach((activity) => {
    const key = formatDayGroup(activity.timestamp);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(activity);
  });
  return groups;
};
