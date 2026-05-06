/**
 * Converts a UTC ISO string to a local time string (e.g., "10:00 AM")
 */
export function formatToLocalTime(utcString: string): string {
  const date = new Date(utcString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Converts a UTC ISO string to a local date string (e.g., "Fri, Mar 27")
 */
export function formatToLocalDate(utcString: string): string {
  const date = new Date(utcString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Groups an array of UTC ISO strings by their local date.
 * Returns an object where keys are local date strings and values are arrays of UTC strings.
 */
export function groupSlotsByDay(utcStrings: string[]): Record<string, string[]> {
  return utcStrings.reduce((acc, utcString) => {
    const localDate = formatToLocalDate(utcString);
    if (!acc[localDate]) {
      acc[localDate] = [];
    }
    acc[localDate].push(utcString);
    return acc;
  }, {} as Record<string, string[]>);
}

/**
 * Gets the user's current timezone string (e.g., "America/New_York")
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
