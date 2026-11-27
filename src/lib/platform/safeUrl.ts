/**
 * Event links come from other sites, so treat them as untrusted: only plain http(s) URLs are ever
 * opened. Anything else (javascript:, data:, intent:, a malformed string) returns null.
 */
export function toSafeHttpUrl(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
}
