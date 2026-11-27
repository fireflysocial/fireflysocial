import type { MouseEvent, ReactNode } from 'react'
import { isNativeApp, openInAppBrowser, toSafeHttpUrl } from '../lib/platform/index.ts'

interface ExternalLinkProps {
  href: string
  className?: string
  children: ReactNode
  /** Called after the link is followed, in the browser or the native in-app browser. */
  onOpen?: () => void
}

/**
 * A link to a page outside Firefly, such as an event's own registration page. On the web it opens
 * a new tab; in the iOS and Android apps it opens the in-app browser. A link that isn't plain
 * http(s) is shown as text, never as a link.
 */
export function ExternalLink({ href, className, children, onOpen }: ExternalLinkProps) {
  const url = toSafeHttpUrl(href)
  if (!url) return <span className={className}>{children}</span>

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isNativeApp()) {
      event.preventDefault()
      void openInAppBrowser(url)
    }
    onOpen?.()
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
