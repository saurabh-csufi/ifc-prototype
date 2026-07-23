/**
 * Format a numeric value for display.
 */
export function formatValue(value: number, unit?: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'INR' || unit === '₹') {
    return `₹${value.toLocaleString('en-IN')}`;
  }
  // Large numbers with Indian numbering
  if (Math.abs(value) >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(value) >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString('en-IN');
  }
  return value.toFixed(2);
}

/**
 * Parse a date string from Data Commons observations.
 * Handles: "2020", "2020-21" (academic year), "2020-06", "2020-06-15"
 */
export function parseObservationDate(dateStr: string): Date {
  // Academic year format: "2020-21"
  if (/^\d{4}-\d{2}$/.test(dateStr) && parseInt(dateStr.slice(5)) < 13) {
    // Could be month or academic year short form.
    // If second part < 13, treat as month
    return new Date(`${dateStr}-01`);
  }
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    // Academic year like "2020-21" (second part >= 13)
    return new Date(`${dateStr.slice(0, 4)}-01-01`);
  }
  // Plain year: "2020"
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(`${dateStr}-01-01`);
  }
  // Full date
  return new Date(dateStr);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  // Academic year: keep as-is
  if (/^\d{4}-\d{2}$/.test(dateStr) && parseInt(dateStr.slice(5)) >= 13) {
    return dateStr;
  }
  // Plain year
  if (/^\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  return dateStr;
}
