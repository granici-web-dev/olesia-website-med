// Variant 3 — "Prim Contact" — Info-dense, commercial-oriented (à la Irina Buga).
// Booking widget prominent in hero, credentials card, clear pricing.

function PrimContactVariant() {
  const BranchSVG = window.BranchSVG;
  const Nav = window.SharedNav;
  return (
    <div className="artboard">
      <Nav />

      {/* HERO with embedded scheduler */}
      <section style={{ padding: '56px 56px 80px', display: 'grid', gridTemplateColumns: '1fr 480px', gap: 56, alignItems: 'start' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 24 }}>
            <span style={{ color: 'var(--sage)' }}>● </span>Pediatru · Nutriționist · Chișinău & Online
          </div>
          <h1 className="serif" style={{ fontSize: 78, lineHeight: 1.04, margin: 0, letterSpacing: '-0.015em' }}>
            Consultații care<br/>
            țin cont de <span className="serif-it" style={{ color: 'var(--sage)' }}>copilul</span><br/>
            și de viața din jurul lui.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 560, color: 'var(--ink-soft)', marginTop: 32 }}>
            Sunt Olesea Jalba — medic pediatru și nutriționist. Te ajut cu evaluări
            clinice, planuri de alimentație și monitorizare pe termen lung, pentru
            copii și adulți.
          </p>

          {/* photo + credentials card row */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, marginTop: 48, alignItems: 'stretch' }}>
            <div className="photo" style={{ aspectRatio: '4/5' }} />
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', padding: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Credențiale</div>
              {[
                ['Medic pediatru', 'USMF "N. Testemițanu"'],
                ['Nutriționist', 'Formare nutriție clinică'],
                ['Membru', 'Societatea de Pediatrie'],
                ['Limbi', 'Română · Rusă · Engleză'],
              ].map(([k, v], i) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--rule)', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-soft)' }}>{k}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* booking widget */}
        <aside style={{ position: 'sticky', top: 24, background: 'var(--ink)', color: 'var(--cream)', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="eyebrow" style={{ color: 'var(--sage-soft)' }}>Programare rapidă</div>
            <div style={{ width: 28, height: 42, color: 'var(--sage-soft)' }}><BranchSVG color="var(--sage-soft)" /></div>
          </div>
          <h3 className="serif-it" style={{ fontSize: 32, margin: '4px 0 24px', color: 'var(--cream)' }}>
            Mai 2026
          </h3>

          {/* tiny calendar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 24, fontSize: 11 }}>
            {['L','M','M','J','V','S','D'].map((d,i) => <div key={i} style={{ opacity: 0.5, textAlign: 'center', padding: '4px 0' }}>{d}</div>)}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isOpen = [13, 15, 18, 20, 22, 27, 29].includes(day);
              const isSel = day === 20;
              return (
                <div key={day} style={{
                  textAlign: 'center', padding: '6px 0', fontSize: 12,
                  background: isSel ? 'var(--sage)' : 'transparent',
                  color: isSel ? 'var(--cream)' : isOpen ? 'var(--cream)' : 'rgba(245,241,234,0.3)',
                  fontWeight: isSel ? 600 : 400,
                  border: isOpen && !isSel ? '1px solid rgba(184,196,173,0.4)' : '1px solid transparent',
                }}>{day}</div>
              );
            })}
          </div>

          <div className="eyebrow" style={{ color: 'var(--sage-soft)', marginBottom: 12 }}>Miercuri, 20 mai · ore libere</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['09:00','10:30','13:00','14:30','16:00','17:30'].map((t,i) => (
              <div key={t} style={{
                padding: '12px 8px', textAlign: 'center', fontSize: 13,
                border: '1px solid rgba(245,241,234,0.18)',
                background: i === 2 ? 'var(--cream)' : 'transparent',
                color: i === 2 ? 'var(--ink)' : 'var(--cream)',
                fontWeight: i === 2 ? 600 : 400,
              }}>{t}</div>
            ))}
          </div>

          <button className="btn" style={{ background: 'var(--cream)', color: 'var(--ink)', width: '100%', justifyContent: 'center', marginTop: 24 }}>
            Continuă programarea →
          </button>
          <div style={{ marginTop: 16, fontSize: 11, opacity: 0.6, textAlign: 'center' }}>
            sau scrie la contact@oleseajalba.md
          </div>
        </aside>
      </section>

      {/* SERVICES — grid of cards but editorial, not AI */}
      <section style={{ padding: '64px 56px', background: 'var(--paper)', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'end', marginBottom: 48 }}>
          <div>
            <div className="eyebrow">Servicii</div>
            <h2 className="serif" style={{ fontSize: 56, margin: '8px 0 0', lineHeight: 1.05 }}>Cum lucrăm <span className="serif-it" style={{ color: 'var(--sage)' }}>împreună</span></h2>
          </div>
          <div style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
            Cinci formate de colaborare, de la întrebări punctuale până la
            programe de monitorizare. Toate consultațiile se desfășoară în
            cabinet sau online, după preferință.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { tag: 'Pediatrie', name: 'Consultație pediatrică', desc: 'Anamneză completă, examen clinic, recomandări scrise.', price: '600 lei', time: '50 min', highlight: false },
            { tag: 'Nutriție', name: 'Consultație nutrițională', desc: 'Plan alimentar personalizat pentru copii sau adulți.', price: '700 lei', time: '60 min', highlight: false },
            { tag: 'Integrativă', name: 'Consultație integrativă', desc: 'Pediatrie + nutriție într-un singur drum. Monitorizare inclusă.', price: '1.100 lei', time: '90 min', highlight: true },
            { tag: 'Abonament', name: 'Monitorizare 3 luni', desc: 'Urmărire continuă, mesagerie directă, ajustări periodice.', price: 'de la 2.400 lei', time: '3 luni', highlight: false },
            { tag: 'Rapid', name: 'Întrebare rapidă', desc: 'Răspuns scris în 48h pentru întrebări punctuale.', price: '180 lei', time: '48h', highlight: false },
            { tag: 'Resurse', name: 'Ghiduri descărcabile', desc: 'Meniuri, scheme de diversificare, fișe practice.', price: 'gratuit', time: 'instant', highlight: false },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.highlight ? 'var(--ink)' : 'var(--cream)',
              color: s.highlight ? 'var(--cream)' : 'var(--ink)',
              padding: 28,
              border: '1px solid var(--rule)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 240,
            }}>
              <div>
                <div className="eyebrow" style={{ color: s.highlight ? 'var(--sage-soft)' : 'var(--sage)' }}>{s.tag}</div>
                <div className="serif" style={{ fontSize: 28, lineHeight: 1.15, marginTop: 12 }}>{s.name}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: s.highlight ? 'rgba(245,241,234,0.7)' : 'var(--ink-soft)', marginTop: 12 }}>{s.desc}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24, paddingTop: 16, borderTop: s.highlight ? '1px solid rgba(245,241,234,0.18)' : '1px solid var(--rule)' }}>
                <div className="serif" style={{ fontSize: 22 }}>{s.price}</div>
                <div className="mono" style={{ fontSize: 11, opacity: 0.7 }}>{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials strip */}
      <section style={{ padding: '80px 56px' }}>
        <div className="eyebrow" style={{ marginBottom: 32 }}>Părinții spun</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {[
            ['"O ascultă pe fiica mea mai bine decât am ascultat-o eu. Recomandările sunt clare și se vede că le construiește pentru ea, nu pentru un șablon."', 'Ana, mamă a Mariei (4 ani)'],
            ['"Am ajuns la dr. Olesea după două consultații care nu m-au mulțumit. Diferența: timpul pe care îl ia să înțeleagă contextul familiei."', 'Vladimir, tată al lui Mihai (7 ani)'],
            ['"Planul nutrițional pentru mine ca adult a fost realist și ușor de urmat. După trei luni — schimbări concrete, fără promisiuni mari."', 'Cristina (34 ani)'],
          ].map(([q, a]) => (
            <div key={a}>
              <p className="serif-it" style={{ fontSize: 22, lineHeight: 1.4, margin: 0, color: 'var(--ink)' }}>{q}</p>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--rule)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>{a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ teaser */}
      <section style={{ padding: '80px 56px', borderTop: '1px solid var(--rule)', background: 'var(--paper)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Întrebări frecvente</div>
            <h2 className="serif" style={{ fontSize: 44, margin: 0, lineHeight: 1.1 }}>Înainte să <span className="serif-it" style={{ color: 'var(--sage)' }}>programezi</span></h2>
          </div>
          <div>
            {[
              'De la ce vârstă consultați copii?',
              'Cum se desfășoară o consultație online?',
              'Ce trebuie să aduc la prima vizită?',
              'Acceptați asigurare medicală?',
              'Pot anula sau reprograma consultația?',
            ].map((q, i) => (
              <div key={q} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule)' }}>
                <span style={{ fontSize: 18 }}>{q}</span>
                <span className="serif-it" style={{ fontSize: 24, color: 'var(--sage)' }}>+</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

window.PrimContactVariant = PrimContactVariant;
