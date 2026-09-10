import { toZonedTime } from 'date-fns-tz';

/**
 * Gets the start and end of a specific date in a specific timezone
 */
export const getStartAndEndOfDay = (date: Date = new Date(), timezone: string = 'Asia/Kolkata') => {
  const zonedDate = toZonedTime(date, timezone);
  
  const startOfDay = new Date(Date.UTC(
    zonedDate.getFullYear(),
    zonedDate.getMonth(),
    zonedDate.getDate(),
    0, 0, 0, 0
  ));
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

/**
 * Parses the range query parameter and returns exact UTC boundaries for the given timezone
 */
export const getDateRangeBounds = (
  range: 'today' | 'yesterday' | '7days' | '1month' | 'custom',
  customStartDate?: string,
  customEndDate?: string,
  timezone: string = 'Asia/Kolkata'
) => {
  const now = new Date();
  
  if (range === 'custom' && customStartDate && customEndDate) {
    const { startOfDay } = getStartAndEndOfDay(new Date(customStartDate), timezone);
    const { endOfDay } = getStartAndEndOfDay(new Date(customEndDate), timezone);
    return { start: startOfDay, end: endOfDay };
  }

  const { startOfDay: todayStart, endOfDay: todayEnd } = getStartAndEndOfDay(now, timezone);

  if (range === 'today') {
    return { start: todayStart, end: todayEnd };
  }

  if (range === 'yesterday') {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { startOfDay, endOfDay } = getStartAndEndOfDay(yesterday, timezone);
    return { start: startOfDay, end: endOfDay };
  }

  if (range === '7days') {
    const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { start: sevenDaysAgo, end: todayEnd };
  }

  if (range === '1month') {
    // Approx 30 days for 1 month
    const oneMonthAgo = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
    return { start: oneMonthAgo, end: todayEnd };
  }

  return { start: todayStart, end: todayEnd };
};
