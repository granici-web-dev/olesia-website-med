/**
 * A schema.org block, serialized into the one `<script>` tag crawlers read.
 *
 * `null` renders nothing. Every caller here builds its object from the API —
 * the doctor's phone number, her opening hours, an article's publication date —
 * and a structured-data block describing content the page does not have is
 * worse than no block at all, so "the client has not filled this in" has to be
 * expressible (audit A7, F14).
 */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
