// Homepage B — "Cum funcționează online" — Process flow + compact services.
// Big visual showing the 4 steps of an online consultation.

function HomeB() {
  const { HomeNav, HomeHero, HomeDespre, HomeFooter, BranchSVG } = window;
  return (
    <div className="artboard">
      <HomeNav />
      <HomeHero
        headline={<>
          Consultații<br/>
          <span className="serif-it" style={{ color: 'var(--sage)' }}>video</span>, plan<br/>
          scris, urmărire.
        </>}
        sub="Pediatrie și nutriție de calitate, fără să ieși din casă. Toate consultațiile se desfășoară online, iar planul scris ajunge la tine în 24 de ore."
      />

      {/* MIDDLE — Cum funcționează (proces, verde închis) */}
      <section style={{ padding: '90px 64px 110px', background: 'var(--sage-deep)', color: 'var(--cream)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 64 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 12 }}>Cum funcționează</div>
            <h2 className="serif" style={{ fontSize: 80, margin: 0, lineHeight: 0.98, letterSpacing: '-0.02em', color: 'var(--cream)' }}>
              Patru pași<span className="serif-it" style={{ color: 'var(--sage-soft)' }}>.</span><br/>
              <span className="serif-it">Niciun drum.</span>
            </h2>
          </div>
          <div style={{ maxWidth: 320, fontSize: 14, lineHeight: 1.7, opacity: 0.8, paddingTop: 16 }}>
            De la programare până la planul scris, totul se întâmplă într-un singur loc — în ritmul tău.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, position: 'relative' }}>
          {/* connecting line */}
          <div style={{ position: 'absolute', top: 36, left: '12.5%', right: '12.5%', height: 1, background: 'rgba(245,241,234,0.25)' }} />

          {[
            ['I', 'Programare', 'Alegi un slot din calendar și completezi un scurt formular cu motivul vizitei.'],
            ['II', 'Pregătire', 'Cu 24h înainte primești instrucțiuni și o listă de informații utile (analize, jurnal alimentar etc.).'],
            ['III', 'Consultația', 'Ne întâlnim pe video. Lungimea variază între 50–90 min, în funcție de tipul de consultație.'],
            ['IV', 'Plan scris', 'În 24h primești un document cu recomandări, plan alimentar (dacă e cazul) și pașii următori.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ position: 'relative' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: 'var(--sage)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 32, position: 'relative', zIndex: 1, border: '6px solid var(--sage-deep)',
              }}>
                <span className="serif-it" style={{ fontSize: 32, color: 'var(--cream)' }}>{n}</span>
              </div>
              <h3 className="serif" style={{ fontSize: 32, margin: '0 0 12px', color: 'var(--cream)' }}>{t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.78, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(245,241,234,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Platforma video, formularul și planul scris — toate gestionate într-un singur portal.</div>
          <button className="btn" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>
            Vezi calendarul →
          </button>
        </div>
      </section>

      {/* Services — compact list since main story is the process */}
      <section style={{ padding: '90px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 40 }}>
          <h2 className="serif" style={{ fontSize: 56, margin: 0, letterSpacing: '-0.01em' }}>
            Servicii<span className="serif-it" style={{ color: 'var(--sage)' }}>.</span>
          </h2>
          <a style={{ fontSize: 13, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>Vezi toate tarifele →</a>
        </div>

        {[
          ['01', 'Consultație pediatrică', '50 min · video', '600 lei'],
          ['02', 'Consultație nutrițională', '60 min · video', '700 lei'],
          ['03', 'Consultație integrativă & monitorizare', '90 min · video', '1.100 lei'],
          ['04', 'Abonament monitorizare 3 luni', '3 luni · video + mesagerie', 'de la 2.400 lei'],
          ['05', 'Întrebare rapidă', '48h · scris', '180 lei'],
        ].map(([n, t, time, p]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 180px', gap: 24, padding: '28px 0', borderTop: '1px solid var(--rule)', alignItems: 'baseline' }}>
            <div className="mono" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{n}</div>
            <div className="serif" style={{ fontSize: 28 }}>{t}</div>
            <div className="eyebrow">{time}</div>
            <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 500 }}>{p}</div>
          </div>
        ))}
      </section>

      <HomeDespre />
      <HomeFooter />
    </div>
  );
}

window.HomeB = HomeB;
