// explainer.jsx — "Why Perry Does What Claude Cannot" animated explainer.
// Reads timeline primitives from window (animations.jsx loaded first).
const { Stage, Sprite, useSprite, useTime, Easing, interpolate, animate, clamp } = window;

// ── Palette ──────────────────────────────────────────────────────────────────
const BG          = '#FFFFFF';
const INK         = '#1C1B18';
const INK_SOFT    = '#6B6559';
const INK_FAINT   = '#98917F';
const ACCENT      = '#009C7F';
const ACCENT_SOFT = '#E4F3EE';
const ACCENT_BD   = '#BFE3D8';
const GREEN       = '#2E8B57';
const GREEN_SOFT  = '#E9F4EC';
const GREEN_BD    = '#C6E4CF';
const AMBER       = '#B77B1F';
const AMBER_SOFT  = '#FAF0DD';
const AMBER_BD    = '#EED9AE';
const RED         = '#B24A32';
const RED_SOFT    = '#F7E7E1';
const RED_BD      = '#E7C6BA';
const BORDER      = '#E6E6E6';
const WHITE       = '#FFFFFF';
const MUTED       = '#F0F0F0';

const CLAUDE      = '#D97757';
const CLAUDE_SOFT = '#F5EAE5';
const CLAUDE_BD   = '#E8C4B8';
const CLAUDE_BG   = '#FFFFFF';

const HI_CLAUDE = { color: CLAUDE, fontWeight: 700 };
const HI_ACCENT = { color: ACCENT, fontWeight: 700 };
const HI_INK    = { color: INK, fontWeight: 600 };
const CLAUDE_INK  = '#141413';

const SANS  = "'Inter', system-ui, sans-serif";
const SERIF = "'Source Serif 4', Georgia, serif";
const MONO  = "'IBM Plex Mono', ui-monospace, monospace";

const SHADOW = '0 1px 2px rgba(28,27,24,.05), 0 10px 30px rgba(28,27,24,.06)';
const SHADOW_SM = '0 1px 2px rgba(28,27,24,.05), 0 4px 14px rgba(28,27,24,.05)';
const PERRY_LOGO = './assets/perry-logo.png';
const R_PANEL = 8;
const R_CARD = 6;
const R_BOX = 5;
const R_CTRL = 4;
const R_MIN = 3;
const R_PILL = 999;
const R_DOT = 99;

function fx(localTime, delay = 0, dur = 0.55, dist = 14) {
  const t = clamp((localTime - delay) / dur, 0, 1);
  const e = Easing.easeOutCubic(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function grow(localTime, delay = 0, dur = 0.6) {
  return Easing.easeOutCubic(clamp((localTime - delay) / dur, 0, 1));
}

function Eyebrow({ n, label, x = 64, y = 52 }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: ACCENT, letterSpacing: '0.06em' }}>{n}</span>
      <span style={{ width: 22, height: 1, background: ACCENT, opacity: 0.5 }} />
      <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

function Chip({ children, tone = 'neutral', style = {} }) {
  const tones = {
    neutral: { bg: MUTED, fg: INK_SOFT, bd: BORDER },
    accent:  { bg: ACCENT_SOFT, fg: ACCENT, bd: ACCENT_BD },
    green:   { bg: GREEN_SOFT, fg: GREEN, bd: GREEN_BD },
    amber:   { bg: AMBER_SOFT, fg: AMBER, bd: AMBER_BD },
    red:     { bg: RED_SOFT, fg: RED, bd: RED_BD },
    ink:     { bg: INK, fg: '#F6F4EF', bd: INK },
    claude:  { bg: CLAUDE_SOFT, fg: CLAUDE, bd: CLAUDE_BD },
  };
  const c = tones[tone] || tones.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: R_PILL, background: c.bg, color: c.fg, border: `1px solid ${c.bd}`, fontSize: 13, fontWeight: 500, fontFamily: SANS, whiteSpace: 'nowrap', ...style }}>{children}</span>
  );
}

function Dot({ color, size = 7 }) {
  return <span style={{ width: size, height: size, borderRadius: R_DOT, background: color, display: 'inline-block', flexShrink: 0 }} />;
}

function PerryLogo({ height = 28, style = {} }) {
  return <img src={PERRY_LOGO} alt="" style={{ height, width: 'auto', display: 'block', flexShrink: 0, ...style }} />;
}

function SourceRef({ children, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: MONO, fontSize: 11.5, color: '#8E8778', letterSpacing: '0.005em', ...style }}>
      <span style={{ width: 5, height: 5, borderRadius: R_DOT, background: ACCENT, opacity: 0.75, flexShrink: 0 }} />
      {children}
    </span>
  );
}

function DocIcon({ color = ACCENT, w = 15 }) {
  const h = w * 1.28;
  return (
    <svg width={w} height={h} viewBox="0 0 15 19" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1.5h8L14 6v11.5H1z" fill={WHITE} stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 1.5V6h5" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 10h7M4 13h5" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function FlowArrow({ length = 90, localTime = 0, delay = 0, color = ACCENT }) {
  const p = grow(localTime, delay, 0.5);
  const drawn = length * p;
  const cyc = (localTime * 0.9) % 1;
  const dotX = cyc * length;
  return (
    <div style={{ position: 'relative', width: length, height: 12, opacity: clamp(p * 2, 0, 1) }}>
      <div style={{ position: 'absolute', top: 5, left: 0, width: drawn, height: 2, background: color, borderRadius: 2, opacity: 0.55 }} />
      <div style={{ position: 'absolute', top: 1, left: drawn - 6, width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `7px solid ${color}`, opacity: 0.65 }} />
      {p > 0.95 && <div style={{ position: 'absolute', top: 3.5, left: dotX, width: 5, height: 5, borderRadius: R_DOT, background: color, boxShadow: `0 0 6px ${color}` }} />}
    </div>
  );
}

function ColLabel({ children }) {
  return <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>;
}

function Scene({ children, fadeIn = 0.5, fadeOut = 0.5, drift = 0 }) {
  const { localTime, duration } = useSprite();
  const fadeInOp = clamp(localTime / fadeIn, 0, 1);
  const fadeOutOp = fadeOut > 0 ? clamp((duration - localTime) / fadeOut, 0, 1) : 1;
  const op = Math.min(fadeInOp, fadeOutOp);
  const s = 1 + drift * (localTime / Math.max(duration, 0.01));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, transform: `scale(${s})`, transformOrigin: '50% 45%' }}>
      {children}
    </div>
  );
}

