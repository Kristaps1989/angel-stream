/** Normalises the API base URL from the host element's data-api attribute. */
export function normaliseApiBase(raw: string | null | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "") return ""; // same origin
  return value.replace(/\/+$/, "");
}
