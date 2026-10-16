/**
 * Formats a subscription / recurring rule into a human-readable string (§2.7)
 * e.g., "Every month on the 5th", "Every 2 weeks", "Every year"
 */
export function formatRecurrenceFrequency(sub: {
  frequency?: string;
  interval_count?: number;
  billing_cycle?: string;
  by_month_day?: number | null;
  by_weekday?: number | null;
}): string {
  const freq = sub.frequency || sub.billing_cycle || 'monthly';
  const interval = sub.interval_count && sub.interval_count > 1 ? sub.interval_count : 1;
  const dayOfMonth = sub.by_month_day;

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayName = sub.by_weekday !== undefined && sub.by_weekday !== null ? weekdays[sub.by_weekday] : null;

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  switch (freq) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;

    case 'weekly': {
      const base = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      return weekdayName ? `${base} on ${weekdayName}` : base;
    }

    case 'biweekly': {
      const base = interval === 1 ? 'Every 2 weeks' : `Every ${interval * 2} weeks`;
      return weekdayName ? `${base} on ${weekdayName}` : base;
    }

    case 'monthly': {
      const base = interval === 1 ? 'Monthly' : `Every ${interval} months`;
      return dayOfMonth ? `${base} on the ${getOrdinal(dayOfMonth)}` : base;
    }

    case 'quarterly':
      return interval === 1 ? 'Quarterly' : `Every ${interval * 3} months`;

    case 'half_yearly':
      return interval === 1 ? 'Half-yearly' : `Every ${interval * 6} months`;

    case 'yearly':
      return interval === 1 ? 'Yearly' : `Every ${interval} years`;

    case 'custom':
      return interval === 1 ? 'Custom cycle' : `Every ${interval} intervals`;

    default:
      return 'Monthly';
  }
}
