/**
 * Helper Functions
 * Utility functions for common operations
 */

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export const truncateString = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};
