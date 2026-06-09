// Homepage E — Combinat: B's process band (dark olive, 4 steps) + A's editorial service spreads.
// Best of both: B's visual structure + A's writing/density.

function HomeE() {
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

      {/* B's PROCESS band — Cum funcționează (verde închis) */}
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
          <button className="btn" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>Vezi calendarul →</button>
        </div>
      </section>

      {/* A's EDITORIAL SERVICE SPREADS */}
      <section style={{ padding: '40px 64px 100px', background: 'var(--paper)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '40px 0 64px' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Servicii · Cinci formate</div>
            <h2 className="serif" style={{ fontSize: 88, margin: 0, lineHeight: 0.98, letterSpacing: '-0.02em' }}>
              Cum lucrăm<br/><span className="serif-it" style={{ color: 'var(--sage)' }}>împreună.</span>
            </h2>
          </div>
          <div style={{ maxWidth: 360, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', paddingTop: 24 }}>
            Cinci moduri de a colabora — de la o întrebare punctuală la urmărire
            de trei luni. Alege ritmul potrivit pentru tine.
          </div>
        </div>

        {[
          { n: '01', tag: 'Pediatrie', t: 'Consultație pediatrică', d: 'Evaluare clinică completă pe video, anamneză detaliată, recomandări scrise pe care le primești în 24h. Pentru copii de la naștere până la adolescență — creștere, dezvoltare, profilaxie, întrebări la zi.', p: '600 lei', time: '50 min · video' },
          { n: '02', tag: 'Nutriție', t: 'Consultație nutrițională', d: 'Plan alimentar personalizat pentru copii sau adulți. Anamneză, analiza obiceiurilor existente, analize recente, obiective realiste. Include un follow-up programat la 4 săptămâni.', p: '700 lei', time: '60 min · video' },
          { n: '03', tag: 'Integrativ', t: 'Consultație integrativă & monitorizare', d: 'Pediatrie și nutriție într-o singură întâlnire — pentru cazuri complexe sau pentru începutul unei urmăriri pe termen lung. Plan scris, recomandări structurate, prima programare de follow-up inclusă.', p: '1.100 lei', time: '90 min · video' },
          { n: '04', tag: 'Abonament', t: 'Monitorizare 3 luni', d: 'Trei luni de urmărire activă: mesagerie directă pentru întrebări între consultații, ajustări periodice ale planului, două video-call-uri lunare. Recomandat pentru obiective de durată.', p: 'de la 2.400 lei', time: '3 luni' },
          { n: '05', tag: 'Rapid', t: 'Întrebare rapidă', d: 'Pentru întrebări punctuale care nu necesită o consultație completă. Trimiți întrebarea + context prin formular și primești un răspuns scris, documentat, în 48 de ore.', p: '180 lei', time: '48h · scris' },
        ].map((s) => (
          <div key={s.n} style={{
            display: 'grid', gridTemplateColumns: '120px 1.4fr 1.6fr 220px',
            gap: 40, padding: '64px 0', borderTop: '1px solid var(--rule)',
            alignItems: 'start',
          }}>
            <div className="serif-it" style={{ fontSize: 96, color: 'var(--sage)', lineHeight: 0.85 }}>{s.n}</div>
            <div>
              <div className="eyebrow" style={{ color: 'var(--sage)', marginBottom: 12 }}>{s.tag}</div>
              <h3 className="serif" style={{ fontSize: 44, lineHeight: 1.05, margin: 0, letterSpacing: '-0.01em' }}>{s.t}</h3>
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink-soft)' }}>{s.d}</div>
            <div style={{ textAlign: 'right' }}>
              <div className="serif" style={{ fontSize: 36, color: 'var(--ink)', lineHeight: 1 }}>{s.p}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8, letterSpacing: '0.06em' }}>{s.time}</div>
              <a style={{ display: 'inline-block', marginTop: 20, fontSize: 13, color: 'var(--ink)', borderBottom: '1px solid var(--ink)', paddingBottom: 3 }}>Rezervă →</a>
            </div>
          </div>
        ))}
      </section>

      <HomeDespre />
      <HomeFooter />
    </div>
  );
}

window.HomeE = HomeE;
