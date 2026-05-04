/**
 * Design System Constants
 * Centralized design tokens for consistent styling across the platform
 */

export const designSystem = {
  // Spacing
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Typography
  typography: {
    pageTitle: 'text-3xl font-bold text-gray-900',
    sectionTitle: 'text-xl font-semibold text-gray-900',
    cardTitle: 'text-lg font-semibold text-gray-900',
    subtitle: 'text-base font-medium text-gray-700',
    body: 'text-sm text-gray-600',
    caption: 'text-xs text-gray-500',
    label: 'text-sm font-medium text-gray-700',
  },

  // Layout
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    containerExpanded: 'max-w-none mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8',
    card: 'bg-white rounded-lg shadow-sm border border-gray-200',
    cardPadding: 'p-6',
    grid: {
      cols1: 'grid grid-cols-1',
      cols2: 'grid grid-cols-1 md:grid-cols-2',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      gap: 'gap-6',
    },
  },

  // Components
  components: {
    button: {
      primary: 'inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200',
      secondary: 'inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200',
      success: 'inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200',
      danger: 'inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200',
    },
    input: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
      error: 'w-full px-3 py-2 border border-red-300 rounded-lg text-sm bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200',
    },
    badge: {
      success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
      info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      neutral: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    },
    stat: {
      container: 'bg-white rounded-lg p-6 shadow-sm border border-gray-200',
      value: 'text-2xl font-bold mt-1',
      label: 'text-sm font-medium text-gray-600',
      icon: 'w-12 h-12 rounded-lg flex items-center justify-center',
    },
  },

  // Colors
  colors: {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
      700: 'bg-yellow-700',
    },
    error: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'bg-red-500',
      600: 'bg-red-600',
      700: 'bg-red-700',
    },
    gray: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
    },
  },

  // Animations
  animations: {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
};

// Helper functions for consistent styling
export const getStatCardClasses = (color = 'blue') => ({
  container: designSystem.components.stat.container,
  value: `${designSystem.components.stat.value} text-${color}-600`,
  label: designSystem.components.stat.label,
  icon: `${designSystem.components.stat.icon} bg-${color}-50`,
  iconColor: `text-${color}-600`,
});

export const getContainerClasses = (sidebarCollapsed = false) => {
  return sidebarCollapsed ? designSystem.layout.containerExpanded : designSystem.layout.container;
};

export const getButtonClasses = (variant = 'primary', size = 'md') => {
  const baseClasses = designSystem.components.button[variant] || designSystem.components.button.primary;
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return `${baseClasses} ${sizeClasses[size]}`;
};

export const getPageHeaderClasses = () => ({
  container: 'mb-8',
  wrapper: 'flex items-center justify-between',
  titleSection: 'flex items-center space-x-3',
  title: designSystem.typography.pageTitle,
  subtitle: `${designSystem.typography.body} mt-2`,
  icon: 'h-8 w-8 text-blue-600',
});