function QInterstitial({ kicker, lines, ghost, part }) {
  const { localTime } = useSprite();
  return (
    <Scene fadeIn={0.45} fadeOut={0.4} drift={0.02}>
      <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, bottom: -120, fontFamily: SERIF, fontSize: 460, fontWeight: 700, color: 'rgba(255,255,255,0.035)', lineHeight: 1, ...fx(localTime, 0.1, 1.0, 0) }}>{ghost}</div>
        {part && (
          <div style={{ position: 'absolute', left: 64, top: 52, ...fx(localTime, 0.05, 0.5, 8) }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, color: ACCENT, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{part}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 96px' }}>
          <div style={{ textAlign: 'center', maxWidth: 960 }}>
            <div style={{ ...fx(localTime, 0.1, 0.6, 10), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 26 }}>
              <span style={{ width: 26, height: 1.5, background: ACCENT }} />
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: ACCENT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{kicker}</span>
            </div>
            {lines.map((ln, i) => (
              <div key={i} style={{ ...fx(localTime, 0.3 + i * 0.16, 0.65, 20), fontFamily: SERIF, fontSize: 58, fontWeight: 600, color: '#F6F4EF', lineHeight: 1.08, letterSpacing: '-0.02em' }}>{ln}</div>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}

function PullQuote({ children, localTime, delay = 0, dark = false }) {
  return (
    <div style={{ ...fx(localTime, delay, 0.7, 16), padding: '22px 28px', background: dark ? INK : WHITE, border: `1px solid ${dark ? INK : BORDER}`, borderRadius: R_PANEL, boxShadow: dark ? SHADOW : SHADOW_SM, borderLeft: `4px solid ${ACCENT}` }}>
      <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: dark ? '#F6F4EF' : INK, lineHeight: 1.35, letterSpacing: '-0.01em' }}>{children}</div>
    </div>
  );
}

function BottomBar({ children, localTime, delay = 2.2 }) {
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, bottom: 40, ...fx(localTime, delay, 0.7, 10), display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 26, height: 26, borderRadius: R_DOT, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: SERIF, fontSize: 15, color: ACCENT, fontWeight: 700 }}>→</span>
      <span style={{ fontFamily: SANS, fontSize: 15.5, color: INK_SOFT, fontWeight: 500, lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARGUMENT 1 — WHY PERRY DOES WHAT CLAUDE CANNOT
// ═══════════════════════════════════════════════════════════════════════════

function S1_Title() {
  const { localTime } = useSprite();
  const ruleW = 380 * grow(localTime, 0.35, 0.9);
  return (
    <Scene>
      <div style={{ position: 'absolute', left: 64, top: 210, right: 64 }}>
        <div style={{ ...fx(localTime, 0.15, 0.7, 18), fontFamily: SERIF, fontSize: 72, fontWeight: 600, color: INK, lineHeight: 1.04, letterSpacing: '-0.02em' }}>
          Why Perry Does What Claude Cannot
        </div>
        <div style={{ height: 2, width: ruleW, background: ACCENT, margin: '28px 0 26px', borderRadius: 2 }} />
        <div style={{ ...fx(localTime, 0.55, 0.7, 14), fontFamily: SANS, fontSize: 26, fontWeight: 500, color: INK_SOFT, letterSpacing: '-0.01em', lineHeight: 1.35 }}>
          Claude provides <span style={HI_INK}>legal reasoning</span>. Perry provides a <span style={HI_ACCENT}>legal system of record</span>.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 58, ...fx(localTime, 1.0, 0.7, 10) }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: INK_FAINT }}>Not "Claude isn't smart enough." They're different product categories.</span>
      </div>
    </Scene>
  );
}

function S2_Categories() {
  const { localTime } = useSprite();
  const claudePoints = ['Extraction', 'Comparison', 'Drafting', 'Summarization', 'One-off review'];
  const perryPoints = ['Canonical fund record', 'Entity graph', 'Obligation state', 'Cross-document truth', 'Governed reuse'];
  return (
    <Scene>
      <Eyebrow n="01 · A" label="Different Questions" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>Claude is already powerful. So why isn't it enough?</div>
        <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: INK_FAINT, marginTop: 6, lineHeight: 1.4 }}>In many scenarios a vertical platform is genuinely unnecessary. The judgment is about category, not intelligence.</div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, top: 178, bottom: 88, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Claude — top */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: 24, padding: '22px 26px', background: CLAUDE_BG, border: `1px solid ${CLAUDE_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW, ...fx(localTime, 0.35, 0.6, 18) }}>
          <div style={{ flex: 1.15, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Chip tone="claude" style={{ marginBottom: 12, alignSelf: 'flex-start' }}>Claude solves</Chip>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: CLAUDE_INK, lineHeight: 1.28, letterSpacing: '-0.01em' }}>How can a single legal task be completed faster?</div>
          </div>
          <div style={{ width: 1, background: CLAUDE_BD, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'center' }}>
            {claudePoints.map((p, i) => (
              <span key={p} style={{ ...fx(localTime, 0.7 + i * 0.1, 0.4, 8), padding: '8px 13px', borderRadius: R_PILL, background: WHITE, border: `1px solid ${CLAUDE_BD}`, fontFamily: SANS, fontSize: 13, fontWeight: 500, color: CLAUDE_INK }}>{p}</span>
            ))}
          </div>
        </div>

        {/* vs divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, ...fx(localTime, 0.55, 0.45, 0) }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: INK_FAINT, fontStyle: 'italic' }}>different product category</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Perry — bottom */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: 24, padding: '22px 26px', background: WHITE, border: `1.5px solid ${ACCENT_BD}`, borderRadius: R_PANEL, boxShadow: '0 1px 2px rgba(28,27,24,.05), 0 16px 40px rgba(0,156,127,.1)', ...fx(localTime, 0.5, 0.6, 18) }}>
          <div style={{ flex: 1.15, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <PerryLogo height={20} />
              <Chip tone="accent">Perry solves</Chip>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: INK, lineHeight: 1.28, letterSpacing: '-0.01em' }}>How can a fund's legal truth be maintained, reused, and governed over the long term?</div>
          </div>
          <div style={{ width: 1, background: ACCENT_BD, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'center' }}>
            {perryPoints.map((p, i) => (
              <span key={p} style={{ ...fx(localTime, 0.85 + i * 0.1, 0.4, 8), padding: '8px 13px', borderRadius: R_PILL, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BD}`, fontFamily: SANS, fontSize: 13, fontWeight: 500, color: INK }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      <BottomBar localTime={localTime} delay={2.0}>Task execution vs. a fund-level system of record.</BottomBar>
    </Scene>
  );
}

