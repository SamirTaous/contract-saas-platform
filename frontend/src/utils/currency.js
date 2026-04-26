/**
 * Currency formatting utilities
 */

/**
 * Format currency amount in MAD (Moroccan Dirham)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: MAD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

/**
 * Format currency amount in Moroccan Dirham (alias for backward compatibility)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrencyMoroccan = (amount) => {
  return formatCurrency(amount, 'MAD');
};