// Variant 1 — "Cabinet" — Quiet editorial. Big italic display + photo right.
// Asymmetric, magazine-style, numbered services list.

const Nav = ({ tone = 'cream' }) => {
  const BranchSVG = window.BranchSVG;
  return (
  <header className="nav" style={{ background: tone === 'cream' ? 'var(--cream)' : 'transparent' }}>
    <div className="brand">
      <span className="brand-mark"><BranchSVG color="var(--sage)" /></span>
      <span>Olesea Jalba</span>
    </div>
    <nav className="nav-links">
      <a>Despre</a>
      <a>Servicii</a>
      <a>Pediatrie</a>
      <a>Nutriție</a>
      <a>Articole</a>
      <a>Tarife</a>
      <a>Contact</a>
    </nav>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span className="lang"><span className="active">RO</span><span>/</span><span>EN</span></span>
      <button className="btn btn-dark" style={{ padding: '10px 18px', fontSize: 11 }}>Programează</button>
    </div>
  </header>
  );
};

function CabinetVariant() {
  const BranchSVG = window.BranchSVG;
  return (
    <div className="artboard">
      <Nav />

      {/* HERO */}
      <section style={{ padding: '80px 56px 100px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 80, alignItems: 'start' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 32 }}>
            <span style={{ color: 'var(--sage)' }}>● </span>
            Medic pediatru · Nutriționist
          </div>
          <h1 className="serif" style={{ fontSize: 92, lineHeight: 1.02, margin: 0, letterSpacing: '-0.01em' }}>
            Sănătatea<br/>
            copilului tău,<br/>
            <span className="serif-it" style={{ color: 'var(--sage)' }}>cu răbdare</span><br/>
            și știință.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 480, color: 'var(--ink-soft)', marginTop: 40 }}>
            Consultații pediatrice și planuri de nutriție personalizate pentru
            copii și adulți. O abordare integrativă, bazată pe evidență medicală
            și pe ritmul familiei tale.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
            <button className="btn btn-dark">Programează consultație →</button>
            <button className="btn btn-outline">Vezi serviciile</button>
          </div>

          {/* credentials strip */}
          <div style={{ display: 'flex', gap: 48, marginTop: 80, paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
            <div>
              <div className="serif" style={{ fontSize: 32, color: 'var(--sage)' }}>12+</div>
              <div className="eyebrow" style={{ marginTop: 4 }}>Ani experiență</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 32, color: 'var(--sage)' }}>2 specializări</div>
              <div className="eyebrow" style={{ marginTop: 4 }}>Pediatrie · Nutriție</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 32, color: 'var(--sage)' }}>1.400+</div>
              <div className="eyebrow" style={{ marginTop: 4 }}>Familii consultate</div>
            </div>
          </div>
        </div>

        {/* photo column */}
        <div style={{ position: 'relative' }}>
          <div className="photo" style={{ aspectRatio: '4/5', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -16, top: -16, width: 56, height: 84, color: 'var(--sage)' }}>
              <BranchSVG color="var(--sage)" />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>Dr. Olesea Jalba</span>
            <span>Chișinău · 2026</span>
          </div>
        </div>
      </section>

      {/* SERVICII */}
      <section style={{ padding: '80px 56px', background: 'var(--paper)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56 }}>
          <h2 className="serif-it" style={{ fontSize: 56, margin: 0, color: 'var(--ink)' }}>Servicii</h2>
          <div className="eyebrow">01 — 05</div>
        </div>

        {[
          ['01', 'Consultație pediatrică', 'Evaluare clinică completă, monitorizarea creșterii și dezvoltării, recomandări pentru părinți.', '600 lei · 50 min'],
          ['02', 'Consultație nutrițională', 'Plan personalizat pentru copii sau adulți. Anamneză, analize, obiective realiste.', '700 lei · 60 min'],
          ['03', 'Consultație integrativă & monitorizare', 'Pediatrie + nutriție într-un singur drum. Urmărire pe termen lung.', '1.100 lei · 90 min'],
          ['04', 'Abonament monitorizare', 'Trei luni de urmărire, mesagerie directă, ajustări periodice.', 'de la 2.400 lei'],
          ['05', 'Întrebare rapidă', 'Răspuns scris în 48h pentru întrebări punctuale, fără programare.', '180 lei'],
        ].map(([n, t, d, p]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 200px', gap: 32, padding: '28px 0', borderTop: '1px solid var(--rule)', alignItems: 'baseline' }}>
            <div className="num" style={{ fontSize: 28 }}>{n}</div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>{t}</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 15 }}>{d}</div>
            <div style={{ textAlign: 'right', fontSize: 13, letterSpacing: '0.04em', color: 'var(--ink)' }}>{p}</div>
          </div>
        ))}
      </section>

      {/* DESPRE preview */}
      <section style={{ padding: '100px 56px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Despre</div>
          <h3 className="serif" style={{ fontSize: 48, lineHeight: 1.1, margin: 0 }}>
            Două specializări,<br/><span className="serif-it" style={{ color: 'var(--sage)' }}>un singur scop</span>
          </h3>
        </div>
        <div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: 0 }}>
            Sunt medic pediatru și nutriționist. Cele două roluri se completează
            firesc: înțeleg corpul copilului în mișcare, dar și ce îl construiește
            la masă. Lucrez cu părinți și cu adulți care vor răspunsuri concrete,
            nu programe-șablon.
          </p>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              ['Studii', 'USMF "N. Testemițanu"\nRezidențiat pediatrie\nFormare nutriție clinică'],
              ['Specializări', 'Nutriție pediatrică\nAlimentația sugarului\nDiversificare BLW'],
            ].map(([h, b]) => (
              <div key={h}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>{h}</div>
                <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line', color: 'var(--ink)' }}>{b}</div>
              </div>
            ))}
          </div>
          <a style={{ display: 'inline-block', marginTop: 40, fontSize: 14, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 4 }}>
            Citește biografia completă →
          </a>
        </div>
      </section>

      {/* FOOTER preview */}
      <footer style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '64px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
          <div>
            <div className="brand" style={{ color: 'var(--cream)' }}>
              <span className="brand-mark" style={{ color: 'var(--sage-soft)' }}><BranchSVG color="var(--sage-soft)" /></span>
              <span>Olesea Jalba</span>
            </div>
            <p style={{ marginTop: 20, fontSize: 14, opacity: 0.7, maxWidth: 320 }}>
              Cabinet de pediatrie și nutriție. Consultații în Chișinău și online.
            </p>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 12 }}>Cabinet</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85 }}>
              str. Mitropolit G. Bănulescu-Bodoni 25<br/>Chișinău, MD-2012
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 12 }}>Contact</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85 }}>
              +373 79 000 000<br/>contact@oleseajalba.md
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 12 }}>Urmărește</div>
            <div style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85 }}>
              Instagram<br/>Facebook<br/>Newsletter
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

window.CabinetVariant = CabinetVariant;
window.SharedNav = Nav;
