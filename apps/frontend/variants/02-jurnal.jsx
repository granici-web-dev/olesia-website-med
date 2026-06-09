// Variant 2 — "Jurnal" — Magazine/journal grid. Photo embedded, table-of-contents services.

function JurnalVariant() {
  const BranchSVG = window.BranchSVG;
  return (
    <div className="artboard" style={{ background: 'var(--paper)' }}>
      {/* slim editorial top bar */}
      <header style={{ padding: '20px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ink)' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Vol. I · Cabinet Olesea Jalba</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 22 }}>Jurnal de pediatrie & nutriție</div>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>RO · EN · MAI 2026</div>
      </header>

      {/* nav */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '16px 56px', borderBottom: '1px solid var(--rule)', fontSize: 13, letterSpacing: '0.03em' }}>
        {['Despre', 'Servicii', 'Pediatrie', 'Nutriție', 'Articole', 'Resurse', 'Tarife', 'Contact'].map(x => (
          <a key={x} style={{ color: 'var(--ink)', cursor: 'pointer' }}>{x}</a>
        ))}
      </nav>

      {/* HERO — magazine cover spread */}
      <section style={{ padding: '60px 56px 80px', display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 48 }}>
        {/* left column: meta + branch */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Numărul curent</div>
            <h2 className="serif-it" style={{ fontSize: 44, margin: 0, lineHeight: 1.05, color: 'var(--ink)' }}>
              Despre cabinet
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', marginTop: 24 }}>
              Olesea Jalba este medic pediatru și nutriționist. Consultă copii
              de la naștere până la adolescență și adulți care caută o relație
              echilibrată cu mâncarea.
            </p>
          </div>
          <div style={{ width: 60, height: 90, color: 'var(--sage)', marginTop: 40 }}>
            <BranchSVG color="var(--sage)" />
          </div>
        </div>

        {/* center: huge serif title over photo */}
        <div style={{ position: 'relative' }}>
          <div className="photo" style={{ aspectRatio: '3/4', width: '100%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '-30%', right: '-30%', transform: 'translateY(-50%)', pointerEvents: 'none', textAlign: 'center' }}>
            <h1 className="serif" style={{ fontSize: 130, lineHeight: 0.95, margin: 0, color: 'var(--ink)', mixBlendMode: 'multiply', letterSpacing: '-0.02em' }}>
              <span className="serif-it">olesea</span><br/>jalba
            </h1>
          </div>
          <div style={{ position: 'absolute', bottom: -32, left: 0, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
            Portret · Chișinău, 2026
          </div>
        </div>

        {/* right: TOC */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>În acest cabinet</div>
          {[
            ['I.', 'Servicii', '03'],
            ['II.', 'Pediatrie', '07'],
            ['III.', 'Nutriție copii', '12'],
            ['IV.', 'Nutriție adulți', '15'],
            ['V.', 'Tarife & pachete', '18'],
            ['VI.', 'Articole', '22'],
            ['VII.', 'Resurse', '28'],
            ['VIII.', 'FAQ', '34'],
          ].map(([r, s, p]) => (
            <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--rule)', alignItems: 'baseline' }}>
              <span className="serif-it" style={{ fontSize: 18, color: 'var(--sage)', width: 36 }}>{r}</span>
              <span style={{ flex: 1, fontSize: 15 }}>{s}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>p. {p}</span>
            </div>
          ))}
          <button className="btn btn-dark" style={{ marginTop: 32, width: '100%', justifyContent: 'center' }}>
            Programează consultație →
          </button>
        </div>
      </section>

      {/* feature article tease — services in editorial layout */}
      <section style={{ background: 'var(--cream)', padding: '80px 56px', borderTop: '1px solid var(--ink)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 4fr', gap: 32, marginBottom: 48, alignItems: 'baseline' }}>
          <div className="eyebrow">Capitolul I</div>
          <h2 className="serif" style={{ fontSize: 72, margin: 0, lineHeight: 1, letterSpacing: '-0.01em' }}>
            Servicii — <span className="serif-it" style={{ color: 'var(--sage)' }}>cinci moduri</span> de a colabora
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, marginTop: 60, borderTop: '1px solid var(--ink)', paddingTop: 32 }}>
          {[
            ['I', 'Consultație pediatrică', 'Pentru creștere, dezvoltare, profilaxie.', '50 min · 600 lei'],
            ['II', 'Consultație nutrițională', 'Copii sau adulți, plan personalizat.', '60 min · 700 lei'],
            ['III', 'Integrativă & monitorizare', 'Pediatrie + nutriție într-o singură vizită.', '90 min · 1.100 lei'],
            ['IV', 'Abonament monitorizare', 'Trei luni de urmărire pe mesaj.', 'de la 2.400 lei'],
            ['V', 'Întrebare rapidă', 'Răspuns scris în 48 de ore.', '48h · 180 lei'],
          ].map(([n, t, d, p]) => (
            <div key={n}>
              <div className="serif-it" style={{ fontSize: 56, color: 'var(--sage)', lineHeight: 1 }}>{n}</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.2, marginTop: 12 }}>{t}</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-soft)', marginTop: 8 }}>{d}</p>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink)', marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--rule)', letterSpacing: '0.04em' }}>{p}</div>
            </div>
          ))}
        </div>
      </section>

      {/* about pull-quote section */}
      <section style={{ padding: '100px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Capitolul II — Despre</div>
          <h3 className="serif-it" style={{ fontSize: 56, margin: 0, lineHeight: 1.05, color: 'var(--ink)' }}>
            "Lucrez cu părinții, nu pe deasupra lor."
          </h3>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-soft)', columnCount: 2, columnGap: 32 }}>
          <p style={{ marginTop: 0 }}>
            Cred că relația cu un medic pediatru sau cu un nutriționist nu se
            construiește într-o singură vizită. De aceea îmi structurez programul
            în jurul monitorizării, nu al consultațiilor izolate.
          </p>
          <p>
            Lucrez cu familii din Chișinău și consult online pentru pacienții din
            afara orașului. Abordarea mea îmbină evidența medicală cu realitatea
            zilnică a familiei tale.
          </p>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--ink)', padding: '40px 56px', display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        <span>© Cabinet Olesea Jalba · 2026</span>
        <span>Chișinău · Online</span>
        <span>Imprint · GDPR</span>
      </footer>
    </div>
  );
}

window.JurnalVariant = JurnalVariant;
