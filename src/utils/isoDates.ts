export const toISOIfNeeded = (value: string | Date | undefined | null): string | undefined => {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? (value as string) : parsed.toISOString();
};

export const toDateOrSelf = (value: string | Date): Date =>
  value instanceof Date ? value : new Date(value as string);