function EphemeralPanel({ localTime }) {
  const steps = [
    ['Project folder', 'LPA · side letter · amendment'],
    ['Large context window', 'Many docs in one session'],
    ['Complete one task', 'Extract · compare · draft'],
    ['Context disperses', 'No same truth next time'],
  ];
  return (
    <div style={{ padding: 20, background: CLAUDE_BG, border: `1px solid ${CLAUDE_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW_SM, height: '100%' }}>
      <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: CLAUDE_INK, marginBottom: 4 }}>Claude Cowork</div>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: INK_FAINT, marginBottom: 16 }}>one task · one context window</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={s[0]} style={{ ...fx(localTime, 0.5 + i * 0.18, 0.45, 10), padding: '12px 14px', background: WHITE, border: `1px solid ${i === 3 ? AMBER_BD : CLAUDE_BD}`, borderRadius: R_CTRL }}>
            <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: i === 3 ? AMBER : CLAUDE_INK }}>{s[0]}</div>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: INK_SOFT, marginTop: 3 }}>{s[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphPanel({ localTime }) {
  const nodes = ['Fund', 'LP / Investor', 'Document', 'Clause', 'Right', 'Obligation', 'Consent', 'Timeline'];
  const features = [
    'Updates existing nodes when amendments arrive',
    'Same investor merged across LPA, side letter & amendment',
    'Obligation status tracked: triggered, fulfilled, waived',
    'Return to the same canonical source six years later',
  ];
  return (
    <div style={{ padding: 20, background: WHITE, border: `1.5px solid ${ACCENT_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <PerryLogo height={18} />
        <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: INK }}>Perry</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: INK_FAINT, marginBottom: 14 }}>persistent record around the Fund entity</div>
      <div style={{ position: 'relative', flex: 1, minHeight: 200, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CARD, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...fx(localTime, 0.7, 0.5, 0), padding: '9px 14px', borderRadius: R_BOX, background: ACCENT, color: WHITE, fontFamily: SANS, fontSize: 13, fontWeight: 700 }}>Fund</div>
        </div>
        {nodes.slice(1).map((n, i) => {
          const ang = (-90 + i * (360 / (nodes.length - 1))) * Math.PI / 180;
          const cx = 50 + Math.cos(ang) * 38;
          const cy = 50 + Math.sin(ang) * 32;
          const p = grow(localTime, 0.85 + i * 0.1, 0.45);
          return (
            <React.Fragment key={n}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <line x1="50%" y1="50%" x2={`${50 + (cx - 50) * p}%`} y2={`${50 + (cy - 50) * p}%`} stroke={ACCENT} strokeWidth="1.2" opacity="0.3" />
              </svg>
              <div style={{ position: 'absolute', left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)', opacity: p, padding: '5px 9px', borderRadius: R_MIN, background: WHITE, border: `1px solid ${ACCENT_BD}`, fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{n}</div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {features.map((f, i) => (
          <div key={f} style={{ ...fx(localTime, 1.4 + i * 0.12, 0.4, 8), display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Dot color={ACCENT} size={6} />
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: INK_SOFT, lineHeight: 1.35 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function S3_DocDifference() {
  const { localTime } = useSprite();
  const hi = HI_CLAUDE;
  return (
    <Scene>
      <Eyebrow n="01 · B" label="Context & Projects" />
      <div style={{ position: 'absolute', left: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: INK, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          If Claude has a <span style={hi}>large context window</span> and a <span style={hi}>Project folder</span>, where is the difference?
        </div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 8 }}>Not whether docs fit in context, but whether they become a continuously maintainable structured knowledge graph.</div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 188, display: 'flex', gap: 24, height: 420 }}>
        <div style={{ flex: 1, ...fx(localTime, 0.3, 0.6, 16) }}><EphemeralPanel localTime={localTime} /></div>
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 80 }}><FlowArrow length={64} localTime={localTime} delay={1.0} /></div>
        <div style={{ flex: 1.15, ...fx(localTime, 0.45, 0.6, 16) }}><GraphPanel localTime={localTime} /></div>
      </div>
      <BottomBar localTime={localTime} delay={2.5}>
        A <span style={HI_CLAUDE}>large context window</span> <span style={HI_INK}>≠</span> maintaining a canonical fund schema.
      </BottomBar>
    </Scene>
  );
}

function WorkflowStepCard({ n, title, subtitle, children, localTime, delay, highlight }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', ...fx(localTime, delay, 0.55, 14) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ width: 28, height: 28, borderRadius: R_DOT, background: highlight ? ACCENT : MUTED, color: highlight ? WHITE : INK_FAINT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{n}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: INK }}>{title}</div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: INK_SOFT, marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 16, background: highlight ? WHITE : WHITE, border: `1px solid ${highlight ? ACCENT_BD : BORDER}`, borderRadius: R_PANEL, boxShadow: highlight ? SHADOW_SM : 'none' }}>
        {children}
      </div>
    </div>
  );
}

function IntakePanel({ localTime }) {
  const docs = [
    ['Fund LPA', 'PDF · 214 pp'],
    ['Side letters', '9 documents'],
    ['Amendment 02', 'PDF · 6 pp'],
    ['Board consents', '3 documents'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      {docs.map((d, i) => (
        <div key={d[0]} style={{ ...fx(localTime, 0.35 + i * 0.1, 0.4, 8), display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CTRL }}>
          <DocIcon w={13} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK }}>{d[0]}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: INK_FAINT, marginTop: 2 }}>{d[1]}</div>
          </div>
        </div>
      ))}
      <div style={{ ...fx(localTime, 0.85, 0.45, 8), marginTop: 'auto', padding: '9px 11px', background: AMBER_SOFT, border: `1px solid ${AMBER_BD}`, borderRadius: R_CTRL, fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: INK, lineHeight: 1.35 }}>
        New files merge into the existing fund record, not a new chat.
      </div>
    </div>
  );
}

function DecomposePanel({ localTime }) {
  const tasks = [
    ['Extract clauses & definitions', 'LPA · side letters · amendments'],
    ['Resolve investors & entities', 'Same LP across multiple documents'],
    ['Identify rights & obligations', 'Triggers · deadlines · owners'],
    ['Link consents & exceptions', 'MFN · LPAC · side letter carve-outs'],
    ['Reconcile across versions', 'Amendment updates existing nodes'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, ...fx(localTime, 0.3, 0.4, 6) }}>
        <PerryLogo height={16} />
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: ACCENT }}>Perry decomposes fund information</span>
      </div>
      {tasks.map((t, i) => {
        const done = grow(localTime, 0.5 + i * 0.14, 0.35) > 0.88;
        return (
          <div key={t[0]} style={{ ...fx(localTime, 0.45 + i * 0.1, 0.35, 6), display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 10px', background: done ? ACCENT_SOFT : WHITE, border: `1px solid ${done ? ACCENT_BD : BORDER}`, borderRadius: R_CTRL }}>
            <span style={{ width: 16, height: 16, borderRadius: R_DOT, background: done ? ACCENT : MUTED, border: `1px solid ${done ? ACCENT : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {done && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4.5" stroke={WHITE} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: INK, lineHeight: 1.3 }}>{t[0]}</div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: INK_FAINT, marginTop: 2, lineHeight: 1.3 }}>{t[1]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StructuredRecordPanel({ localTime }) {
  const objects = [
    ['Fund entity', 'Acme Ltd · canonical record', true],
    ['Investors', '12 LPs merged across documents', false],
    ['Rights', '17 source-linked investor rights', false],
    ['Obligations', '9 active · status tracked', true],
    ['Timeline', 'Closes · amendments · consents', false],
  ];
  const relations = ['Fund ↔ LP', 'LP ↔ Side letter', 'Clause ↔ Obligation', 'Document ↔ Source'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <div style={{ ...fx(localTime, 0.55, 0.45, 8), padding: '10px 12px', background: ACCENT, borderRadius: R_CTRL, textAlign: 'center' }}>
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: WHITE }}>Structured fund schema</div>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>governed · auditable · reusable</div>
      </div>
      {objects.map((o, i) => (
        <div key={o[0]} style={{ ...fx(localTime, 0.65 + i * 0.08, 0.35, 6), display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: WHITE, border: `1px solid ${o[2] ? ACCENT_BD : BORDER}`, borderRadius: R_CTRL }}>
          <Dot color={o[2] ? ACCENT : INK_FAINT} size={6} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{o[0]}</div>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: INK, marginTop: 1 }}>{o[1]}</div>
          </div>
          {o[2] && <SourceRef style={{ fontSize: 9 }}>linked</SourceRef>}
        </div>
      ))}
      <div style={{ ...fx(localTime, 1.1, 0.4, 6), display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
        {relations.map((r) => (
          <span key={r} style={{ padding: '4px 8px', borderRadius: R_PILL, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BD}`, fontFamily: MONO, fontSize: 9.5, color: ACCENT }}>{r}</span>
        ))}
      </div>
    </div>
  );
}

function S4_KnowledgeGraph() {
  const { localTime } = useSprite();
  const hi = HI_CLAUDE;
  return (
    <Scene>
      <Eyebrow n="01 · C" label="System of Record" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: INK, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          A <span style={hi}>large context window</span> and <span style={hi}>Project folder</span> ≠ a canonical fund schema.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 8 }}>Perry intakes documents, decomposes fund information, and structures it into a governed knowledge graph.</div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, top: 178, bottom: 44, display: 'flex', alignItems: 'stretch', gap: 0, ...fx(localTime, 0.25, 0.55, 14) }}>
        <WorkflowStepCard n="1" title="Intake documents" subtitle="LPA · side letters · amendments · consents" localTime={localTime} delay={0.35}>
          <IntakePanel localTime={localTime} />
        </WorkflowStepCard>

        <div style={{ display: 'flex', alignItems: 'center', padding: '40px 8px 0', flexShrink: 0 }}>
          <FlowArrow length={52} localTime={localTime} delay={0.7} />
        </div>

        <WorkflowStepCard n="2" title="Decompose fund information" subtitle="Extract · resolve · link · reconcile" localTime={localTime} delay={0.5} highlight>
          <DecomposePanel localTime={localTime} />
        </WorkflowStepCard>

        <div style={{ display: 'flex', alignItems: 'center', padding: '40px 8px 0', flexShrink: 0 }}>
          <FlowArrow length={52} localTime={localTime} delay={1.0} color={ACCENT} />
        </div>

        <WorkflowStepCard n="3" title="Structured fund record" subtitle="Canonical schema · source-linked · persistent" localTime={localTime} delay={0.65} highlight>
          <StructuredRecordPanel localTime={localTime} />
        </WorkflowStepCard>
      </div>
    </Scene>
  );
}

