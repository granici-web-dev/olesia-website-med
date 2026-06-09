// Homepage D — "Galerie" — 2-column visual grid with bigger cards, alternating dark/light.
// Each card has a graphic placeholder + name + description. More visual impact.

function HomeD() {
  const { HomeNav, HomeHero, HomeDespre, HomeFooter, BranchSVG } = window;

  // Subtle, hand-drawn-feeling decoration placeholders per service.
  const Glyph = ({ kind, color = 'var(--sage)' }) => {
    const base = { width: '100%', height: '100%', color };
    if (kind === 'stetho') return (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" style={base}>
        <circle cx="30" cy="30" r="10" /><circle cx="70" cy="30" r="10" />
        <path d="M30 40 Q30 65 50 70 Q70 65 70 40" />
        <circle cx="50" cy="80" r="8" /><circle cx="50" cy="80" r="3" fill="currentColor" />
      </svg>
    );
    if (kind === 'plate') return (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" style={base}>
        <circle cx="50" cy="50" r="38" /><circle cx="50" cy="50" r="28" />
        <path d="M50 28 Q42 45 50 60 Q58 45 50 28 Z" fill="currentColor" opacity="0.5" stroke="none"/>
        <ellipse cx="40" cy="58" rx="6" ry="3" fill="currentColor" opacity="0.7" stroke="none"/>
        <ellipse cx="60" cy="58" rx="6" ry="3" fill="currentColor" opacity="0.7" stroke="none"/>
      </svg>
    );
    if (kind === 'circ') return (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" style={base}>
        <circle cx="35" cy="50" r="22" /><circle cx="65" cy="50" r="22" />
        <circle cx="50" cy="50" r="6" fill="currentColor" stroke="none"/>
      </svg>
    );
    if (kind === 'calendar') return (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" style={base}>
        <rect x="20" y="28" width="60" height="52" /><line x1="20" y1="42" x2="80" y2="42" />
        <line x1="34" y1="22" x2="34" y2="34" /><line x1="66" y1="22" x2="66" y2="34" />
        <circle cx="40" cy="55" r="2.5" fill="currentColor" stroke="none"/>
        <circle cx="55" cy="55" r="2.5" fill="currentColor" stroke="none"/>
        <circle cx="70" cy="55" r="2.5" fill="currentColor" stroke="none"/>
        <circle cx="40" cy="68" r="2.5" fill="currentColor" stroke="none"/>
        <rect x="51" y="64" width="8" height="8" fill="currentColor" stroke="none"/>
      </svg>
    );
    if (kind === 'envelope') return (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.4" style={base}>
        <rect x="18" y="32" width="64" height="42" />
        <path d="M18 32 L50 56 L82 32" />
        <line x1="60" y1="64" x2="76" y2="64" />
      </svg>
    );
    return null;
  };

  return (
    <div className="artboard">
      <HomeNav />
      <HomeHero
        headline={<>
          <span className="serif-it">Cinci</span> moduri<br/>
          de a colabora.<br/>
          Toate <span style={{ color: 'var(--sage)' }}>online.</span>
        </>}
        sub="De la o întrebare punctuală la trei luni de urmărire — alegi formatul care se potrivește cu ce ai nevoie."
      />

      {/* MIDDLE — services as gallery grid */}
      <section style={{ padding: '90px 64px 100px', background: 'var(--paper)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56 }}>
          <h2 className="serif" style={{ fontSize: 80, margin: 0, lineHeight: 0.98, letterSpacing: '-0.02em' }}>
            Servicii<span className="serif-it" style={{ color: 'var(--sage)' }}>.</span>
          </h2>
          <div className="eyebrow">Cinci formate · Toate online</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
          {[
            { col: 'span 3', dark: true,  glyph: 'stetho',   tag: 'Pediatrie',  t: 'Consultație pediatrică',          d: 'Evaluare clinică pe video, anamneză detaliată, recomandări scrise în 24h. Copii 0–18 ani.',           time: '50 min · video', p: '600 lei' },
            { col: 'span 3', dark: false, glyph: 'plate',    tag: 'Nutriție',   t: 'Consultație nutrițională',        d: 'Plan alimentar personalizat pentru copii sau adulți. Follow-up la 4 săptămâni inclus.',                time: '60 min · video', p: '700 lei' },
            { col: 'span 2', dark: false, glyph: 'circ',     tag: 'Integrativ', t: 'Integrativă & monitorizare',      d: 'Pediatrie și nutriție într-o singură vizită. Pentru cazuri complexe.',                                  time: '90 min',         p: '1.100 lei' },
            { col: 'span 2', dark: true,  glyph: 'calendar', tag: 'Abonament',  t: 'Monitorizare 3 luni',              d: 'Mesagerie directă, două video-call-uri/lună, ajustări periodice.',                                       time: '3 luni',         p: 'de la 2.400 lei' },
            { col: 'span 2', dark: false, glyph: 'envelope', tag: 'Rapid',      t: 'Întrebare rapidă',                d: 'Răspuns scris, documentat, în 48h. Fără programare.',                                                    time: '48h · scris',    p: '180 lei' },
          ].map((s) => (
            <div key={s.t} style={{
              gridColumn: s.col,
              background: s.dark ? 'var(--beige)' : 'var(--cream)',
              color: s.dark ? 'var(--cream)' : 'var(--ink)',
              padding: '36px 36px 32px',
              border: s.dark ? 'none' : '1px solid var(--rule)',
              minHeight: 360, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="eyebrow" style={{ color: s.dark ? 'var(--sage-soft)' : 'var(--sage)' }}>{s.tag}</div>
                  <div style={{ width: 48, height: 48, color: s.dark ? 'var(--sage-soft)' : 'var(--sage)', opacity: 0.9 }}>
                    <Glyph kind={s.glyph} color={s.dark ? 'var(--sage-soft)' : 'var(--sage)'} />
                  </div>
                </div>
                <h3 className="serif" style={{ fontSize: 36, lineHeight: 1.08, margin: '40px 0 16px', letterSpacing: '-0.005em' }}>{s.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: s.dark ? 'rgba(245,241,234,0.78)' : 'var(--ink-soft)', margin: 0 }}>{s.d}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, paddingTop: 20, borderTop: s.dark ? '1px solid rgba(245,241,234,0.22)' : '1px solid var(--rule)' }}>
                <div>
                  <div className="serif" style={{ fontSize: 28, lineHeight: 1 }}>{s.p}</div>
                  <div className="mono" style={{ fontSize: 11, color: s.dark ? 'rgba(245,241,234,0.7)' : 'var(--ink-soft)', marginTop: 4, letterSpacing: '0.06em' }}>{s.time}</div>
                </div>
                <a style={{ fontSize: 13, color: 'inherit', borderBottom: '1px solid currentColor', paddingBottom: 3 }}>
                  Rezervă →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <HomeDespre />
      <HomeFooter />
    </div>
  );
}

window.HomeD = HomeD;
