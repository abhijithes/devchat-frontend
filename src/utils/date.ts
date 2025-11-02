export function datePipe(dateString: string, isShort?: boolean) {
  return new Date(dateString || "").toLocaleDateString(
    "en-US",
    isShort
      ? {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      : {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
  );
}
