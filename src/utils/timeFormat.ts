/**
 * Utility functions for time formatting across the RESQLINK application.
 */

/**
 * Formats a Date or timestamp into 12-hour Indian Standard Time (Asia/Kolkata) with AM/PM.
 * Example output: "01:25:01 PM"
 */
export function formatISTTime12h(dateInput: Date | string | number = new Date()): string {
  const date = typeof dateInput === 'object' ? dateInput : new Date(dateInput);
  return date
    .toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .toUpperCase();
}
