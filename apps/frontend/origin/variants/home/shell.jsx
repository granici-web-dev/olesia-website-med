// Shared shell for homepage variants — nav, hero (top), despre + footer (bottom).
// Each homepage variant supplies its own MIDDLE.
// Online-only positioning (no physical bookings).

const { BranchSVG } = window;

const HomeNav = () => (
  <header style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 64px', borderBottom: '1px solid var(--rule)', background: 'var(--cream)',
  }}>
    <img src="assets/logo-long.png" alt="Dr. Olesea Jalba — pediatru & nutriționist"
      style={{ height: 60, width: 'auto', display: 'block' }} />
    <nav style={{ display: 'flex', gap: 32, fontSize: 13, color: 'var(--ink)' }}>
      {['Despre', 'Servicii', 'Pediatrie', 'Nutriție', 'Articole', 'Tarife', 'Contact'].map(x => <a key={x} style={{ color: 'inherit', textDecoration: 'none' }}>{x}</a>)}
    </nav>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <span className="lang"><span className="active">RO</span><span>/</span><span>EN</span></span>
      <button className="btn btn-dark" style={{ padding: '12px 20px', fontSize: 11 }}>Programează online →</button>
    </div>
  </header>
);

const HomeHero = ({ headline, sub }) => (
  <section style={{ padding: '88px 64px 100px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 80, alignItems: 'start' }}>
    <div>
      <div className="eyebrow" style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--sage)', display: 'inline-block' }} />
        Consultații exclusiv online · Pediatrie & Nutriție
      </div>
      <h1 className="serif" style={{ fontSize: 96, lineHeight: 1.02, margin: 0, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
        {headline}
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.65, maxWidth: 500, color: 'var(--ink-soft)', marginTop: 36 }}>
        {sub}
      </p>
      <div style={{ display: 'flex', gap: 16, marginTop: 44 }}>
        <button className="btn btn-dark">Programează consultație →</button>
        <button className="btn btn-outline">Cum funcționează</button>
      </div>

      <div style={{ display: 'flex', gap: 56, marginTop: 80, paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
        <div>
          <div className="serif" style={{ fontSize: 36, color: 'var(--sage)', lineHeight: 1 }}>12+</div>
          <div className="eyebrow" style={{ marginTop: 8 }}>Ani practică clinică</div>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 36, color: 'var(--sage)', lineHeight: 1 }}>2</div>
          <div className="eyebrow" style={{ marginTop: 8 }}>Specializări · Pediatrie & Nutriție</div>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 36, color: 'var(--sage)', lineHeight: 1 }}>1.400+</div>
          <div className="eyebrow" style={{ marginTop: 8 }}>Familii consultate</div>
        </div>
      </div>
    </div>

    <div style={{ position: 'relative' }}>
      <div style={{ aspectRatio: '4/5', width: '100%', position: 'relative', overflow: 'hidden', background: '#e9e1d0' }}>
        <img src="assets/olesea-hero.png" alt="Dr. Olesea Jalba"
          style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            height: '100%', width: 'auto', display: 'block',
            filter: 'var(--photo-filter, none)',
          }} />
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <span>Dr. Olesea Jalba</span>
        <span>Online · Oriunde</span>
      </div>
    </div>
  </section>
);

const HomeDespre = () => (
  <section style={{ padding: '110px 64px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80 }}>
    <div>
      <div className="eyebrow" style={{ marginBottom: 16 }}>Despre</div>
      <h3 className="serif" style={{ fontSize: 56, lineHeight: 1.08, margin: 0 }}>
        Două specializări,<br/><span className="serif-it" style={{ color: 'var(--sage)' }}>un singur scop</span>
      </h3>
    </div>
    <div>
      <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: 0 }}>
        Sunt medic pediatru și nutriționist. Cele două roluri se completează firesc:
        înțeleg corpul copilului în mișcare, dar și ce îl construiește la masă.
        Lucrez exclusiv online, pentru ca distanța să nu mai fie o problemă —
        familii din toată țara și din diasporă.
      </p>
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {[
          ['Studii', 'USMF "N. Testemițanu"\nRezidențiat pediatrie\nFormare nutriție clinică'],
          ['Specializări', 'Nutriție pediatrică\nAlimentația sugarului\nDiversificare BLW'],
        ].map(([h, b]) => (
          <div key={h}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>{h}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{b}</div>
          </div>
        ))}
      </div>
      <a style={{ display: 'inline-block', marginTop: 40, fontSize: 14, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 4 }}>
        Citește biografia completă →
      </a>
    </div>
  </section>
);

const HomeFooter = () => (
  <footer style={{ background: 'var(--beige)', color: 'var(--cream)', padding: '72px 64px 40px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '2.6fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
      <div>
        <img src="assets/logo-long.png" alt="Dr. Olesea Jalba — pediatru & nutriționist"
          style={{ maxWidth: 380, width: '100%', height: 'auto', display: 'block',
                   filter: 'brightness(1.6) saturate(0.95)' }} />
        <p style={{ marginTop: 24, fontSize: 14, color: 'rgba(245,241,234,0.78)', maxWidth: 360, lineHeight: 1.6 }}>
          Cabinet online de pediatrie și nutriție. Consultații prin video-call,
          plan scris la final, urmărire pe termen lung.
        </p>
        <button className="btn" style={{ background: 'var(--cream)', color: 'var(--ink)', marginTop: 24 }}>
          Programează →
        </button>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 14 }}>Servicii</div>
        <div style={{ fontSize: 13, lineHeight: 2, color: 'rgba(245,241,234,0.85)' }}>
          Consultație pediatrică<br/>Consultație nutrițională<br/>Integrativă<br/>Abonament<br/>Întrebare rapidă
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 14 }}>Resurse</div>
        <div style={{ fontSize: 13, lineHeight: 2, color: 'rgba(245,241,234,0.85)' }}>
          Articole<br/>Ghiduri descărcabile<br/>Meniuri săptămânale<br/>FAQ
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 14 }}>Contact</div>
        <div style={{ fontSize: 13, lineHeight: 2, color: 'rgba(245,241,234,0.85)' }}>
          contact@oleseajalba.md<br/>+373 79 000 000<br/>Instagram · Facebook
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid rgba(245,241,234,0.18)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.62)' }}>
      <span>© Olesea Jalba · 2026</span>
      <span>RO · EN</span>
      <span>GDPR · Termeni</span>
    </div>
  </footer>
);

window.HomeNav = HomeNav;
window.HomeHero = HomeHero;
window.HomeDespre = HomeDespre;
window.HomeFooter = HomeFooter;
