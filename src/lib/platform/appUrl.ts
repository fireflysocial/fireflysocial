/**
 * A full address for a path in this app, for links that leave it and come back (the sign-in
 * email). On the web it's the site's own address. Inside the iOS and Android apps it's the web
 * view's local address, which an email app can't open: links back into the apps need deep links,
 * which aren't set up yet.
 */
export function appUrl(path: string): string {
  return new URL(path, window.location.origin).toString()
}

/** A sign-in link that failed (expired, already used) comes back with the reason in the URL hash. */
export function linkErrorIn(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return params.get('error_code') ?? params.get('error')
}
