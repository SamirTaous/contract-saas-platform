/**
 * Currency formatting utilities
 */

/**
 * Format currency amount in EUR
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

/**
 * Format currency amount in Moroccan Dirham
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrencyMoroccan = (amount) => {
  return new Intl.NumberFormat('ar-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(amount || 0);
};