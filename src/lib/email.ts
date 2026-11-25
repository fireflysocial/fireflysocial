/** RFC 5321 caps a full address at 254 characters. */
const MAX_EMAIL_LENGTH = 254

/** Something@something.tld, with no spaces. Deliberately loose: the confirmation email is the real check. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export type EmailCheck = { ok: true; email: string } | { ok: false; error: string }

/** Validates and normalises an email address typed into a form. */
export function checkEmail(input: string): EmailCheck {
  const email = input.trim()
  if (email === '') return { ok: false, error: 'Enter your email address.' }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_SHAPE.test(email)) {
    return { ok: false, error: 'That doesn’t look like an email address. Check it and try again.' }
  }
  // Domains are case-insensitive; the part before @ technically isn't, so leave it alone.
  const at = email.lastIndexOf('@')
  return { ok: true, email: email.slice(0, at) + email.slice(at).toLowerCase() }
}
