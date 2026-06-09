// marks.jsx — Brand mark options + context. Replaces window.BranchSVG with a context-aware version.

const MarkContext = React.createContext('branch');

const M_BRANCH = ({ color = 'currentColor', style = {} }) => (
  <svg viewBox="0 0 40 60" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', ...style }}>
    <path d="M20 58 Q20 45 20 30 Q20 18 20 5" />
    <path d="M20 42 Q14 40 10 34" />
    <path d="M20 36 Q26 34 30 28" />
    <path d="M20 28 Q14 26 11 20" />
    <path d="M20 20 Q26 18 29 13" />
    <path d="M20 13 Q16 11 14 7" />
    <ellipse cx="10" cy="34" rx="3.2" ry="1.4" transform="rotate(-40 10 34)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="30" cy="28" rx="3.2" ry="1.4" transform="rotate(35 30 28)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="11" cy="20" rx="2.8" ry="1.2" transform="rotate(-40 11 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="29" cy="13" rx="2.8" ry="1.2" transform="rotate(35 29 13)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="14" cy="7" rx="2.2" ry="1" transform="rotate(-40 14 7)" fill={color} stroke="none" opacity="0.85"/>
  </svg>
);

const M_SYMMETRIC = ({ color = 'currentColor', style = {} }) => (
  <svg viewBox="0 0 40 60" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', ...style }}>
    <line x1="20" y1="58" x2="20" y2="5" />
    <path d="M20 42 Q14 40 10 34" />
    <path d="M20 42 Q26 40 30 34" />
    <path d="M20 28 Q14 26 11 20" />
    <path d="M20 28 Q26 26 29 20" />
    <path d="M20 14 Q15 12 13 8" />
    <path d="M20 14 Q25 12 27 8" />
    <ellipse cx="10" cy="34" rx="3" ry="1.3" transform="rotate(-40 10 34)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="30" cy="34" rx="3" ry="1.3" transform="rotate(40 30 34)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="11" cy="20" rx="2.6" ry="1.2" transform="rotate(-40 11 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="29" cy="20" rx="2.6" ry="1.2" transform="rotate(40 29 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="13" cy="8" rx="2.2" ry="1" transform="rotate(-40 13 8)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="27" cy="8" rx="2.2" ry="1" transform="rotate(40 27 8)" fill={color} stroke="none" opacity="0.85"/>
  </svg>
);

// Tree of life — full canopy with leaves + visible root system.
const M_TREELIFE = ({ color = 'currentColor', style = {} }) => (
  <svg viewBox="0 0 40 60" fill="none" stroke={color} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', ...style }}>
    {/* Trunk */}
    <path d="M20 52 Q20 42 20 30" strokeWidth="1.7"/>
    {/* Main branches */}
    <path d="M20 30 Q14 26 9 22" strokeWidth="1.2"/>
    <path d="M20 30 Q26 26 31 22" strokeWidth="1.2"/>
    <path d="M20 30 Q17 22 14 14" strokeWidth="1"/>
    <path d="M20 30 Q23 22 26 14" strokeWidth="1"/>
    <path d="M20 30 L20 10" strokeWidth="1.1"/>
    {/* Sub-branches */}
    <path d="M14 26 Q10 25 7 25" strokeWidth="0.6"/>
    <path d="M26 26 Q30 25 33 25" strokeWidth="0.6"/>
    <path d="M17 20 Q14 18 11 18" strokeWidth="0.6"/>
    <path d="M23 20 Q26 18 29 18" strokeWidth="0.6"/>
    {/* Leaf canopy */}
    <ellipse cx="20" cy="6" rx="1.6" ry="2.8" fill={color} stroke="none" opacity="0.9"/>
    <ellipse cx="17" cy="8" rx="1.4" ry="2.4" transform="rotate(-20 17 8)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="23" cy="8" rx="1.4" ry="2.4" transform="rotate(20 23 8)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="14" cy="11" rx="1.4" ry="2.4" transform="rotate(-30 14 11)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="26" cy="11" rx="1.4" ry="2.4" transform="rotate(30 26 11)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="11" cy="15" rx="1.5" ry="2.5" transform="rotate(-40 11 15)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="29" cy="15" rx="1.5" ry="2.5" transform="rotate(40 29 15)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="17" cy="14" rx="1.3" ry="2.2" transform="rotate(-15 17 14)" fill={color} stroke="none" opacity="0.8"/>
    <ellipse cx="23" cy="14" rx="1.3" ry="2.2" transform="rotate(15 23 14)" fill={color} stroke="none" opacity="0.8"/>
    <ellipse cx="8" cy="20" rx="1.4" ry="2.3" transform="rotate(-55 8 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="32" cy="20" rx="1.4" ry="2.3" transform="rotate(55 32 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="13" cy="22" rx="1.5" ry="2.5" transform="rotate(-30 13 22)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="27" cy="22" rx="1.5" ry="2.5" transform="rotate(30 27 22)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="20" cy="18" rx="1.4" ry="2.3" fill={color} stroke="none" opacity="0.8"/>
    <ellipse cx="5" cy="24" rx="1.4" ry="2.3" transform="rotate(-70 5 24)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="35" cy="24" rx="1.4" ry="2.3" transform="rotate(70 35 24)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="9" cy="25" rx="1.4" ry="2.3" transform="rotate(-50 9 25)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="31" cy="25" rx="1.4" ry="2.3" transform="rotate(50 31 25)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="16" cy="26" rx="1.4" ry="2.3" transform="rotate(-25 16 26)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="24" cy="26" rx="1.4" ry="2.3" transform="rotate(25 24 26)" fill={color} stroke="none" opacity="0.85"/>
    {/* Roots */}
    <path d="M20 52 Q16 54 10 56" strokeWidth="0.9"/>
    <path d="M20 52 Q24 54 30 56" strokeWidth="0.9"/>
    <path d="M20 52 Q18 56 14 58" strokeWidth="0.7"/>
    <path d="M20 52 Q22 56 26 58" strokeWidth="0.7"/>
    <path d="M20 52 L20 58" strokeWidth="0.7"/>
    <path d="M14 55 Q10 56 7 56" strokeWidth="0.5"/>
    <path d="M26 55 Q30 56 33 56" strokeWidth="0.5"/>
  </svg>
);

// Tree of life + stethoscope — the closest match to the reference logo.
const M_TREESTETHO = ({ color = 'currentColor', style = {} }) => (
  <svg viewBox="0 0 48 60" fill="none" stroke={color} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', ...style }}>
    {/* Tree (shifted left to leave room for stethoscope) */}
    <path d="M20 52 Q20 42 20 30" strokeWidth="1.7"/>
    <path d="M20 30 Q14 26 9 22" strokeWidth="1.2"/>
    <path d="M20 30 Q26 26 31 22" strokeWidth="1.2"/>
    <path d="M20 30 Q17 22 14 14" strokeWidth="1"/>
    <path d="M20 30 Q23 22 26 14" strokeWidth="1"/>
    <path d="M20 30 L20 10" strokeWidth="1.1"/>
    <path d="M14 26 Q10 25 7 25" strokeWidth="0.6"/>
    <path d="M26 26 Q30 25 33 25" strokeWidth="0.6"/>
    <path d="M17 20 Q14 18 11 18" strokeWidth="0.6"/>
    <path d="M23 20 Q26 18 29 18" strokeWidth="0.6"/>
    {/* Canopy */}
    <ellipse cx="20" cy="6" rx="1.6" ry="2.8" fill={color} stroke="none" opacity="0.9"/>
    <ellipse cx="17" cy="8" rx="1.4" ry="2.4" transform="rotate(-20 17 8)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="23" cy="8" rx="1.4" ry="2.4" transform="rotate(20 23 8)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="14" cy="11" rx="1.4" ry="2.4" transform="rotate(-30 14 11)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="26" cy="11" rx="1.4" ry="2.4" transform="rotate(30 26 11)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="11" cy="15" rx="1.5" ry="2.5" transform="rotate(-40 11 15)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="29" cy="15" rx="1.5" ry="2.5" transform="rotate(40 29 15)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="17" cy="14" rx="1.3" ry="2.2" transform="rotate(-15 17 14)" fill={color} stroke="none" opacity="0.8"/>
    <ellipse cx="23" cy="14" rx="1.3" ry="2.2" transform="rotate(15 23 14)" fill={color} stroke="none" opacity="0.8"/>
    <ellipse cx="8" cy="20" rx="1.4" ry="2.3" transform="rotate(-55 8 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="32" cy="20" rx="1.4" ry="2.3" transform="rotate(55 32 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="13" cy="22" rx="1.5" ry="2.5" transform="rotate(-30 13 22)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="27" cy="22" rx="1.5" ry="2.5" transform="rotate(30 27 22)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="20" cy="18" rx="1.4" ry="2.3" fill={color} stroke="none" opacity="0.8"/>
    <ellipse cx="5" cy="24" rx="1.4" ry="2.3" transform="rotate(-70 5 24)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="35" cy="24" rx="1.4" ry="2.3" transform="rotate(70 35 24)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="9" cy="25" rx="1.4" ry="2.3" transform="rotate(-50 9 25)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="31" cy="25" rx="1.4" ry="2.3" transform="rotate(50 31 25)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="16" cy="26" rx="1.4" ry="2.3" transform="rotate(-25 16 26)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="24" cy="26" rx="1.4" ry="2.3" transform="rotate(25 24 26)" fill={color} stroke="none" opacity="0.85"/>
    {/* Roots */}
    <path d="M20 52 Q16 54 10 56" strokeWidth="0.9"/>
    <path d="M20 52 Q24 54 30 56" strokeWidth="0.9"/>
    <path d="M20 52 Q18 56 14 58" strokeWidth="0.7"/>
    <path d="M20 52 Q22 56 26 58" strokeWidth="0.7"/>
    <path d="M20 52 L20 58" strokeWidth="0.7"/>
    <path d="M14 55 Q10 56 7 56" strokeWidth="0.5"/>
    <path d="M26 55 Q30 56 33 56" strokeWidth="0.5"/>

    {/* Stethoscope draped from upper-right canopy down to bell at lower-right */}
    <path d="M33 22 Q41 30 42 38 Q42 42 40 44" strokeWidth="0.8" fill="none"/>
    <circle cx="39" cy="46" r="2.4" strokeWidth="0.8"/>
    <circle cx="39" cy="46" r="1" fill={color} stroke="none"/>
  </svg>
);

// Olive / laurel — two curved branches meeting at base. Classical, medical-heritage.
const M_LAUREL = ({ color = 'currentColor', style = {} }) => (
  <svg viewBox="0 0 40 60" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', ...style }}>
    <path d="M20 58 Q8 40 6 8" />
    <path d="M20 58 Q32 40 34 8" />
    <ellipse cx="9" cy="44" rx="3" ry="1.3" transform="rotate(-65 9 44)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="7" cy="32" rx="3" ry="1.3" transform="rotate(-75 7 32)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="6" cy="20" rx="2.7" ry="1.2" transform="rotate(-82 6 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="6" cy="10" rx="2.4" ry="1.1" transform="rotate(-85 6 10)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="31" cy="44" rx="3" ry="1.3" transform="rotate(65 31 44)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="33" cy="32" rx="3" ry="1.3" transform="rotate(75 33 32)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="34" cy="20" rx="2.7" ry="1.2" transform="rotate(82 34 20)" fill={color} stroke="none" opacity="0.85"/>
    <ellipse cx="34" cy="10" rx="2.4" ry="1.1" transform="rotate(85 34 10)" fill={color} stroke="none" opacity="0.85"/>
  </svg>
);

// Leaf with ECG pulse — most explicitly medical + nutrition.
const M_PULSELEAF = ({ color = 'currentColor', style = {} }) => (
  <svg viewBox="0 0 40 60" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', ...style }}>
    {/* leaf outline */}
    <path d="M20 58 Q5 48 7 28 Q11 8 20 4 Q29 8 33 28 Q35 48 20 58 Z"/>
    {/* center vein */}
    <line x1="20" y1="58" x2="20" y2="6" strokeWidth="0.4" opacity="0.55"/>
    {/* side veins */}
    <path d="M20 22 Q14 21 9 18" strokeWidth="0.4" opacity="0.45"/>
    <path d="M20 22 Q26 21 31 18" strokeWidth="0.4" opacity="0.45"/>
    <path d="M20 44 Q14 44 9 41" strokeWidth="0.4" opacity="0.45"/>
    <path d="M20 44 Q26 44 31 41" strokeWidth="0.4" opacity="0.45"/>
    {/* ECG pulse */}
    <path d="M7 32 L13 32 L15 26 L19 38 L23 22 L26 32 L33 32" strokeWidth="1.4"/>
  </svg>
);

// Real logo — the new bronze tree (with stethoscope + roots) from the user's brandbook.
const M_LOGOREAL = ({ color, style = {} }) => (
  <img
    src="assets/logo-mark.png"
    alt="Olesea Jalba — logo"
    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', ...style }}
  />
);

const MARKS = {
  logoreal: M_LOGOREAL,
  branch: M_BRANCH,
  symmetric: M_SYMMETRIC,
  treelife: M_TREELIFE,
  treestetho: M_TREESTETHO,
  laurel: M_LAUREL,
  pulseleaf: M_PULSELEAF,
};

const MARK_LABELS = {
  logoreal: 'Logo Olesea (real)',
  branch: 'Ramură',
  symmetric: 'Arbore simetric',
  treelife: 'Arbore + rădăcini (canopy)',
  treestetho: 'Arbore + stetoscop (SVG)',
  laurel: 'Laur / olivă',
  pulseleaf: 'Frunză + puls',
};

// Context-aware BranchSVG — overrides window.BranchSVG so all variants pick up the chosen mark.
function BranchSVG({ color = 'currentColor', style }) {
  const id = React.useContext(MarkContext);
  const Mark = MARKS[id] || MARKS.branch;
  return <Mark color={color} style={style} />;
}

window.MarkContext = MarkContext;
window.MARKS = MARKS;
window.MARK_LABELS = MARK_LABELS;
window.BranchSVG = BranchSVG;
