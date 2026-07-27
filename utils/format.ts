export function truncate(text: string, length = 200) {
  if (!text) return "";

  return text.length > length
    ? text.substring(0, length) + "..."
    : text;
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}