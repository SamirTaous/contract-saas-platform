# ContractSaaS - Application Frontend

Il s'agit du frontend basé sur React pour la Plateforme SaaS de Contrats Intelligents. Il fournit une interface haute performance et responsive pour gérer les structures organisationnelles multi-locataires et la gouvernance budgétaire.

## Aperçu de l'Interface Utilisateur

L'application suit une esthétique SaaS d'entreprise moderne, en se concentrant sur la clarté des données et l'efficacité de l'utilisateur.

- **Tableau de Bord Unifié** : Cartes de résumé financier en temps réel (Budget Total, Engagé, Restant).
- **Gouvernance Budgétaire** : Provisionnement Excel automatisé et suivi hiérarchique des lignes budgétaires.
- **Gestion d'Équipe** : Liste des membres basée sur les rôles et contrôles administratifs.
- **Authentification Sécurisée** : Inscription en double mode (Créer une Organisation vs Rejoindre une Équipe) et gestion de session protégée.

## Stack Technologique

- **Core** : React 18 + Vite (Outil de build ultra-rapide).
- **Stylisation** : Tailwind CSS (CSS utilitaire pour une interface personnalisée).
- **Routage** : React Router 6 (Navigation côté client et Routes Protégées).
- **Client HTTP** : Axios (Gestion API centralisée avec intercepteurs JWT).
- **Icônes** : Lucide React (Icônes de trait cohérentes et de haute qualité).

## Fonctionnalités Clés

- **Authentification JWT Sans État** : Stocke et gère de manière sécurisée les tokens dans localStorage avec des en-têtes automatisés pour les requêtes API.
- **Logique Multi-locataire** : L'interface utilisateur s'adapte dynamiquement en fonction du UserContext (Nom de l'Organisation, Rôle, Permissions).
- **Visualisation de Données** : Barres de progression d'utilisation budgétaire personnalisées et indicateurs de santé financière.
- **Provisionnement en Masse** : Interface de téléchargement Excel par glisser-déposer pour initialiser les budgets d'organisation.
- **Interface Basée sur les Rôles** : Vues et actions spécifiques restreintes à USER, ADMIN, ou SUPER_ADMIN.

## Structure du Projet

```
frontend/
├── src/
│   ├── api/              # Instances Axios et définitions API
│   ├── components/       # Éléments UI réutilisables (Boutons, Inputs, Sidebar)
│   ├── pages/            # Vues principales (Login, Dashboard, Budget, Team)
│   ├── hooks/            # Logique personnalisée (État Auth, Récupération de données)
│   ├── context/          # Gestion d'état UserContext global
│   ├── App.jsx           # Configuration principale de routage et de mise en page
│   └── main.jsx          # Point d'entrée de l'application
├── tailwind.config.js    # Configuration du système de design
└── vite.config.js        # Paramètres de l'outil de build
```

## Démarrage

### Prérequis

- Node.js (v18 ou supérieur)
- Microservices backend fonctionnant sur les ports 8081 et 8082.

### Installation

1. Naviguez vers le répertoire frontend :
   ```bash
   cd frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

4. Accédez à l'application sur http://localhost:5173.