function S4_SchemaClose() {
  const { localTime } = useSprite();
  return (
    <Scene fadeIn={0.5} fadeOut={0.45}>
      <Eyebrow n="01 · C" label="System of Record" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 96px' }}>
        <div style={{ textAlign: 'center', maxWidth: 920 }}>
          <div style={{ ...fx(localTime, 0.3, 0.7, 18), fontFamily: SERIF, fontSize: 50, fontWeight: 600, color: INK, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
            Documents in, structured fund schema out.
          </div>
          <div style={{ ...fx(localTime, 0.65, 0.65, 12), marginTop: 22, fontFamily: SANS, fontSize: 24, fontWeight: 500, color: INK_SOFT, lineHeight: 1.35 }}>
            Not a longer chat history.
          </div>
        </div>
      </div>
    </Scene>
  );
}

function IllustrationFrame({ children, localTime, delay = 0 }) {
  return (
    <div style={{ margin: '18px 28px 28px', flex: 1, minHeight: 300, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CARD, overflow: 'hidden', position: 'relative', ...fx(localTime, delay, 0.45, 10) }}>
      {children}
    </div>
  );
}

function SourceLinkedVisual({ localTime }) {
  const floatP = grow(localTime, 0.55, 0.65);
  const hiP = grow(localTime, 0.85, 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 28 }}>
      {/* base — legal review result */}
      <div style={{ ...fx(localTime, 0.2, 0.5, 12), height: '100%', padding: '22px 24px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CARD, boxShadow: SHADOW_SM, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Legal review result</div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: INK_SOFT, marginTop: 4 }}>Fund record · Acme Ltd</div>
          </div>
          <Chip tone="green" style={{ fontSize: 10.5, padding: '4px 9px' }}>Verified</Chip>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: INK, letterSpacing: '-0.02em', marginBottom: 12 }}>Investor rights · <span style={HI_ACCENT}>17</span></div>
        <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: INK_SOFT, lineHeight: 1.55, maxWidth: 380 }}>"LPs holding more than 15% may request quarterly reporting and board observer rights."</div>
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: INK, marginTop: 4 }}>LPA.pdf · §8.4</div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basis</div>
              <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: INK_SOFT, marginTop: 4 }}>Clause-linked · not model memory</div>
            </div>
          </div>
        </div>
      </div>

      {/* hovering quote card */}
      <div style={{ position: 'absolute', right: 20, bottom: 20, width: '62%', opacity: floatP, transform: `translateY(${(1 - floatP) * 18}px)`, zIndex: 2, ...fx(localTime, 0.5, 0.55, 0) }}>
        <div style={{ padding: '16px 18px', background: WHITE, border: `1.5px solid ${ACCENT_BD}`, borderRadius: R_CARD, boxShadow: '0 8px 32px rgba(28,27,24,.12), 0 2px 8px rgba(0,156,127,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <DocIcon w={13} color={ACCENT} />
            <SourceRef style={{ fontSize: 10.5 }}>LPA.pdf · Section 8.4</SourceRef>
          </div>
          <div style={{ position: 'relative', padding: '12px 14px', background: WHITE, borderRadius: R_MIN, border: `1px solid ${BORDER}` }}>
            <div style={{ position: 'absolute', left: 10, right: 10, top: 10, height: `${hiP * 55}%`, background: AMBER_SOFT, borderRadius: R_MIN, opacity: 0.9 }} />
            <div style={{ position: 'relative', fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: INK_SOFT, lineHeight: 1.55 }}>
              <span style={{ color: INK_FAINT }}>8.4 </span>
              <span style={HI_INK}>Major Investors</span>
              <span style={{ color: INK_FAINT }}>…holders of 15% or more shall receive quarterly reporting…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpertEvaluatedVisual({ localTime }) {
  const prompts = [
    'Extract all investor rights from the LPA and side letters. Link each right to its source clause.',
    'Does Amendment 02 trigger LPAC consent? Apply the fund\'s customized threshold rules.',
    'Validate MFN eligibility for Investor A against customized election logic.',
    'Flag any obligation missing a source link before it enters the fund record.',
    'Review extraction output: do caveats, exceptions, and consents appear in the answer?',
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* background — legal prompt texts */}
      <div style={{ position: 'absolute', inset: 0, padding: '24px 28px', overflow: 'hidden', ...fx(localTime, 0.15, 0.5, 8) }}>
        {prompts.map((p, i) => (
          <div
            key={i}
            style={{
              ...fx(localTime, 0.2 + i * 0.08, 0.4, 6),
              marginBottom: 14,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.55)',
              border: `1px solid ${BORDER}`,
              borderRadius: R_CTRL,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 400,
              color: INK_FAINT,
              lineHeight: 1.5,
              opacity: 0.45 + i * 0.04,
            }}
          >
            {p}
          </div>
        ))}
      </div>

      {/* foreground — legal engineer avatars */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, ...fx(localTime, 0.55, 0.6, 0) }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.92)', border: `1px solid ${BORDER}`, borderRadius: R_PILL, boxShadow: SHADOW }}>
          {['LE', 'LE', 'LE'].map((label, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                borderRadius: R_DOT,
                background: i === 1 ? ACCENT : WHITE,
                border: `2px solid ${i === 1 ? ACCENT : ACCENT_BD}`,
                marginLeft: i > 0 ? -10 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                color: i === 1 ? WHITE : ACCENT,
                boxShadow: SHADOW_SM,
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div style={{ ...fx(localTime, 0.85, 0.5, 8), marginTop: 14, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK, textAlign: 'center' }}>Legal engineers signed off</div>
      </div>
    </div>
  );
}

function TrustPillar({ title, body, children, localTime, delay, illustrationDelay = 0.2 }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW_SM, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...fx(localTime, delay, 0.55, 16) }}>
      <div style={{ padding: '22px 28px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: INK_SOFT, lineHeight: 1.5 }}>{body}</div>
      </div>
      <IllustrationFrame localTime={localTime} delay={delay + illustrationDelay}>
        {children}
      </IllustrationFrame>
    </div>
  );
}

function S5_GCTrust() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <Eyebrow n="01 · D" label="Why a GC Cares" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>A GC doesn't need a plausible answer.</div>
        <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: INK_SOFT, marginTop: 10, lineHeight: 1.45 }}>They need an answer that can be <span style={HI_INK}>explained, audited, reused, and held accountable.</span></div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, top: 188, bottom: 88, display: 'flex', gap: 36, alignItems: 'stretch' }}>
        <TrustPillar
          title="Source-linked answers"
          body="Every number and obligation links back to a specific source, not what the model remembers."
          localTime={localTime}
          delay={0.3}
        >
          <SourceLinkedVisual localTime={localTime} />
        </TrustPillar>
        <TrustPillar
          title="Legal engineer evaluated outputs"
          body="Customized rules and output quality are reviewed by people who understand fund legal work."
          localTime={localTime}
          delay={0.45}
        >
          <ExpertEvaluatedVisual localTime={localTime} />
        </TrustPillar>
      </div>

      <BottomBar localTime={localTime} delay={1.8}>
        <span style={HI_CLAUDE}>Claude</span> can generate a plausible answer. A GC needs <span style={HI_INK}>defensible, auditable, reusable legal truth.</span>
      </BottomBar>
    </Scene>
  );
}

