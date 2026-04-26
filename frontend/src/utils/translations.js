// Traductions françaises pour l'application ContractSaaS
export const translations = {
  // Navigation et Layout
  navigation: {
    dashboard: 'Tableau de Bord',
    teamMembers: 'Membres de l\'Équipe',
    budgetManagement: 'Gestion Budgétaire',
    publicMarkets: 'Marchés Publics',
    settings: 'Paramètres',
    logout: 'Se déconnecter'
  },

  // Authentification
  auth: {
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    createAccount: 'Créer un Compte',
    welcomeBack: 'Bon Retour',
    joinPlatform: 'Rejoignez Notre Plateforme',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    email: 'Adresse Email',
    fullName: 'Nom Complet',
    organizationName: 'Nom de l\'Organisation',
    inviteCode: 'Code d\'Invitation',
    newOrganization: 'Nouvelle Organisation',
    joinTeam: 'Rejoindre une Équipe',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    dontHaveAccount: 'Vous n\'avez pas de compte ?',
    signingIn: 'Connexion en cours...',
    creatingAccount: 'Création du compte...'
  },

  // Dashboard
  dashboard: {
    welcome: 'Bienvenue',
    todayOverview: 'Voici ce qui se passe avec vos contrats aujourd\'hui.',
    quickActions: 'Actions Rapides',
    recentActivity: 'Activité Récente',
    createNewContract: 'Créer un Nouveau Contrat',
    viewTeamMembers: 'Voir les Membres de l\'Équipe',
    budgetManagement: 'Gestion Budgétaire',
    viewAnalytics: 'Voir les Analyses',
    viewAllActivity: 'Voir Toute l\'Activité',
    activeContracts: 'Contrats Actifs',
    teamMembers: 'Membres de l\'Équipe',
    pendingReviews: 'En Attente de Révision',
    completed: 'Terminés'
  },

  // Budget
  budget: {
    title: 'Gestion Budgétaire',
    subtitle: 'Service Comptabilité - Gérer le budget de votre organisation',
    totalBudget: 'Budget Total',
    totalCommitted: 'Total Engagé',
    remainingBalance: 'Solde Restant',
    importBudgetData: 'Importer des Données Budgétaires',
    budgetLines: 'Lignes Budgétaires',
    dropExcelFile: 'Déposez le fichier Excel ici ou cliquez pour parcourir',
    supportedFormats: 'Prend en charge les fichiers .xlsx et .xls',
    processing: 'Traitement en cours...',
    uploadSuccess: 'Fichier Excel téléchargé et traité avec succès!',
    noBudgetLines: 'Aucune ligne budgétaire trouvée',
    importToStart: 'Importez un fichier Excel pour commencer',
    adjustFilters: 'Essayez d\'ajuster vos critères de recherche ou de filtre',
    fullCode: 'Code Complet',
    type: 'Type',
    article: 'Article',
    paragraph: 'Paragraphe',
    line: 'Ligne',
    label: 'Libellé',
    initialAmount: 'Montant Initial',
    action: 'Action',
    view: 'Voir',
    allTypes: 'Tous les Types',
    searchPlaceholder: 'Rechercher par article, libellé ou code...'
  },

  // Markets
  markets: {
    title: 'Gestion des Marchés Publics',
    subtitle: 'Gérer les contrats et les opérations de marché',
    createNewMarket: 'Créer un Nouveau Marché',
    totalMarkets: 'Total des Marchés',
    signedMarkets: 'Marchés Signés',
    pending: 'En Attente',
    totalValue: 'Valeur Totale',
    marketOverview: 'Aperçu des Marchés',
    noMarketsFound: 'Aucun Marché Trouvé',
    createFirstMarket: 'Commencez par créer votre premier contrat de marché.',
    title_field: 'Titre',
    supplier: 'Fournisseur',
    amount: 'Montant',
    linkedBudget: 'Budget Lié',
    status: 'Statut',
    actions: 'Actions',
    sign: 'Signer',
    completed: 'Terminé',
    draft: 'BROUILLON',
    signed: 'SIGNÉ',
    budgetNotFound: 'Budget non trouvé',
    table: 'Tableau',
    cards: 'Cartes'
  },

  // Common
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Enregistrer',
    edit: 'Modifier',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    search: 'Rechercher',
    filter: 'Filtrer',
    all: 'Tous',
    none: 'Aucun',
    yes: 'Oui',
    no: 'Non',
    required: 'Requis',
    optional: 'Optionnel',
    workspace: 'Espace de travail'
  },

  // Errors
  errors: {
    accessDenied: 'Accès Refusé',
    adminRequired: 'Vous avez besoin de privilèges administrateur pour accéder au Tableau de Bord de Gestion Budgétaire.',
    loadingFailed: 'Échec du chargement des données. Veuillez réessayer.',
    uploadFailed: 'Échec du téléchargement du fichier Excel. Veuillez vérifier le format et réessayer.',
    loginFailed: 'Échec de la connexion',
    registrationFailed: 'Échec de l\'inscription',
    createMarketFailed: 'Échec de la création du marché. Veuillez réessayer.',
    signMarketFailed: 'Échec de la signature du marché. Veuillez réessayer.',
    budgetLineNotFound: 'Ligne budgétaire non trouvée',
    returnToBudget: 'Retour au Budget',
    returnToDashboard: 'Retour au Tableau de Bord'
  },

  // Market Creation Wizard
  wizard: {
    createNewMarket: 'Créer un Nouveau Marché',
    basicInfo: 'Informations de Base',
    budgetSelection: 'Sélection Budgétaire',
    review: 'Révision',
    marketTitle: 'Titre du Marché',
    supplierName: 'Nom du Fournisseur',
    contractType: 'Type de Contrat',
    estimatedDuration: 'Durée Estimée',
    description: 'Description',
    budgetLine: 'Ligne Budgétaire',
    marketAmount: 'Montant du Marché',
    totalAmount: 'Montant Total',
    budgetUsage: 'Utilisation du Budget',
    requestedAmount: 'Montant Demandé',
    remainingAvailable: 'Reste Disponible',
    budgetSufficient: 'Budget Suffisant',
    budgetInsufficient: 'Budget Insuffisant',
    reviewConfirmation: 'Révision et Confirmation',
    verifyBeforeCreate: 'Vérifiez les informations avant de créer le marché',
    marketInfo: 'Informations du Marché',
    budgetInfo: 'Informations Budgétaires',
    validationSummary: 'Résumé de Validation',
    readyToCreate: 'Prêt pour la Création',
    createMarket: 'Créer le Marché',
    creating: 'Création...'
  }
};

export default translations;