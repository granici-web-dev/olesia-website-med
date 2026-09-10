/**
 * PII-safe recipient for logs: first character plus domain, so a delivery is
 * traceable without writing an address to disk (GDPR; `PRINCIPLES.md`, "PII
 * stays out of logs and URLs").
 *
 * One copy. Audit A3 (F21) found three identical ones — in `mail`,
 * `appointments` and `uploads` — which is the third occurrence and therefore
 * the point at which `AGENTS.md` R6 says to extract. It is the only thing
 * standing between the log file and a patient's address, and until now
 * nothing tested it.
 */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  return at <= 0 ? '***' : `${email[0]}***${email.slice(at)}`;
}