function TeamTouchpointsGrid({ localTime }) {
  const teams = [
    { name: 'Deal team', question: 'Fund-level restrictions on investment, financing, or exit?', phase: 'Investment' },
    { name: 'Investor Relations', question: 'Side letter rights, disclosure & reporting obligations?', phase: 'Reporting' },
    { name: 'Finance / Ops', question: 'Legal preconditions for capital calls, distributions & consents?', phase: 'Fundraising' },
    { name: 'GC / Fund Counsel', question: 'Risk basis, approval path & audit trail?', phase: 'Portfolio' },
  ];
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW, padding: '28px 32px 32px', ...fx(localTime, 0.25, 0.55, 14) }}>
      <ColLabel>Legal touchpoints by team</ColLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {teams.map((t, i) => (
          <div key={t.name} style={{ ...fx(localTime, 0.4 + i * 0.12, 0.45, 12), padding: '22px 24px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CARD }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <Chip tone="accent" style={{ fontSize: 12, padding: '5px 11px' }}>{t.name}</Chip>
              <span style={{ fontFamily: MONO, fontSize: 11, color: INK_FAINT, whiteSpace: 'nowrap' }}>@ {t.phase}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.45 }}>{t.question}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function S6_CrossTeam() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <Eyebrow n="01 · E" label="Beyond Legal" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>Not just a tool for the legal team.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>Different people across the investment team all have legal touchpoints at critical moments.</div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 188, bottom: 88, display: 'flex', alignItems: 'center' }}>
        <TeamTouchpointsGrid localTime={localTime} />
      </div>
      <BottomBar localTime={localTime} delay={2.0}>
        <span style={HI_INK}>Claude</span> is a personal / task-level assistant. <span style={HI_ACCENT}>Perry</span> is a fund-level legal operating system.
      </BottomBar>
    </Scene>
  );
}

function DataFlywheel({ localTime }) {
  const steps = [
    { label: 'New transaction', sub: 'Documents · deal · amendment', angle: -90 },
    { label: 'Informed review', sub: 'Prior context applied', angle: 0 },
    { label: 'Capture outcomes', sub: 'Positions · consents · obligations', angle: 90 },
    { label: 'Record compounds', sub: 'Memory grows with each matter', angle: 180 },
  ];
  const S = 1000;
  const cx = S / 2;
  const cy = S / 2;
  const R = 372;
  const ring = 2 * Math.PI * R;
  const spin = (localTime * 0.12) % 1;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 28, padding: '20px 24px 20px 16px', ...fx(localTime, 0.25, 0.55, 14) }}>
      <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', height: '100%', width: 'auto', maxWidth: '100%', aspectRatio: '1', flexShrink: 0 }}>
          <svg viewBox={`0 0 ${S} ${S}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={BORDER} strokeWidth="3" strokeDasharray="14 14" opacity="0.7" />
            <circle
              cx={cx} cy={cy} r={R}
              fill="none" stroke={ACCENT} strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={`${ring * 0.22} ${ring * 0.78}`}
              strokeDashoffset={-ring * spin}
              opacity="0.55"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {steps.map((s, i) => {
              const a0 = (s.angle * Math.PI) / 180;
              const a1 = a0 + Math.PI / 2;
              const x1 = cx + Math.cos(a0) * (R - 22);
              const y1 = cy + Math.sin(a0) * (R - 22);
              const x2 = cx + Math.cos(a1) * (R - 22);
              const y2 = cy + Math.sin(a1) * (R - 22);
              const p = grow(localTime, 0.4 + i * 0.12, 0.5);
              return (
                <path
                  key={s.label}
                  d={`M ${x1} ${y1} A ${R - 22} ${R - 22} 0 0 1 ${x2} ${y2}`}
                  fill="none" stroke={ACCENT} strokeWidth="2.5" opacity={0.2 + p * 0.25}
                />
              );
            })}
          </svg>

          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 3 }}>
            <div style={{ ...fx(localTime, 0.45, 0.55, 10) }}>
              <div style={{ width: 152, padding: '16px 14px', background: ACCENT, borderRadius: R_PANEL, boxShadow: '0 8px 28px rgba(0,156,127,.25)', textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: R_DOT, background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 7px' }}>
                  <PerryLogo height={15} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: WHITE, lineHeight: 1.25 }}>Fund legal record</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.82)', marginTop: 3 }}>compounds each cycle</div>
              </div>
            </div>
          </div>

          {steps.map((s, i) => {
            const ang = (s.angle * Math.PI) / 180;
            const x = cx + Math.cos(ang) * R;
            const y = cy + Math.sin(ang) * R;
            return (
              <div
                key={s.label}
                style={{
                  position: 'absolute',
                  left: `${(x / S) * 100}%`,
                  top: `${(y / S) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '28%',
                  zIndex: 2,
                }}
              >
                <div style={{ ...fx(localTime, 0.5 + i * 0.12, 0.45, 10) }}>
                  <div style={{ padding: '11px 12px', background: WHITE, border: `1px solid ${ACCENT_BD}`, borderRadius: R_CARD, boxShadow: SHADOW_SM, textAlign: 'center' }}>
                    <div style={{ width: 22, height: 22, borderRadius: R_DOT, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ACCENT }}>{i + 1}</div>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.25 }}>{s.label}</div>
                    <div style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 500, color: INK_SOFT, marginTop: 3, lineHeight: 1.35 }}>{s.sub}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ width: 248, flexShrink: 0, alignSelf: 'center', ...fx(localTime, 0.7, 0.55, 12) }}>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>What the flywheel means</div>
        <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: INK, lineHeight: 1.35, letterSpacing: '-0.01em', marginBottom: 14 }}>
          Every matter adds back to the fund record, not a one-off answer lost in chat.
        </div>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: INK_SOFT, lineHeight: 1.5 }}>
          The next review starts with prior positions, consents, and restrictions already in context. Each cycle makes the record <span style={HI_ACCENT}>more reliable</span> than the last.
        </div>
      </div>
    </div>
  );
}

