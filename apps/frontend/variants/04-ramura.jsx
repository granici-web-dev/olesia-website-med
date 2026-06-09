// Variant 4 — "Ramură" — Botanic, layered, paper feel. Most organic.

function RamuraVariant() {
  const BranchSVG = window.BranchSVG;
  return (
    <div className="artboard" style={{ background: 'var(--cream)' }}>
      {/* paper-like texture overlay */}
      <div style={{ position: 'relative' }}>
        {/* nav */}
        <header style={{ padding: '32px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 22, height: 32, color: 'var(--sage)' }}><BranchSVG color="var(--sage)"/></span>
            <span className="serif-it" style={{ fontSize: 22, color: 'var(--ink)' }}>olesea<span style={{ color: 'var(--sage)' }}>·</span>jalba</span>
          </div>
          <nav style={{ display: 'flex', gap: 36, fontSize: 13, color: 'var(--ink)' }}>
            {['Despre', 'Servicii', 'Pediatrie', 'Nutriție', 'Articole', 'Resurse', 'Contact'].map(x => <a key={x}>{x}</a>)}
          </nav>
          <span className="lang"><span className="active">RO</span><span>/</span><span>EN</span></span>
        </header>

        {/* HERO — overlapping panels */}
        <section style={{ padding: '40px 56px 120px', position: 'relative' }}>
          {/* big background branch */}
          <div style={{ position: 'absolute', right: 56, top: 80, width: 280, height: 420, color: 'var(--sage-soft)', opacity: 0.35, pointerEvents: 'none' }}>
            <BranchSVG color="var(--sage-soft)" />
          </div>

          <div className="eyebrow" style={{ marginBottom: 24 }}>Cabinet pediatrie & nutriție · Chișinău</div>

          <h1 className="serif" style={{ fontSize: 120, lineHeight: 0.96, margin: 0, color: 'var(--ink)', maxWidth: 1100, letterSpacing: '-0.02em' }}>
            <span className="serif-it">Crește</span> sănătos,<br/>
            mănâncă <span className="serif-it" style={{ color: 'var(--sage)' }}>așezat</span>,<br/>
            trăiește <span className="serif-it">firesc.</span>
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 48, marginTop: 80, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--ink-soft)', margin: 0, maxWidth: 460 }}>
                Olesea Jalba — medic pediatru și nutriționist. Consultații pentru
                copii și adulți, planuri de alimentație care încap în viața reală
                a familiei tale.
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                <button className="btn btn-sage">Programează →</button>
                <button className="btn btn-outline">Despre Olesea</button>
              </div>
            </div>

            {/* layered photo card */}
            <div style={{ position: 'relative', justifySelf: 'end' }}>
              <div style={{ position: 'absolute', top: 16, left: 16, width: '100%', height: '100%', background: 'var(--sage)', zIndex: 0 }} />
              <div className="photo" style={{ width: 280, height: 360, position: 'relative', zIndex: 1 }} />
            </div>

            {/* meta card */}
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', padding: 28, position: 'relative' }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Despre cabinet</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 20, color: 'var(--ink)' }}>
                "Cred în consultații lungi, nu repede. În răspunsuri concrete, nu în diete-șablon."
              </div>
              <div style={{ height: 1, background: 'var(--rule)', margin: '20px 0' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 12 }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Cabinet</div>
                  <div style={{ marginTop: 4 }}>Chișinău</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Online</div>
                  <div style={{ marginTop: 4 }}>Toată lumea</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Limbi</div>
                  <div style={{ marginTop: 4 }}>RO · RU · EN</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10 }}>Vârstă</div>
                  <div style={{ marginTop: 4 }}>0 — adulți</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* sectioning ornament */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 56px', margin: '0 0 40px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--ink)' }} />
          <span style={{ width: 28, height: 42, color: 'var(--sage)' }}><BranchSVG color="var(--sage)" /></span>
          <div style={{ flex: 1, height: 1, background: 'var(--ink)' }} />
        </div>

        {/* SERVICES — alternating left/right layout */}
        <section style={{ padding: '40px 56px 100px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Servicii</div>
            <h2 className="serif" style={{ fontSize: 64, margin: 0, lineHeight: 1.05 }}>
              Cinci moduri de a <span className="serif-it" style={{ color: 'var(--sage)' }}>colabora</span>
            </h2>
          </div>

          {[
            ['01', 'Consultație pediatrică', 'Evaluare clinică completă, monitorizarea creșterii, vaccinare, recomandări scrise pentru părinți. Pentru copii de la naștere până la adolescență.', '600 lei · 50 min', 'left'],
            ['02', 'Consultație nutrițională', 'Plan alimentar personalizat pentru copii sau adulți. Anamneză, analize, obiective realiste. Include un follow-up la 4 săptămâni.', '700 lei · 60 min', 'right'],
            ['03', 'Consultație integrativă & monitorizare', 'Pediatrie și nutriție într-o singură vizită. Recomandat pentru cazuri complexe sau pentru urmărire pe termen lung.', '1.100 lei · 90 min', 'left'],
            ['04', 'Abonament monitorizare', 'Trei luni de urmărire activă: mesagerie directă, ajustări periodice, consultații lunare incluse.', 'de la 2.400 lei', 'right'],
            ['05', 'Întrebare rapidă', 'Pentru întrebări punctuale care nu necesită o consultație completă. Răspuns scris, documentat, în 48 de ore.', '180 lei · 48h', 'left'],
          ].map(([n, t, d, p, side]) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: side === 'left' ? '120px 1fr 1fr 200px' : '200px 1fr 1fr 120px', gap: 32, padding: '40px 0', borderTop: '1px solid var(--rule)', alignItems: 'baseline' }}>
              {side === 'left' ? (
                <>
                  <div className="serif-it" style={{ fontSize: 64, color: 'var(--sage)', lineHeight: 1 }}>{n}</div>
                  <div className="serif" style={{ fontSize: 32, lineHeight: 1.1 }}>{t}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)' }}>{d}</div>
                  <div style={{ textAlign: 'right', fontSize: 13, letterSpacing: '0.04em' }}>{p}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, letterSpacing: '0.04em' }}>{p}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)' }}>{d}</div>
                  <div className="serif" style={{ fontSize: 32, lineHeight: 1.1, textAlign: 'right' }}>{t}</div>
                  <div className="serif-it" style={{ fontSize: 64, color: 'var(--sage)', lineHeight: 1, textAlign: 'right' }}>{n}</div>
                </>
              )}
            </div>
          ))}
        </section>

        {/* CTA band */}
        <section style={{ background: 'var(--sage)', color: 'var(--cream)', padding: '80px 56px', textAlign: 'center', position: 'relative' }}>
          <div style={{ width: 40, height: 60, color: 'var(--sage-soft)', margin: '0 auto 24px' }}><BranchSVG color="var(--cream)"/></div>
          <h3 className="serif-it" style={{ fontSize: 56, margin: 0, lineHeight: 1.1, color: 'var(--cream)' }}>
            Programează o consultație
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 540, margin: '24px auto 32px', opacity: 0.85 }}>
            În cabinet, la Chișinău, sau online — de oriunde te-ai afla.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button className="btn" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>Calendar online →</button>
            <button className="btn" style={{ background: 'transparent', color: 'var(--cream)', border: '1px solid var(--cream)' }}>Scrie un mesaj</button>
          </div>
        </section>
      </div>
    </div>
  );
}

window.RamuraVariant = RamuraVariant;
