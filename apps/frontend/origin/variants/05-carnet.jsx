// Variant 5 — "Carnet" — Minimal type-forward, generous whitespace.
// Photo small, type does heavy lifting, most modern feel.

function CarnetVariant() {
  const BranchSVG = window.BranchSVG;
  return (
    <div className="artboard" style={{ background: '#faf7f1' }}>
      {/* minimal nav */}
      <header style={{ padding: '24px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, letterSpacing: '0.04em' }}>
          <span style={{ width: 14, height: 21, color: 'var(--sage)' }}><BranchSVG color="var(--sage)"/></span>
          <span style={{ fontWeight: 600 }}>OLESEA JALBA</span>
          <span style={{ color: 'var(--ink-soft)', marginLeft: 8 }}>— pediatru & nutriționist</span>
        </div>
        <nav style={{ display: 'flex', gap: 28, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {['Despre', 'Servicii', 'Tarife', 'Articole', 'Contact'].map(x => <a key={x} style={{ color: 'var(--ink)' }}>{x}</a>)}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="lang"><span className="active">RO</span><span>·</span><span>EN</span></span>
          <button className="btn" style={{ padding: '8px 14px', fontSize: 11, background: 'var(--ink)', color: 'var(--cream)' }}>→ Programează</button>
        </div>
      </header>

      <div style={{ height: 1, background: 'var(--rule)' }} />

      {/* HERO — type-forward */}
      <section style={{ padding: '120px 64px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ width: 36, height: 54, color: 'var(--sage)', margin: '0 auto 40px' }}>
          <BranchSVG color="var(--sage)" />
        </div>

        <h1 className="serif" style={{ fontSize: 156, lineHeight: 0.92, margin: 0, color: 'var(--ink)', letterSpacing: '-0.03em', fontWeight: 400 }}>
          o vizită <span className="serif-it">așteptată,</span><br/>
          nu o vizită<br/>
          <span className="serif-it" style={{ color: 'var(--sage)' }}>grăbită.</span>
        </h1>

        <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: 580, margin: '56px auto 0', color: 'var(--ink-soft)' }}>
          Consultații de pediatrie și nutriție pentru copii și adulți. Cu timp,
          cu atenție, cu un plan care funcționează în viața voastră reală.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40 }}>
          <button className="btn btn-dark">Programează consultație</button>
          <button className="btn btn-outline">Cum lucrăm</button>
        </div>
      </section>

      {/* trust strip — credentials */}
      <section style={{ padding: '32px 64px', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, alignItems: 'center' }}>
          {[
            ['Medic pediatru', 'USMF "N. Testemițanu"'],
            ['Nutriționist clinic', 'Formare specializată'],
            ['Experiență', '12+ ani în practică'],
            ['Limbi', 'Română · Rusă · Engleză'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ color: 'var(--sage)', fontSize: 11 }}>●</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{k}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* photo + bio split */}
      <section style={{ padding: '100px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div className="photo" style={{ aspectRatio: '4/5', maxWidth: 440 }} />
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Despre Olesea</div>
          <h2 className="serif" style={{ fontSize: 48, lineHeight: 1.1, margin: 0 }}>
            Doi ani de rezidențiat<br/>în pediatrie. Apoi o<br/>
            <span className="serif-it" style={{ color: 'var(--sage)' }}>întrebare</span>:<br/>
            ce mănâncă, totuși?
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink-soft)', marginTop: 32 }}>
            Așa a început drumul către nutriție. Astăzi îmbin cele două
            specializări într-un singur cabinet — pentru că nu poți vorbi despre
            sănătatea unui copil fără să vorbești despre ce e în farfuria lui.
          </p>
          <a style={{ display: 'inline-block', marginTop: 32, fontSize: 14, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 4 }}>
            Biografia completă →
          </a>
        </div>
      </section>

      {/* SERVICES — quiet table */}
      <section style={{ padding: '80px 64px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48 }}>
          <h2 className="serif" style={{ fontSize: 48, margin: 0 }}>Servicii<span className="serif-it" style={{ color: 'var(--sage)' }}>.</span></h2>
          <a style={{ fontSize: 13, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>Vezi toate tarifele →</a>
        </div>

        <div>
          {[
            ['01', 'Consultație pediatrică', 'Pentru creștere, dezvoltare, profilaxie. Copii 0–18 ani.', '50 min', '600 lei'],
            ['02', 'Consultație nutrițională', 'Plan alimentar personalizat. Copii sau adulți.', '60 min', '700 lei'],
            ['03', 'Consultație integrativă & monitorizare', 'Pediatrie + nutriție într-o singură vizită.', '90 min', '1.100 lei'],
            ['04', 'Abonament monitorizare', 'Trei luni de urmărire activă, ajustări periodice.', '3 luni', 'de la 2.400 lei'],
            ['05', 'Întrebare rapidă', 'Răspuns scris, documentat, în 48 de ore.', '48h', '180 lei'],
          ].map(([n, t, d, time, price], i) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 2fr 100px 120px', gap: 24, padding: '24px 0', borderTop: '1px solid var(--rule)', alignItems: 'center' }}>
              <div className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{n}</div>
              <div className="serif" style={{ fontSize: 22 }}>{t}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{d}</div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-soft)' }}>{time}</div>
              <div style={{ fontSize: 14, fontWeight: 500, textAlign: 'right' }}>{price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* articles preview */}
      <section style={{ padding: '100px 64px', background: 'var(--cream)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 56 }}>
          <h2 className="serif-it" style={{ fontSize: 48, margin: 0 }}>de citit</h2>
          <a style={{ fontSize: 13, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>Toate articolele →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            ['Diversificare', 'Cum începem diversificarea fără să stresăm familia', 'Mai 2026', '6 min'],
            ['Nutriție adulți', 'Ce înseamnă, de fapt, "să mănânci echilibrat"', 'Apr 2026', '8 min'],
            ['Pediatrie', 'Febră acasă: când chemăm medicul', 'Apr 2026', '4 min'],
          ].map(([tag, title, date, read]) => (
            <article key={title}>
              <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, var(--sage-soft) 0%, var(--cream-2) 100%)', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 16, left: 16, width: 30, height: 45, color: 'var(--sage)' }}><BranchSVG color="var(--sage)"/></div>
              </div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{tag} · {read}</div>
              <h3 className="serif" style={{ fontSize: 22, margin: '0 0 8px', lineHeight: 1.25 }}>{title}</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{date}</div>
            </article>
          ))}
        </div>
      </section>

      {/* contact footer */}
      <footer style={{ padding: '80px 64px 40px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 64 }}>
          <div>
            <h3 className="serif" style={{ fontSize: 36, margin: 0, lineHeight: 1.1 }}>
              <span className="serif-it">Hai să</span><br/>vorbim.
            </h3>
            <button className="btn btn-dark" style={{ marginTop: 24 }}>Programează →</button>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Cabinet</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>str. M. G. Bănulescu-Bodoni 25<br/>Chișinău, MD-2012</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Contact</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>+373 79 000 000<br/>contact@oleseajalba.md</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Social</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>Instagram<br/>Facebook</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
          <span>© Olesea Jalba · 2026</span>
          <span>GDPR · Termeni</span>
        </div>
      </footer>
    </div>
  );
}

window.CarnetVariant = CarnetVariant;
