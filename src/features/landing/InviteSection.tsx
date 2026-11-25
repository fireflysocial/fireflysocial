import type { RequestInvite } from '../../data/invites.ts'
import { InviteForm } from './InviteForm.tsx'

interface InviteSectionProps {
  onRequest: RequestInvite
}

export function InviteSection({ onRequest }: InviteSectionProps) {
  return (
    <section className="section invite" id="invite" aria-labelledby="invite-title">
      <h2 id="invite-title" className="display">
        Get an invite.
      </h2>
      <div className="invite__body">
        <p className="invite__lede">
          Firefly is starting in Vancouver. Leave your email and we’ll tell you when it opens.
        </p>
        <InviteForm onRequest={onRequest} />
      </div>
    </section>
  )
}
