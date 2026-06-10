// Homepage C — "Pentru cine" — Audience-first segmentation. Big cards per audience type.

function HomeC() {
  const { HomeNav, HomeHero, HomeDespre, HomeFooter, BranchSVG } = window;
  return (
    <div className="artboard">
      <HomeNav />
      <HomeHero
        headline={<>
          <span className="serif-it">Pentru</span> sugari,<br/>
          copii, adolescenți<br/>
          și <span className="serif-it" style={{ color: 'var(--sage)' }}>adulți.</span>
        </>}
        sub="Consult familii întregi — de la primele luni de viață până la deciziile alimentare de adult. Totul online, cu plan scris și urmărire."
      />

      {/* MIDDLE — Pentru cine e potrivit */}
      <section style={{ padding: '90px 64px 110px', background: 'var(--paper)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'end', marginBottom: 72 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Pentru cine</div>
            <h2 className="serif" style={{ fontSize: 80, margin: 0, lineHeight: 0.98, letterSpacing: '-0.02em' }}>
              Patru etape<br/>de <span className="serif-it" style={{ color: 'var(--sage)' }}>viață</span>.
            </h2>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            Fiecare vârstă vine cu întrebări specifice. Mai jos găsești cele mai
            frecvente motive de consultație pentru fiecare etapă — alege-l pe al
            tău și mergem de acolo.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            {
              age: '0–12 luni',
              t: 'Sugari & nou-născuți',
              motifs: ['Alăptare & lactație', 'Curba de creștere', 'Reflux & colici', 'Diversificare clasică / BLW', 'Primele controale pediatrice'],
              service: 'Consultație pediatrică · 600 lei',
              dark: true,
            },
            {
              age: '1–6 ani',
              t: 'Copii mici',
              motifs: ['Mâncatul selectiv', 'Echilibrarea meselor', 'Greutate, înălțime, somn', 'Imunitatea în colectivitate', 'Profilaxie & vaccinare'],
              service: 'Pediatrică sau nutrițională · 600–700 lei',
              dark: false,
            },
            {
              age: '7–18 ani',
              t: 'Școlari & adolescenți',
              motifs: ['Greutate & compoziție corporală', 'Performanță școlară & sport', 'Relația cu mâncarea', 'Pubertate, ciclu, somn', 'Anxietate alimentară'],
              service: 'Nutriție integrativă · 700 lei',
              dark: false,
            },
            {
              age: 'Adulți',
              t: 'Părinți & adulți',
              motifs: ['Echilibru alimentar realist', 'Slăbire fără diete-șablon', 'Sindrom metabolic & rezistență la insulină', 'Sarcină & post-partum', 'Construirea unui ritm'],
              service: 'Consultație nutrițională · 700 lei',
              dark: true,
            },
          ].map((a, i) => (
            <div key={a.t} style={{
              background: a.dark ? 'var(--beige)' : 'var(--cream)',
              color: a.dark ? 'var(--cream)' : 'var(--ink)',
              padding: '48px 44px',
              border: a.dark ? 'none' : '1px solid var(--rule)',
              minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: 32, top: 32, width: 32, height: 48, color: a.dark ? 'var(--sage-soft)' : 'var(--sage)', opacity: 0.9 }}>
                <BranchSVG color={a.dark ? 'var(--sage-soft)' : 'var(--sage)'} />
              </div>

              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: a.dark ? 'var(--sage-soft)' : 'var(--sage)', marginBottom: 16 }}>
                  {a.age}
                </div>
                <h3 className="serif" style={{ fontSize: 44, margin: '0 0 28px', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                  {a.t}
                </h3>
                <div style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: a.dark ? 'rgba(245,241,234,0.6)' : 'var(--ink-soft)', marginBottom: 12 }}>
                  Motive frecvente
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {a.motifs.map(m => (
                    <li key={m} style={{
                      padding: '10px 0',
                      borderTop: a.dark ? '1px solid rgba(245,241,234,0.18)' : '1px solid var(--rule)',
                      fontSize: 15,
                    }}>{m}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: a.dark ? '1px solid rgba(245,241,234,0.22)' : '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="serif-it" style={{ fontSize: 17, opacity: 0.88 }}>{a.service}</div>
                <a style={{ fontSize: 13, color: a.dark ? 'var(--cream)' : 'var(--ink)', borderBottom: a.dark ? '1px solid var(--cream)' : '1px solid var(--ink)', paddingBottom: 3 }}>
                  Programează →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick services summary band */}
      <section style={{ padding: '60px 64px', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
          {[
            ['Pediatrică', '600 lei', '50 min'],
            ['Nutrițională', '700 lei', '60 min'],
            ['Integrativă', '1.100 lei', '90 min'],
            ['Abonament', '2.400 lei+', '3 luni'],
            ['Întrebare rapidă', '180 lei', '48h'],
          ].map(([n, p, t]) => (
            <div key={n} style={{ paddingRight: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{n}</div>
              <div className="serif" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1 }}>{p}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6, letterSpacing: '0.06em' }}>{t}</div>
            </div>
          ))}
        </div>
      </section>

      <HomeDespre />
      <HomeFooter />
    </div>
  );
}

window.HomeC = HomeC;