function S7_InstitutionalMemory() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <Eyebrow n="01 · F" label="Compounding Context" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>Each transaction makes the next decision better.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>Perry turns every review into data the fund can reuse: a flywheel, not a one-off answer.</div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 178, bottom: 44, ...fx(localTime, 0.2, 0.5, 10) }}>
        <DataFlywheel localTime={localTime} />
      </div>
    </Scene>
  );
}

function S8_Arg1Close() {
  const { localTime } = useSprite();
  return (
    <Scene fadeIn={0.6} fadeOut={0.5}>
      <Eyebrow n="01" label="Close" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 200, textAlign: 'center', ...fx(localTime, 0.2, 0.8, 20) }}>
        <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 600, color: INK, lineHeight: 1.12, letterSpacing: '-0.02em', maxWidth: 900, margin: '0 auto' }}>
          Claude helps you do legal work.
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 600, color: ACCENT, lineHeight: 1.12, letterSpacing: '-0.02em', maxWidth: 900, margin: '12px auto 0' }}>
          Perry helps you run legal work as a fund.
        </div>
        <div style={{ ...fx(localTime, 0.8, 0.7, 14), marginTop: 32, fontFamily: SANS, fontSize: 18, fontWeight: 500, color: INK_SOFT, lineHeight: 1.5, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          With a schema, source links, and context that survives every matter.
        </div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARGUMENT 2 — WHY THIS CANNOT BE EASILY BUILT WITH CLAUDE CODE
// ═══════════════════════════════════════════════════════════════════════════

function S9_Arg2Title() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 48px' }}>
        <div style={{ ...fx(localTime, 0.2, 0.7, 16), fontFamily: SANS, fontSize: 28, fontWeight: 500, color: INK_SOFT, lineHeight: 1.45, maxWidth: 880, textAlign: 'center' }}>
          Claude Code can quickly build the <span style={HI_CLAUDE}>first 20% demo</span>. Perry's value lies in the remaining <span style={HI_ACCENT}>80%</span> of platform engineering and legal domain accumulation.
        </div>
      </div>
    </Scene>
  );
}

