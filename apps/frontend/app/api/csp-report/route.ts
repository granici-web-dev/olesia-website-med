/**
 * Where the Report-Only CSP sends what it would have blocked
 * (`next.config.ts`, audit A7).
 *
 * A report is a browser telling us the policy is wrong, so it answers 204 and
 * never fails: a broken reporting endpoint must not become a console error on
 * every page view. What is logged is the three fields that identify the rule to
 * fix, and nothing else.
 *
 * `blocked-uri` is reduced to its origin and `document-uri` to its first two
 * path segments, which is `/ro/incarcare` rather than `/ro/incarcare/<token>`.
 * That token is a patient's whole credential; a full report body would write it
 * into the server log, which is the one place `PRINCIPLES.md` says it must not
 * go. Two segments name the page the policy fired on, which is all a fix needs.
 */

/** The body Chrome and Firefox send. Every field is optional in practice. */
interface CspReportBody {
  'csp-report'?: {
    'document-uri'?: string;
    'violated-directive'?: string;
    'effective-directive'?: string;
    'blocked-uri'?: string;
  };
}

function pagePrefix(value: string | undefined): string {
  if (!value) return '';
  try {
    const segments = new URL(value).pathname.split('/').filter(Boolean);
    return `/${segments.slice(0, 2).join('/')}`;
  } catch {
    return '';
  }
}

function originOnly(value: string | undefined): string {
  if (!value) return '';
  // The spec allows the keywords `inline`, `eval` and `data` here, which are
  // not URLs and are the most useful reports of all.
  if (!value.includes('://')) return value;
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as CspReportBody;
    const report = body['csp-report'];
    if (report) {
      console.warn('csp_report', {
        documentPath: pagePrefix(report['document-uri']),
        directive:
          report['effective-directive'] ?? report['violated-directive'] ?? '',
        blockedOrigin: originOnly(report['blocked-uri']),
      });
    }
  } catch {
    // A body that is not the JSON we expect says nothing useful and is not
    // worth an error page for the browser that sent it.
  }
  return new Response(null, { status: 204 });
}
