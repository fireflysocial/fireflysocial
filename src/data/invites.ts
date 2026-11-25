/**
 * Invite requests from the landing page.
 *
 * NOT CONNECTED YET. The landing page ships UI-first (decided 2026-11-25); the Supabase table,
 * RLS policies and pgTAP tests for invite requests come in a follow-up PR. Until then this
 * always fails honestly, so the form never tells someone they're on a list that doesn't exist.
 */

export class InvitesNotOpenError extends Error {
  constructor() {
    super('Invite requests are not connected yet')
    this.name = 'InvitesNotOpenError'
  }
}

export type RequestInvite = (email: string) => Promise<void>

export const requestInvite: RequestInvite = () => Promise.reject(new InvitesNotOpenError())
