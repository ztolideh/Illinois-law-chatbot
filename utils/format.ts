export function formatDate(value: string | number | Date) {
  const date = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
