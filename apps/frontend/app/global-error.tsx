'use client';

/**
 * The last resort: the root layout itself failed, so there is no locale, no
 * fonts, no stylesheet and no navigation to render into (audit A7, F12).
 *
 * It cannot know which of the three languages the visitor reads — the failure
 * is upstream of everything that would tell it — so it says the same short
 * sentence in all three and styles itself inline, because `globals.css` is
 * imported by the layout that did not render.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          background: '#f5f1ea',
          color: '#2c2117',
          font: '400 1rem/1.6 system-ui, -apple-system, sans-serif',
        }}
      >
        <main style={{ maxWidth: '46ch', textAlign: 'center' }}>
          <p lang="ro">Site-ul nu a putut fi încărcat. Încearcă din nou.</p>
          <p lang="en">The site could not be loaded. Please try again.</p>
          <p lang="ru">Сайт не удалось загрузить. Попробуйте ещё раз.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1.4rem',
              border: 0,
              cursor: 'pointer',
              background: '#2c2117',
              color: '#f5f1ea',
              font: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.8125rem',
            }}
          >
            Reîncarcă · Reload · Обновить
          </button>
        </main>
      </body>
    </html>
  );
}
