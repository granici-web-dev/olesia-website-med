// Homepage A — "Servicii Mari" — Editorial spreads. Each service is a full row with
// large title, paragraph, and visual emphasis. Maximum breathing room.

function HomeA() {
  const { HomeNav, HomeHero, HomeDespre, HomeFooter, BranchSVG } = window;
  return (
    <div className="artboard">
      <HomeNav />
      <HomeHero
        headline={<>
          Sănătatea<br/>
          copilului tău,<br/>
          <span className="serif-it" style={{ color: 'var(--sage)' }}>cu răbdare</span><br/>
          și știință.
        </>}
        sub="Consultații pediatrice și planuri de nutriție personalizate, exclusiv online — pentru ca distanța să nu te oprească din a primi îngrijire de calitate."
      />

      {/* MIDDLE — servicii ca spread editorial */}
      <section style={{ padding: '40px 64px 100px', background: 'var(--paper)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
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
        ].map((s, i) => (
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

window.HomeA = HomeA;