function S10_Demo() {
  const { localTime } = useSprite();
  const demo = ['Upload an LPA', 'Extract clauses', 'Generate a report', 'Build a simple Q&A interface'];
  const product = ['Ingestion pipeline', 'Entity resolution', 'Schema evolution', 'Permission & audit', 'Regression testing'];
  const rowCount = Math.max(demo.length, product.length);
  const rowStyle = { minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 18px', borderTop: `1px solid ${BORDER}` };

  return (
    <Scene>
      <Eyebrow n="02 · A" label="Demo vs Product" />
      <div style={{ position: 'absolute', left: 96, right: 96, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK }}>They could build a demo in a few weeks.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>A demo solves "it looks like it works." A product solves "can a GC rely on it over the long term?"</div>
      </div>

      <div style={{ position: 'absolute', left: 96, right: 96, top: 168, bottom: 72, display: 'flex', flexDirection: 'column', justifyContent: 'center', ...fx(localTime, 0.2, 0.55, 14) }}>
        <div style={{ display: 'grid', gridTemplateColumns: '20% 1fr', borderRadius: R_PANEL, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: SHADOW_SM, flexShrink: 0 }}>
          <div style={{ background: CLAUDE_BG, borderRight: `1px solid ${CLAUDE_BD}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fx(localTime, 0.35, 0.45, 8) }}>
            <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: CLAUDE }}>~20%</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: CLAUDE_INK, marginTop: 2 }}>Weeks 1–3</span>
          </div>
          <div style={{ background: ACCENT_SOFT, padding: '12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...fx(localTime, 0.45, 0.45, 8) }}>
            <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: ACCENT }}>~80%</span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: INK, marginTop: 2 }}>Full-time product iteration</span>
          </div>

          <div style={{ background: CLAUDE_BG, borderRight: `1px solid ${CLAUDE_BD}`, borderTop: `1px solid ${BORDER}`, minHeight: 52, display: 'flex', alignItems: 'center', padding: '0 18px', ...fx(localTime, 0.35, 0.6, 16) }}>
            <Chip tone="claude">Reasonable demo</Chip>
          </div>
          <div style={{ background: WHITE, borderTop: `1px solid ${BORDER}`, minHeight: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', ...fx(localTime, 0.5, 0.6, 16) }}>
            <PerryLogo height={18} />
            <Chip tone="accent">Platform engineering gap</Chip>
          </div>

          {Array.from({ length: rowCount }, (_, i) => (
            <React.Fragment key={i}>
              <div style={{ ...rowStyle, background: CLAUDE_BG, borderRight: `1px solid ${CLAUDE_BD}`, borderTopColor: CLAUDE_BD, gap: 10 }}>
                {demo[i] && (
                  <>
                    <span style={{ width: 18, height: 18, borderRadius: R_DOT, background: WHITE, border: `1px solid ${GREEN_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN, fontWeight: 700, fontSize: 10, flexShrink: 0 }}>✓</span>
                    <span style={{ ...fx(localTime, 0.55 + i * 0.1, 0.4, 8), fontFamily: SANS, fontSize: 13, fontWeight: 500, color: CLAUDE_INK, lineHeight: 1.35 }}>{demo[i]}</span>
                  </>
                )}
              </div>
              <div style={{ ...rowStyle, background: WHITE, gap: 12 }}>
                {product[i] && (
                  <>
                    <span style={{ width: 6, height: 6, borderRadius: R_DOT, background: ACCENT, flexShrink: 0 }} />
                    <span style={{ ...fx(localTime, 0.65 + i * 0.08, 0.35, 6), fontFamily: SANS, fontSize: 13, fontWeight: 500, color: INK, lineHeight: 1.35 }}>{product[i]}</span>
                  </>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </Scene>
  );
}

function RagPromptsIllustration({ localTime }) {
  const docs = [
    { label: 'Fund LPA.pdf', top: '6%', left: '6%' },
    { label: 'Side letter', top: '24%', left: '48%' },
    { label: 'Amendment 02', top: '42%', left: '14%' },
    { label: 'Board consent', top: '58%', left: '44%' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 22 }}>
      <div style={{ ...fx(localTime, 0.25, 0.45, 8), padding: '10px 14px', background: WHITE, border: `1px solid ${CLAUDE_BD}`, borderRadius: R_PILL, display: 'flex', alignItems: 'center', gap: 10, boxShadow: SHADOW_SM }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="4.5" stroke={INK_FAINT} strokeWidth="1.4" />
          <path d="M10.5 10.5L14 14" stroke={INK_FAINT} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: INK_FAINT }}>Search fund documents…</span>
      </div>
      <div style={{ position: 'relative', marginTop: 16, height: 'calc(100% - 52px)' }}>
        {docs.map((d, i) => (
          <div key={d.label} style={{ ...fx(localTime, 0.35 + i * 0.1, 0.4, 8), position: 'absolute', top: d.top, left: d.left, padding: '8px 11px', background: WHITE, border: `1px solid ${i === 0 ? CLAUDE_BD : BORDER}`, borderRadius: R_CTRL, boxShadow: SHADOW_SM, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DocIcon w={11} color={CLAUDE} />
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{d.label}</span>
          </div>
        ))}
        <div style={{ ...fx(localTime, 0.8, 0.45, 10), position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 14px', background: WHITE, border: `1px dashed ${CLAUDE_BD}`, borderRadius: R_CARD }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: CLAUDE, fontWeight: 600 }}>Chunks retrieved · answer regenerated</div>
          <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: INK_SOFT, marginTop: 5, lineHeight: 1.45 }}>No governed schema · no persistent record</div>
        </div>
      </div>
    </div>
  );
}

function FundRecordIllustration({ localTime }) {
  const modules = [
    { label: 'Entities', x: 50, y: 20 },
    { label: 'Rights', x: 80, y: 38 },
    { label: 'Obligations', x: 80, y: 66 },
    { label: 'Consents', x: 50, y: 84 },
    { label: 'Timeline', x: 20, y: 66 },
    { label: 'Documents', x: 20, y: 38 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...fx(localTime, 0.45, 0.5, 0), padding: '10px 16px', borderRadius: R_BOX, background: ACCENT, color: WHITE, fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,156,127,.22)' }}>Acme Fund</div>
      </div>
      {modules.map((m, i) => {
        const p = grow(localTime, 0.55 + i * 0.08, 0.45);
        return (
          <React.Fragment key={m.label}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1="50%" y1="50%" x2={`${50 + (m.x - 50) * p}%`} y2={`${50 + (m.y - 50) * p}%`} stroke={ACCENT} strokeWidth="1.2" opacity="0.28" />
            </svg>
            <div style={{ position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)', opacity: p, padding: '5px 9px', borderRadius: R_MIN, background: WHITE, border: `1px solid ${ACCENT_BD}`, fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: INK, whiteSpace: 'nowrap', boxShadow: SHADOW_SM }}>{m.label}</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', ...fx(localTime, 0.95, 0.45, 8) }}>
        {['Entity', 'Right', 'Obligation', 'Consent', 'Timeline'].map((o) => (
          <span key={o} style={{ padding: '4px 9px', borderRadius: R_PILL, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BD}`, fontFamily: SANS, fontSize: 10, fontWeight: 600, color: INK }}>{o}</span>
        ))}
      </div>
    </div>
  );
}

function S11_NotRAG() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <Eyebrow n="02 · B" label="Not RAG + Prompts" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK }}>Fund legal work is not unstructured Q&A.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>It's an operating system with fixed objects and relationships. They don't emerge from "adding a legal skill."</div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, top: 188, bottom: 88, display: 'flex', gap: 36, alignItems: 'stretch' }}>
        <TrustPillar
          title="RAG + legal prompts"
          body="A search box over a document library. Answers assembled from retrieved chunks."
          localTime={localTime}
          delay={0.3}
        >
          <RagPromptsIllustration localTime={localTime} />
        </TrustPillar>
        <TrustPillar
          title="Fund legal operating system"
          body="Fixed objects and relationships in a governed record, source-linked and persistent."
          localTime={localTime}
          delay={0.45}
        >
          <FundRecordIllustration localTime={localTime} />
        </TrustPillar>
      </div>

      <BottomBar localTime={localTime} delay={2.0}>
        Perry's fund context comes from <span style={HI_ACCENT}>domain model + engineering + legal QA</span>, not prompt engineering.
      </BottomBar>
    </Scene>
  );
}

function S12_AccuracySystem() {
  const { localTime } = useSprite();
  const checks = [
    ['Source link on every answer', 'LPA §8.4 → obligation field'],
    ['Human / legal engineer review', 'Customized rules executed correctly'],
    ['Corrections written back', '66% → 75% persisted in record'],
    ['Judgment reused next time', 'Similar question inherits prior fix'],
  ];
  return (
    <Scene>
      <Eyebrow n="02 · C" label="Accuracy Is a System" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK }}>Accuracy can't be solved by switching to a stronger model.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>Perry needs every run to make the record more reliable, not regenerate from scratch.</div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, top: 168, bottom: 44, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* top — contrast */}
        <div style={{ ...fx(localTime, 0.25, 0.5, 10), padding: '16px 22px', background: CLAUDE_BG, border: `1px solid ${CLAUDE_BD}`, borderRadius: R_CARD, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Chip tone="claude" style={{ flexShrink: 0 }}>Claude Code projects</Chip>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_SOFT }}>
            Usually stop at <span style={HI_CLAUDE}>regenerate on every run</span>. No persistent improvement.
          </div>
        </div>

        {/* bottom — Perry wrapper with all reasonings */}
        <div style={{ flex: 1, padding: '18px 22px 20px', background: WHITE, border: `1.5px solid ${ACCENT_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', ...fx(localTime, 0.4, 0.55, 14) }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${ACCENT_BD}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PerryLogo height={20} />
              <div>
                <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Perry needs to achieve</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: INK, lineHeight: 1.25, marginTop: 4, letterSpacing: '-0.01em' }}>Every run makes the record more reliable.</div>
              </div>
            </div>
            <Chip tone="accent" style={{ flexShrink: 0 }}>System-level accuracy</Chip>
          </div>

          <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>How accuracy is built into the product</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, justifyContent: 'flex-start' }}>
            {checks.map((c, i) => {
              const done = grow(localTime, 0.55 + i * 0.14, 0.4) > 0.85;
              return (
                <div key={c[0]} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: done ? ACCENT_SOFT : WHITE, border: `1px solid ${done ? ACCENT_BD : BORDER}`, borderRadius: R_CARD, opacity: clamp((localTime - (0.5 + i * 0.1)) / 0.4, 0, 1) }}>
                  <span style={{ width: 22, height: 22, borderRadius: R_DOT, background: done ? ACCENT : WHITE, border: `1.5px solid ${done ? ACCENT : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done
                      ? <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4.5" stroke={WHITE} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: INK_FAINT }}>{i + 1}</span>}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: INK, lineHeight: 1.25 }}>{c[0]}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: INK_FAINT, marginTop: 2 }}>{c[1]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Scene>
  );
}

function S13_LegalEngineer() {
  const { localTime } = useSprite();
  const reviews = [
    'Whether customized rules reflect the fund\'s interests and risk preferences',
    'Whether the prompt expresses the legal issue, business objective, and fund context',
    'Whether the output misses key caveats, exceptions, consents, or dependencies',
    'Whether the review conclusion aligns with the fund\'s best interests',
    'Whether output quality reaches the standard required for legal review reliance',
  ];
  return (
    <Scene>
      <Eyebrow n="02 · D" label="Legal Engineer QA" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK }}>Legal engineer review is part of the product.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>Perry places model outputs inside a legal QA workflow, not just wrapping Claude in a UI.</div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 168, bottom: 44, display: 'flex', flexDirection: 'column', ...fx(localTime, 0.3, 0.6, 16) }}>
        <div style={{ padding: '18px 22px 16px', background: WHITE, border: `1.5px solid ${ACCENT_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
            <PerryLogo height={20} />
            <div>
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: INK }}>Legal engineers evaluate</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: INK_FAINT, marginTop: 2 }}>Rules · prompts · outputs</div>
            </div>
            <Chip tone="green" style={{ marginLeft: 'auto' }}>Approved</Chip>
          </div>
          {reviews.map((r, i) => {
            const done = grow(localTime, 0.7 + i * 0.18, 0.4) > 0.85;
            return (
              <div key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 0', borderBottom: i < reviews.length - 1 ? `1px solid ${BORDER}` : 'none', opacity: clamp((localTime - (0.55 + i * 0.12)) / 0.4, 0, 1) }}>
                <span style={{ width: 20, height: 20, borderRadius: R_DOT, background: done ? GREEN_SOFT : MUTED, border: `1px solid ${done ? GREEN_BD : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4.5" stroke={GREEN} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: INK, lineHeight: 1.4 }}>{r}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}

function S14_RealCost() {
  const { localTime } = useSprite();
  const maintains = [
    'Who evolves the fund schema when new document types and fields appear?',
    'Who triages the edge cases that only surface in live deals?',
    'Who reruns regression every time the model or pipeline changes?',
    'Who holds output quality to legal-review reliance standards?',
    'Who revalidates workflows after each model upgrade?',
    'Who maintains the exceptions the first demo never modeled?',
    'Who updates ingestion when fund documents change shape?',
    'Who keeps permissions, audit logs, and access controls current?',
  ];
  return (
    <Scene fadeIn={0.55} fadeOut={0.5}>
      <Eyebrow n="02 · E" label="The Real Cost" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK }}>The question isn't whether you can build it.</div>
        <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: INK_SOFT, marginTop: 8 }}>It's whether you are prepared to <span style={HI_ACCENT}>maintain it forever.</span></div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 188, bottom: 44, display: 'flex', flexDirection: 'column', ...fx(localTime, 0.35, 0.6, 16) }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {maintains.map((m, i) => (
            <div key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '11px 0', borderBottom: i < maintains.length - 1 ? `1px solid ${BORDER}` : 'none', opacity: clamp((localTime - (0.5 + i * 0.1)) / 0.4, 0, 1) }}>
              <span style={{ width: 22, height: 22, borderRadius: R_DOT, background: AMBER_SOFT, border: `1px solid ${AMBER_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: AMBER }}>?</span>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK, lineHeight: 1.45 }}>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

const END_BG  = '#F9F8F6';
const END_BTN = '#247B7B';

function S15_PerryEndCard() {
  const { localTime } = useSprite();
  const ruleW = 76 * grow(localTime, 0.22, 0.55);
  return (
    <Scene fadeIn={0.7} fadeOut={0}>
      <div style={{ position: 'absolute', inset: 0, background: END_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ ...fx(localTime, 0.1, 0.65, 10) }}>
            <PerryLogo height={40} />
          </div>
          <div style={{ width: ruleW, height: 1, background: '#D5D2CC', marginTop: 16 }} />
          <div style={{ ...fx(localTime, 0.28, 0.6, 8), marginTop: 24, fontFamily: SERIF, fontSize: 22, fontWeight: 400, fontStyle: 'italic', color: INK, letterSpacing: '-0.01em' }}>
            The Legal OS for Private Capital.
          </div>
          <a
            href="https://calendly.com/vaneesa-useperry/30min"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...fx(localTime, 0.42, 0.55, 8), marginTop: 50, padding: '13px 28px', borderRadius: 10, background: END_BTN, color: WHITE, fontFamily: SANS, fontSize: 15.5, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1, textDecoration: 'none' }}
          >
            Book a demo →
          </a>
          <div style={{ ...fx(localTime, 0.58, 0.5, 6), marginTop: 46, fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: INK, letterSpacing: '0.22em' }}>
            USEPERRY.COM
          </div>
        </div>
      </div>
    </Scene>
  );
}

function Explainer() {
  return (
    <Stage width={1280} height={720} duration={115} background={BG} persistKey="claude-perry-v2" loop={false}>
      <Sprite start={0}     end={6}>    <S1_Title /></Sprite>
      <Sprite start={5.7}   end={8.4}>  <QInterstitial ghost="?" kicker="The Question" lines={['Claude is already powerful.', 'So why isn\'t it enough?']} /></Sprite>
      <Sprite start={8.1}   end={15}>   <S2_Categories /></Sprite>
      <Sprite start={14.7}  end={17.2}> <QInterstitial ghost="01" kicker="Context Window" lines={[
        <>If Claude has a <span style={HI_CLAUDE}>large context window</span></>,
        <>and a <span style={HI_CLAUDE}>Project folder</span>, where's the difference?</>,
      ]} /></Sprite>
      <Sprite start={16.9}  end={24.5}> <S3_DocDifference /></Sprite>
      <Sprite start={24.2}  end={29.5}> <S4_KnowledgeGraph /></Sprite>
      <Sprite start={29.2}  end={33.2}> <S4_SchemaClose /></Sprite>
      <Sprite start={32.9}  end={35.5}> <QInterstitial ghost="?" kicker="For the GC" lines={['Why does this', 'matter to a GC?']} /></Sprite>
      <Sprite start={35.2}  end={42.5}> <S5_GCTrust /></Sprite>
      <Sprite start={42.2}  end={50}>   <S6_CrossTeam /></Sprite>
      <Sprite start={49.7}  end={57.5}> <S7_InstitutionalMemory /></Sprite>
      <Sprite start={57.2}  end={62}>   <S8_Arg1Close /></Sprite>

      <Sprite start={61.7}  end={64.4}> <QInterstitial ghost="02" kicker="Build vs Buy" lines={['Could our AI team build this', 'with Claude Code in weeks?']} /></Sprite>
      <Sprite start={64.1}  end={69}>   <S9_Arg2Title /></Sprite>
      <Sprite start={68.7}  end={76.5}> <S10_Demo /></Sprite>
      <Sprite start={76.2}  end={83}>   <S11_NotRAG /></Sprite>
      <Sprite start={82.7}  end={89.5}> <S12_AccuracySystem /></Sprite>
      <Sprite start={89.2}  end={97}>   <S13_LegalEngineer /></Sprite>
      <Sprite start={96.7}  end={105}>   <S14_RealCost /></Sprite>
      <Sprite start={104.5} end={115}>   <S15_PerryEndCard /></Sprite>
    </Stage>
  );
}

window.Explainer = Explainer;
