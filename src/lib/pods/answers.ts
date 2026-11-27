/**
 * Checks on what people type for their pod: the prompt answer and social handles. Both are
 * untrusted input (CLAUDE.md §9). A prompt answer must not carry contact details, because
 * socials are only shared after a mutual "keep meeting" (CLAUDE.md §8.3).
 */

export const PROMPTS = [
  'The last thing I got nerdy about',
  'I’d love to learn',
  'Ask me about',
  'A small thing that makes my week',
] as const

export type Prompt = (typeof PROMPTS)[number]

export function isPrompt(value: unknown): value is Prompt {
  return PROMPTS.some((prompt) => prompt === value)
}

export const MAX_ANSWER = 80

export type AnswerCheck = { ok: true; value: string } | { ok: false; error: string }

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|ca|net|org|io|me|co|app)\b)/i
const HANDLE = /(^|\s)@\w/
const EMAIL = /\S+@\S+\.\S+/
const PHONE = /(\d[\s().-]*){7,}/

export function checkPromptAnswer(raw: string): AnswerCheck {
  const value = raw.trim().replace(/\s+/g, ' ')
  if (value.length === 0) return { ok: false, error: 'Write a short answer.' }
  if (value.length > MAX_ANSWER) {
    return { ok: false, error: `Keep it under ${String(MAX_ANSWER)} characters.` }
  }
  if (EMAIL.test(value) || HANDLE.test(value) || LINK.test(value) || PHONE.test(value)) {
    return {
      ok: false,
      error: 'Leave out links, handles, emails and numbers. You can share socials later.',
    }
  }
  return { ok: true, value }
}

export const SOCIAL_NETWORKS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number]['id']

export function isSocialNetwork(value: unknown): value is SocialNetwork {
  return SOCIAL_NETWORKS.some((n) => n.id === value)
}

/** Instagram: "@name" or "name". LinkedIn: a profile URL or its "/in/" slug. */
export function checkHandle(network: SocialNetwork, raw: string): AnswerCheck {
  const value = raw.trim()
  if (network === 'instagram') {
    const name = value.replace(/^@/, '')
    return /^[A-Za-z0-9._]{1,30}$/.test(name)
      ? { ok: true, value: `@${name}` }
      : { ok: false, error: 'Enter your Instagram username, like @yourname.' }
  }
  const slug = value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')
  return /^[A-Za-z0-9-]{3,100}$/.test(slug)
    ? { ok: true, value: `linkedin.com/in/${slug}` }
    : { ok: false, error: 'Enter your LinkedIn profile, like linkedin.com/in/yourname.' }
}
