export const minutesSinceMidnight = (value: string | Date): number => { const date = typeof value === "string" ? new Date(value) : value; return date.getHours() * 60 + date.getMinutes(); };
export const localDayKey = (value: string | Date): string => { const date = typeof value === "string" ? new Date(value) : value; return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
export const startOfLocalDay = (value: Date): Date => { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; };
export const circularTimeMinutes = (minutes: number, boundary = 12 * 60): number => minutes < boundary ? minutes + 24 * 60 : minutes;
export const displayTime = (minutes: number): string => { const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440; const date = new Date(2020, 0, 1, Math.floor(normalized / 60), normalized % 60); return new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" }).format(date); };
export const subtractDays = (date: Date, days: number): Date => { const copy = new Date(date); copy.setDate(copy.getDate() - days); return copy; };
export const overlapsWindow = (startedAt: string, endedAt: string | undefined, from: Date, to: Date): boolean => new Date(startedAt) <= to && new Date(endedAt ?? to) >= from;
