import { TrackablePeriod } from "@prisma/client";

/**
 * Calculate automatic value for a trackable based on time elapsed
 */
export function calculateAutomaticValue(
  createdAt: Date,
  period: string,
  step: number = 1,
  lastBreakDate?: Date | null,
): number {
  const startDate = lastBreakDate || createdAt;
  const now = new Date();
  const msElapsed = now.getTime() - new Date(startDate).getTime();

  switch (period) {
    case "DAILY": {
      const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
      return daysElapsed * step;
    }
    case "WEEKLY": {
      const weeksElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24 * 7));
      return weeksElapsed * step;
    }
    case "MONTHLY": {
      // Approximate month calculation (30 days)
      const monthsElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24 * 30));
      return monthsElapsed * step;
    }
    case "NONE": {
      // For lifetime tracking, count total days
      const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
      return daysElapsed * step;
    }
    default:
      return 0;
  }
}

/**
 * Calculate current streak (consecutive periods with goal met)
 */
export function calculateStreak(
  records: Array<{ date?: Date; recordedAt?: Date; value?: number | null }>,
  period: string,
  goalTarget?: number,
): number {
  if (!records.length || !goalTarget) return 0;

  // Sort records by date descending (most recent first)
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = a.recordedAt || a.date || new Date(0);
    const dateB = b.recordedAt || b.date || new Date(0);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  let streak = 0;
  const now = new Date();

  // Group records by period
  const periodGroups = new Map<string, number>();
  for (const record of sortedRecords) {
    const recordDate = new Date(record.recordedAt || record.date || now);
    const periodKey = getPeriodKey(recordDate, period);
    const currentValue = periodGroups.get(periodKey) || 0;
    periodGroups.set(periodKey, currentValue + (record.value || 0));
  }

  // Check consecutive periods from now backwards
  let checkDate = new Date(now);
  while (true) {
    const periodKey = getPeriodKey(checkDate, period);
    const periodValue = periodGroups.get(periodKey) || 0;

    if (periodValue >= goalTarget) {
      streak++;
      checkDate = getPreviousPeriod(checkDate, period);
    } else {
      break;
    }

    // Safety limit
    if (streak > 10000) break;
  }

  return streak;
}

function getPeriodKey(date: Date, period: string): string {
  switch (period) {
    case "DAILY":
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    case "WEEKLY": {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
    }
    case "MONTHLY":
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    default:
      return "all-time";
  }
}

function getPreviousPeriod(date: Date, period: string): Date {
  const newDate = new Date(date);
  switch (period) {
    case "DAILY":
      newDate.setDate(date.getDate() - 1);
      break;
    case "WEEKLY":
      newDate.setDate(date.getDate() - 7);
      break;
    case "MONTHLY":
      newDate.setMonth(date.getMonth() - 1);
      break;
  }
  return newDate;
}

/**
 * Format the automatic value display
 */
export function formatAutomaticValue(
  value: number,
  period: string,
  unit?: string | null,
): string {
  const periodLabel = period === "DAILY" ? "days" : period === "WEEKLY" ? "weeks" : period === "MONTHLY" ? "months" : "total";
  
  if (unit) {
    return `${value} ${unit}`;
  }
  
  return `${value} ${periodLabel}`;
}

/**
 * Round a number to the nearest step value to avoid floating point precision issues
 */
export function roundToStep(value: number, step: number | null | undefined): number {
  if (!step || step <= 0) {
    // If no step specified, round to reasonable precision
    return Math.round(value * 100) / 100;
  }
  
  // Round to nearest step, then fix floating point precision
  const rounded = Math.round(value / step) * step;
  
  // Determine decimal places from step (e.g., 0.01 -> 2, 0.1 -> 1, 1 -> 0)
  const stepStr = step.toString();
  const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  
  // Use toFixed and parseFloat to eliminate floating point errors
  return parseFloat(rounded.toFixed(decimalPlaces));
}

/**
 * Format a number for display, ensuring proper decimal precision
 */
export function formatNumberForDisplay(value: number, step: number | null | undefined): string {
  const rounded = roundToStep(value, step);
  
  if (!step || step <= 0) {
    // Default to 2 decimal places if no step
    return rounded.toFixed(2).replace(/\.?0+$/, '');
  }
  
  // Determine decimal places from step
  const stepStr = step.toString();
  const decimalPlaces = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  
  // Format with appropriate decimal places, removing trailing zeros
  return rounded.toFixed(decimalPlaces).replace(/\.?0+$/, '');
}

