import type { SocialNetwork } from '@/lib/contacts';

/**
 * The glyph for a social channel, chosen from the URL rather than the label —
 * the label is the client's to write, and an unrecognised network gets a
 * neutral link mark rather than nothing.
 */
export function SocialIcon({ network }: { network: SocialNetwork }) {
  switch (network) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
          <path d="M12 2c-2.7 0-3 0-4.1.1-1 .1-1.8.2-2.4.5-.7.3-1.2.6-1.8 1.2S2.7 5 2.5 5.5c-.2.6-.4 1.4-.4 2.4C2 9 2 9.3 2 12s0 3 .1 4.1c0 1 .2 1.8.4 2.4.3.7.6 1.2 1.2 1.8s1.1.9 1.8 1.2c.6.2 1.4.4 2.4.4C9 22 9.3 22 12 22s3 0 4.1-.1c1 0 1.8-.2 2.4-.4.7-.3 1.2-.6 1.8-1.2s.9-1.1 1.2-1.8c.2-.6.4-1.4.4-2.4.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c0-1-.2-1.8-.4-2.4-.3-.7-.6-1.2-1.2-1.8S19 2.7 18.5 2.5c-.6-.2-1.4-.4-2.4-.4C15 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1.9 0 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.6.6.7 1.1.1.3.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.6.6-1.1.7-.3.1-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.5-.2-1.8-.3-.5-.2-.8-.4-1.1-.7-.3-.3-.6-.6-.7-1.1-.1-.3-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.6-.6 1.1-.7.3-.1.9-.3 1.8-.3 1-.1 1.3-.1 4-.1zm0 3.1a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 1.8a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6zm5.3-3.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
          <path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.5 13.1l-4.8-1.5c-1-.3-1.1-1 .2-1.5l18.8-7.3c.9-.3 1.6.2 1.3 1.5z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <path
            d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1 1m-2 6a3.6 3.6 0 0 1-5.1 0 3.6 3.6 0 0 1 0-5.1l2.6-2.6a3.6 3.6 0 0 1 5.1 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
