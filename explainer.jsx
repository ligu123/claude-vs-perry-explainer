// explainer.jsx — "Claude Cowork vs Perry" animated explainer.
// Reads timeline primitives from window (animations.jsx loaded first).
const { Stage, Sprite, useSprite, useTime, Easing, interpolate, animate, clamp } = window;

// ── Palette ──────────────────────────────────────────────────────────────────
const BG          = '#FBFAF8';
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
const BORDER      = '#E9E5DD';
const WHITE       = '#FFFFFF';

const CLAUDE      = '#D97757';
const CLAUDE_SOFT = '#F5EAE5';
const CLAUDE_BD   = '#E8C4B8';
const CLAUDE_BG   = '#FAF9F5';
const CLAUDE_INK  = '#141413';
const CLAUDE_MID  = '#B0AEA5';

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

// ── Reveal helpers ───────────────────────────────────────────────────────────
function fx(localTime, delay = 0, dur = 0.55, dist = 14) {
  const t = clamp((localTime - delay) / dur, 0, 1);
  const e = Easing.easeOutCubic(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function grow(localTime, delay = 0, dur = 0.6) {
  return Easing.easeOutCubic(clamp((localTime - delay) / dur, 0, 1));
}
function countUp(localTime, delay, dur, target) {
  const t = clamp((localTime - delay) / dur, 0, 1);
  return Math.round(target * Easing.easeOutCubic(t));
}

// ── Small building blocks ────────────────────────────────────────────────────
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
    neutral: { bg: '#F3F1EB', fg: INK_SOFT, bd: BORDER },
    accent:  { bg: ACCENT_SOFT, fg: ACCENT, bd: ACCENT_BD },
    green:   { bg: GREEN_SOFT, fg: GREEN, bd: GREEN_BD },
    amber:   { bg: AMBER_SOFT, fg: AMBER, bd: AMBER_BD },
    red:     { bg: RED_SOFT, fg: RED, bd: RED_BD },
    ink:     { bg: INK, fg: '#F6F4EF', bd: INK },
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
  return (
    <img
      src={PERRY_LOGO}
      alt=""
      style={{ height, width: 'auto', display: 'block', flexShrink: 0, ...style }}
    />
  );
}

function StatusPill({ label, tone }) {
  const map = { green: [GREEN_SOFT, GREEN, GREEN_BD], accent: [ACCENT_SOFT, ACCENT, ACCENT_BD], amber: [AMBER_SOFT, AMBER, AMBER_BD], red: [RED_SOFT, RED, RED_BD] };
  const [bg, fg, bd] = map[tone] || map.accent;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: R_PILL, background: bg, color: fg, border: `1px solid ${bd}`, fontSize: 12, fontWeight: 600, fontFamily: SANS, whiteSpace: 'nowrap' }}>
      <Dot color={fg} size={6} />{label}
    </span>
  );
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

function DocCard({ title, meta, w = 230, tone = ACCENT, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: w, padding: '13px 15px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CARD, boxShadow: SHADOW_SM, ...style }}>
      <div style={{ width: 34, height: 34, borderRadius: R_CTRL, background: ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <DocIcon color={tone} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {meta && <div style={{ fontFamily: MONO, fontSize: 11, color: INK_FAINT, marginTop: 3, letterSpacing: '0.01em' }}>{meta}</div>}
      </div>
    </div>
  );
}

// horizontal arrow with a flowing dot
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

// ── Scene wrapper (crossfade) ────────────────────────────────────────────────
function Scene({ children, fadeIn = 0.5, fadeOut = 0.5, drift = 0 }) {
  const { localTime, duration } = useSprite();
  const op = Math.min(clamp(localTime / fadeIn, 0, 1), clamp((duration - localTime) / fadeOut, 0, 1));
  const s = 1 + drift * (localTime / Math.max(duration, 0.01));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, transform: `scale(${s})`, transformOrigin: '50% 45%' }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL-SCREEN QUESTION INTERSTITIAL (dark)
// ═══════════════════════════════════════════════════════════════════════════
function QInterstitial({ kicker, lines, ghost }) {
  const { localTime } = useSprite();
  return (
    <Scene fadeIn={0.45} fadeOut={0.4} drift={0.02}>
      <div style={{ position: 'absolute', inset: 0, background: INK, overflow: 'hidden' }}>
        {/* ghost numeral */}
        <div style={{ position: 'absolute', right: -30, bottom: -120, fontFamily: SERIF, fontSize: 460, fontWeight: 700, color: 'rgba(255,255,255,0.035)', lineHeight: 1, ...fx(localTime, 0.1, 1.0, 0) }}>{ghost}</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 96px' }}>
          <div style={{ textAlign: 'center', maxWidth: 960 }}>
            <div style={{ ...fx(localTime, 0.1, 0.6, 10), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 26 }}>
              <span style={{ width: 26, height: 1.5, background: ACCENT }} />
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: ACCENT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{kicker}</span>
            </div>
            {lines.map((ln, i) => (
              <div key={i} style={{ ...fx(localTime, 0.3 + i * 0.16, 0.65, 20), fontFamily: SERIF, fontSize: 62, fontWeight: 600, color: '#F6F4EF', lineHeight: 1.08, letterSpacing: '-0.02em' }}>{ln}</div>
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — TITLE
// ═══════════════════════════════════════════════════════════════════════════
function S1_Title() {
  const { localTime } = useSprite();
  const ruleW = 340 * grow(localTime, 0.35, 0.9);
  return (
    <Scene>
      <Eyebrow n="00" label="A Buyer's Field Guide" />
      <div style={{ position: 'absolute', left: 64, top: 232, right: 64 }}>
        <div style={{ ...fx(localTime, 0.15, 0.7, 18), fontFamily: SERIF, fontSize: 78, fontWeight: 600, color: INK, lineHeight: 1.02, letterSpacing: '-0.02em' }}>
          Claude Cowork <span style={{ color: INK_FAINT, fontWeight: 400 }}>vs</span> Perry
        </div>
        <div style={{ height: 2, width: ruleW, background: ACCENT, margin: '28px 0 26px', borderRadius: 2 }} />
        <div style={{ ...fx(localTime, 0.6, 0.7, 14), fontFamily: SANS, fontSize: 27, fontWeight: 500, color: INK_SOFT, letterSpacing: '-0.01em' }}>
          AI Capability <span style={{ color: INK_FAINT }}>vs</span> a Legal Operating System
        </div>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 58, ...fx(localTime, 1.1, 0.7, 10) }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: INK_FAINT, letterSpacing: '0.02em' }}>Why the real question isn't which is smarter — it's what gets packaged.</span>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — CORE DISTINCTION
// ═══════════════════════════════════════════════════════════════════════════
function S2_Distinction() {
  const { localTime } = useSprite();
  const docs = ['Fund LPA', 'Side letter', 'Subscription agmt', 'Amendment 02', 'Review report'];
  const actions = ['Read', 'Extract', 'Compare', 'Flag risk', 'Report'];
  const nodes = ['Funds', 'Investors', 'Documents', 'Obligations', 'Approvals', 'Activity log'];

  return (
    <Scene>
      <Eyebrow n="01" label="The Core Distinction" />
      {/* LEFT — Claude */}
      <div style={{ position: 'absolute', left: 64, top: 108, width: 500, ...fx(localTime, 0.2, 0.6, 16) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: SANS, fontSize: 19, fontWeight: 700, color: INK }}>Claude Cowork</span>
          <Chip tone="accent" style={{ fontSize: 11.5, padding: '4px 9px' }}>+ Legal Skill</Chip>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT, marginBottom: 16 }}>a capable assistant · one matter at a time</div>
        <div style={{ padding: 18, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW }}>
          <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Workspace · you supply the documents</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map((d, i) => (
              <div key={d} style={{ ...fx(localTime, 0.5 + i * 0.12, 0.45, 10), display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: '#FCFBF9', border: `1px solid ${BORDER}`, borderRadius: R_CTRL }}>
                <DocIcon w={13} />
                <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: INK }}>{d}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
            {actions.map((a, i) => (
              <div key={a} style={fx(localTime, 1.2 + i * 0.1, 0.4, 8)}><Chip>{a}</Chip></div>
            ))}
          </div>
        </div>
        <div style={{ ...fx(localTime, 1.9, 0.6, 8), marginTop: 15, fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: INK }}>Strong at completing legal tasks.</div>
      </div>

      {/* Divider */}
      <div style={{ position: 'absolute', left: 636, top: 132, bottom: 150, width: 1, background: BORDER }} />
      <div style={{ position: 'absolute', left: 616, top: '48%', width: 40, height: 40, borderRadius: R_DOT, background: WHITE, border: `1px solid ${BORDER}`, boxShadow: SHADOW_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: INK_FAINT, ...fx(localTime, 0.9, 0.5, 0) }}>vs</div>

      {/* RIGHT — Perry */}
      <div style={{ position: 'absolute', left: 712, top: 108, width: 504, ...fx(localTime, 0.35, 0.6, 16) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <PerryLogo height={22} />
          <Chip tone="amber" style={{ fontSize: 11.5, padding: '4px 9px' }}>the real product</Chip>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT, marginBottom: 16 }}>a persistent legal operating system</div>
        <div style={{ position: 'relative', width: '100%', height: 306, background: WHITE, border: `1.5px solid ${ACCENT_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ ...fx(localTime, 0.6, 0.5, 0) }}>
              <div style={{ padding: '10px 16px', borderRadius: R_BOX, background: ACCENT, color: WHITE, fontFamily: SANS, fontSize: 14, fontWeight: 600, boxShadow: '0 6px 18px rgba(0,156,127,.28)' }}>Fund record</div>
            </div>
          </div>
          {nodes.map((nlab, i) => {
            const ang = (-90 + i * (360 / nodes.length)) * Math.PI / 180;
            const R = 116;
            const cx = 50 + Math.cos(ang) * (R / 5.04);
            const cy = 50 + Math.sin(ang) * (R * 0.82 / 3.06);
            const p = grow(localTime, 0.8 + i * 0.12, 0.5);
            return (
              <React.Fragment key={nlab}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <line x1="50%" y1="50%" x2={`${50 + (cx - 50) * p}%`} y2={`${50 + (cy - 50) * p}%`} stroke={ACCENT} strokeWidth="1.4" opacity="0.32" />
                </svg>
                <div style={{ position: 'absolute', left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)', opacity: p, padding: '6px 11px', borderRadius: R_CTRL, background: '#FCFBF9', border: `1px solid ${ACCENT_BD}`, fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: INK, whiteSpace: 'nowrap', boxShadow: SHADOW_SM }}>{nlab}</div>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ marginTop: 15 }}>
          <div style={{ ...fx(localTime, 2.0, 0.6, 8), fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: INK }}>Preserves &amp; operationalizes legal context over time.</div>
          <div style={{ ...fx(localTime, 2.35, 0.6, 8), marginTop: 8, fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: INK_SOFT, lineHeight: 1.4 }}>We support a range of large language models — not just Claude.</div>
        </div>
      </div>

      {/* Bottom takeaway */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', ...fx(localTime, 2.6, 0.7, 12) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 26px', background: INK, borderRadius: R_PILL, boxShadow: SHADOW }}>
          <span style={{ fontFamily: SANS, fontSize: 16.5, fontWeight: 600, color: 'rgba(246,244,239,0.65)' }}>Task execution</span>
          <span style={{ fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: ACCENT }}>vs</span>
          <span style={{ fontFamily: SANS, fontSize: 16.5, fontWeight: 700, color: '#F6F4EF' }}>a persistent system</span>
        </div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — WHAT CLAUDE ALREADY DOES
// ═══════════════════════════════════════════════════════════════════════════
function S3_ClaudeDoes() {
  const { localTime } = useSprite();
  const inDocs = [['Fund LPA', 'PDF · 214 pp'], ['Amendment 02', 'PDF · 6 pp'], ['Side letter', 'PDF · 9 pp'], ['Board consent', 'PDF · 2 pp']];
  const acts = ['Extract clauses', 'Identify risks', 'Compare versions', 'Summarize obligations'];
  const outs = [['Word report', 'green'], ['Excel tracker', 'green'], ['Risk summary', 'amber'], ['Redline', 'accent']];

  return (
    <Scene>
      <Eyebrow n="02" label="What Claude Already Does" />
      <div style={{ position: 'absolute', left: 64, top: 100, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>Documents in, legal work out.</div>
      </div>

      <div style={{ position: 'absolute', left: 64, top: 190, display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{ width: 268 }}>
          <ColLabel>Source documents</ColLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inDocs.map((d, i) => (
              <div key={d[0]} style={fx(localTime, 0.4 + i * 0.13, 0.45, 12)}>
                <DocCard title={d[0]} meta={d[1]} w={268} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 6px' }}><FlowArrow length={78} localTime={localTime} delay={1.0} color={CLAUDE} /></div>

        <div style={{ width: 232, ...fx(localTime, 1.1, 0.5, 12) }}>
          <ColLabel>Claude</ColLabel>
          <div style={{ padding: 18, background: CLAUDE_BG, border: `1px solid ${CLAUDE_BD}`, borderRadius: R_PANEL, boxShadow: SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: R_CTRL, background: CLAUDE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.7 4.4 4.8.3-3.7 3 1.2 4.6L8 11.4 3.9 13.8l1.2-4.6-3.7-3 4.8-.3L8 1.5z" fill={WHITE}/></svg>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: CLAUDE_INK }}>Legal Skill</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {acts.map((a, i) => {
                const done = grow(localTime, 1.5 + i * 0.22, 0.4) > 0.9;
                return (
                  <div key={a} style={{ ...fx(localTime, 1.4 + i * 0.15, 0.4, 8), display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: WHITE, borderRadius: R_CTRL, border: `1px solid ${CLAUDE_BD}` }}>
                    <span style={{ width: 15, height: 15, borderRadius: R_DOT, background: done ? CLAUDE : '#E8E6DC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4.5" stroke={WHITE} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: CLAUDE_INK }}>{a}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 6px' }}><FlowArrow length={78} localTime={localTime} delay={2.4} color={CLAUDE} /></div>

        <div style={{ width: 250, ...fx(localTime, 2.5, 0.5, 12) }}>
          <ColLabel>Legal output</ColLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {outs.map((o, i) => (
              <div key={o[0]} style={{ ...fx(localTime, 2.7 + i * 0.14, 0.45, 12), display: 'flex', alignItems: 'center', gap: 11, padding: '13px 15px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_CARD, boxShadow: SHADOW_SM }}>
                <span style={{ width: 30, height: 30, borderRadius: R_CTRL, background: o[1] === 'green' ? GREEN_SOFT : o[1] === 'amber' ? AMBER_SOFT : ACCENT_SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Dot color={o[1] === 'green' ? GREEN : o[1] === 'amber' ? AMBER : ACCENT} size={9} />
                </span>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: INK }}>{o[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 44, ...fx(localTime, 3.4, 0.7, 10), display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 26, height: 26, borderRadius: R_DOT, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: SERIF, fontSize: 15, color: ACCENT, fontWeight: 700 }}>i</span>
        <span style={{ fontFamily: SANS, fontSize: 16, color: INK_SOFT, fontWeight: 500 }}>Many advanced legal tasks can already be performed <span style={{ color: INK, fontWeight: 600 }}>without a dedicated vertical platform.</span></span>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4a — WHAT PERRY MAY ADD (Acme Ltd entity)
// ═══════════════════════════════════════════════════════════════════════════
function S4_PerryAdds() {
  const { localTime } = useSprite();
  const tabs = ['Overview', 'Documents', 'Rights', 'Obligations', 'Timeline', 'Sources'];
  const metrics = [['Related documents', 84], ['Stakeholders', 12], ['Financing rounds', 4], ['Investor rights', 17], ['Active obligations', 9]];
  const timeline = [['2024 Q1', 'First close', GREEN], ['2024 Q3', 'Amendment 01', ACCENT], ['2024 Q4', 'Investor admission', GREEN], ['2025 Q1', 'Board consent', ACCENT], ['2025 Q2', 'Amendment 02 · in review', AMBER]];
  const sources = ['LPA.pdf · Section 8.4', 'Side Letter – Investor A · Clause 12', 'Amendment 02 · Page 6', 'Board Consent · 14 Mar 2025'];

  return (
    <Scene>
      <Eyebrow n="03 · A" label="Perry — Long-Term Fund Data" />
      <div style={{ position: 'absolute', left: 64, top: 96, display: 'flex', alignItems: 'baseline', gap: 14, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK }}>Data stored around an entity —</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT }}>
          not left inside disconnected documents.{' '}
          <span style={{ background: AMBER_SOFT, color: AMBER, fontWeight: 700, padding: '2px 8px', borderRadius: R_MIN, border: `1px solid ${AMBER_BD}`, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>and (messy context window)</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 64, top: 150, width: 760, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW, overflow: 'hidden', ...fx(localTime, 0.3, 0.6, 16) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '18px 22px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 46, height: 46, borderRadius: R_CARD, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: WHITE, flexShrink: 0 }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: INK }}>Acme Ltd</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: INK_FAINT, marginTop: 2 }}>Fund entity · time frame 2024 Q1 – 2025 Q2</div>
          </div>
          <Chip tone="green" style={{ fontSize: 12 }}><Dot color={GREEN} /> Live record</Chip>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '10px 18px', borderBottom: `1px solid ${BORDER}`, background: '#FCFBF9' }}>
          {tabs.map((t, i) => (
            <div key={t} style={{ ...fx(localTime, 0.7 + i * 0.06, 0.35, 6), padding: '7px 13px', borderRadius: R_CTRL, background: i === 0 ? ACCENT_SOFT : 'transparent', color: i === 0 ? ACCENT : INK_FAINT, fontFamily: SANS, fontSize: 13, fontWeight: i === 0 ? 600 : 500 }}>{t}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '20px 18px' }}>
          {metrics.map((m, i) => (
            <div key={m[0]} style={{ ...fx(localTime, 1.0 + i * 0.13, 0.5, 14), padding: '14px 14px', background: '#FCFBF9', border: `1px solid ${BORDER}`, borderRadius: R_CARD }}>
              <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: INK, lineHeight: 1 }}>{countUp(localTime, 1.0 + i * 0.13, 0.9, m[1])}</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: INK_SOFT, marginTop: 7, lineHeight: 1.25 }}>{m[0]}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '4px 18px 20px' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Timeline of changes</div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', left: 8, right: 8, top: 5, height: 2, background: BORDER }} />
            <div style={{ position: 'absolute', left: 8, top: 5, height: 2, background: ACCENT, width: `${grow(localTime, 1.9, 1.2) * 92}%`, opacity: 0.6 }} />
            {timeline.map((tl, i) => (
              <div key={i} style={{ ...fx(localTime, 2.0 + i * 0.16, 0.4, 8), position: 'relative', width: 130, textAlign: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: R_DOT, background: tl[2], border: `2px solid ${WHITE}`, margin: '0 auto 9px', boxShadow: `0 0 0 1px ${tl[2]}44` }} />
                <div style={{ fontFamily: MONO, fontSize: 11, color: INK_FAINT }}>{tl[0]}</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: INK, marginTop: 3, lineHeight: 1.2 }}>{tl[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 856, top: 150, width: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...fx(localTime, 1.4, 0.6, 16), padding: 18, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW_SM }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK, marginBottom: 4 }}>Every metric links to a source</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: INK_FAINT, marginBottom: 14 }}>Investor rights · 17 — traced to:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {sources.map((s, i) => (
              <div key={s} style={{ ...fx(localTime, 2.0 + i * 0.18, 0.45, 8), display: 'flex', alignItems: 'center', gap: 9 }}>
                <DocIcon w={13} />
                <SourceRef>{s}</SourceRef>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...fx(localTime, 3.2, 0.6, 16), padding: 18, background: INK, borderRadius: R_PANEL, boxShadow: SHADOW }}>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: '#F6F4EF', lineHeight: 1.4 }}>The context survives the matter.</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(246,244,239,0.6)', marginTop: 7, lineHeight: 1.45 }}>Close the task in Claude and the record is gone. Here it keeps accruing.</div>
        </div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4b — PERRY: ACTIVITY & GOVERNANCE TRACKING
// ═══════════════════════════════════════════════════════════════════════════
function S4b_Activity() {
  const { localTime } = useSprite();
  const rows = [
    ['First close', 'Legal Ops', '12 Feb 2024', 'Completed', 'green'],
    ['Subsequent close', 'Fund Counsel', '30 Sep 2024', 'Completed', 'green'],
    ['Investor admission', 'Legal Ops', 'Q4 2024', 'In progress', 'accent'],
    ['Board consent', 'General Counsel', '14 Mar 2025', 'Completed', 'green'],
    ['LPAC approval', 'External Counsel', 'Due 22 Jun', 'Pending', 'amber'],
    ['Amendment 02 execution', 'General Counsel', 'Due 10 Jun', 'Overdue', 'red'],
    ['Annual reporting', 'Investor Relations', 'Due 30 Jun', 'In progress', 'accent'],
  ];
  const feed = [
    ['Perry', 'ai', 'Clause extracted', 'LPA · §8.4', '2m'],
    ['Legal Ops', 'person', 'Entity match corrected', 'Acme Ltd', '6m'],
    ['Perry', 'ai', 'Obligation updated', '66% → 75%', '14m'],
    ['G. Counsel', 'person', 'Approval granted', 'Board consent', '1h'],
    ['System', 'system', 'Data exported', 'CSV + source links', '2h'],
  ];
  const avColor = { ai: ACCENT, person: INK, system: AMBER };
  const tableCols = '280px 176px 112px 136px';
  const headCell = { padding: '12px 18px', borderBottom: `1px solid ${BORDER}`, background: '#FCFBF9', display: 'flex', alignItems: 'center' };
  const bodyCell = { padding: '11px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center' };

  return (
    <Scene>
      <Eyebrow n="03 · B" label="Perry — Governance &amp; Activity" />
      <div style={{ position: 'absolute', left: 64, top: 96, display: 'flex', alignItems: 'baseline', gap: 14, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK }}>Closings, consents &amp; obligations —</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT }}>tracked continuously, with a full audit trail.</div>
      </div>

      <div style={{ position: 'absolute', left: 64, top: 150, width: 704, display: 'flex', flexDirection: 'column', gap: 12, ...fx(localTime, 0.3, 0.6, 16) }}>
        {/* Governance matter list */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: tableCols }}>
            {['Matter', 'Owner', 'Due', 'Status'].map((h, idx) => (
              <div key={h} style={{ ...headCell, fontFamily: SANS, fontSize: 11, fontWeight: 600, color: INK_FAINT, letterSpacing: '0.08em', textTransform: 'uppercase', justifyContent: idx === 3 ? 'flex-end' : 'flex-start' }}>{h}</div>
            ))}
            {rows.map((r, i) => (
              <React.Fragment key={r[0]}>
                <div style={{ ...bodyCell, ...(i < rows.length - 1 ? {} : { borderBottom: 'none' }) }}>
                  <div style={{ ...fx(localTime, 0.6 + i * 0.13, 0.4, 8), fontFamily: SANS, fontSize: 14, fontWeight: 600, color: INK }}>{r[0]}</div>
                </div>
                <div style={{ ...bodyCell, ...(i < rows.length - 1 ? {} : { borderBottom: 'none' }) }}>
                  <div style={{ ...fx(localTime, 0.6 + i * 0.13, 0.4, 8), fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: INK_SOFT }}>{r[1]}</div>
                </div>
                <div style={{ ...bodyCell, ...(i < rows.length - 1 ? {} : { borderBottom: 'none' }) }}>
                  <div style={{ ...fx(localTime, 0.6 + i * 0.13, 0.4, 8), fontFamily: MONO, fontSize: 11.5, color: r[4] === 'red' ? RED : INK_FAINT }}>{r[2]}</div>
                </div>
                <div style={{ ...bodyCell, justifyContent: 'flex-end', ...(i < rows.length - 1 ? {} : { borderBottom: 'none' }) }}>
                  <div style={fx(localTime, 0.6 + i * 0.13, 0.4, 8)}><StatusPill label={r[3]} tone={r[4]} /></div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dependency callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: AMBER_SOFT, border: `1px solid ${AMBER_BD}`, borderRadius: R_CARD }}>
          <div style={{ flexShrink: 0, ...fx(localTime, 1.9, 0.6, 0) }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect x="1" y="1" width="32" height="32" rx="9" fill={WHITE} stroke={AMBER_BD} />
              <path d="M11 12v6a2 2 0 002 2h9m0 0l-3-3m3 3l-3 3" stroke={AMBER} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={fx(localTime, 1.9, 0.6, 12)}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: AMBER, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Dependency</div>
            <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: INK, lineHeight: 1.35 }}>Amendment execution can't proceed until <span style={{ fontWeight: 700 }}>LPAC consent</span> reaches the required threshold.</div>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div style={{ position: 'absolute', left: 800, top: 150, width: 392, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: R_PANEL, boxShadow: SHADOW, overflow: 'hidden', ...fx(localTime, 0.5, 0.6, 16) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, background: '#FCFBF9' }}>
          <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: INK }}>Activity &amp; audit trail</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: 11, color: GREEN }}><Dot color={GREEN} size={6} /> live</span>
        </div>
        <div style={{ padding: '6px 0' }}>
          {feed.map((f, i) => (
            <div key={i} style={{ ...fx(localTime, 1.3 + i * 0.28, 0.45, 12), display: 'flex', gap: 12, padding: '13px 18px', borderBottom: i < feed.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: R_CTRL, background: f[1] === 'ai' ? ACCENT_SOFT : f[1] === 'system' ? AMBER_SOFT : '#F3F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: avColor[f[1]] }}>
                {f[1] === 'ai' ? '✳' : f[1] === 'system' ? '⚙' : f[0].slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK }}>{f[0]}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: INK_FAINT, flexShrink: 0 }}>{f[4]} ago</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: INK_SOFT, marginTop: 2 }}>{f[2]}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: '#8E8778', marginTop: 4 }}>{f[3]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4c — PERRY: LEGAL QUESTIONS ACROSS TEAMS INSIDE THE FUND
// ═══════════════════════════════════════════════════════════════════════════
function S4c_Unified() {
  const { localTime } = useSprite();
  const teams = [
    ['Legal Ops', 'What documents are needed for investor admission?'],
    ['Fund Counsel', 'Does this amendment trigger LPAC consent?'],
    ['Investor Relations', 'What quarterly reporting obligations are due?'],
    ['General Counsel', 'Which investor rights changed after Amendment 02?'],
    ['Tax & Compliance', 'Are we aligned with regulatory filing deadlines?'],
  ];

  return (
    <Scene>
      <Eyebrow n="03 · C" label="Perry — Legal Work Across Teams" />
      <div style={{ position: 'absolute', left: 64, top: 96, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>Different teams, different legal questions.</div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: INK_FAINT, marginTop: 6 }}>All routed through one fund record.</div>
      </div>

      {/* Unified panel — team questions + fund record rail */}
      <div style={{ position: 'absolute', left: 64, top: 168, width: 1152, display: 'flex', borderRadius: R_PANEL, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: SHADOW, ...fx(localTime, 0.25, 0.65, 16) }}>
        {/* Team questions */}
        <div style={{ flex: 1, background: WHITE, minWidth: 0 }}>
          <div style={{ padding: '18px 28px 14px', borderBottom: `1px solid ${BORDER}`, background: '#FCFBF9' }}>
            <ColLabel>Teams inside the fund</ColLabel>
          </div>
          {teams.map((tp, i) => (
            <div
              key={tp[0]}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '0 28px',
                minHeight: 72,
                background: i % 2 === 0 ? WHITE : '#FCFBF9',
                borderBottom: i < teams.length - 1 ? `1px solid ${BORDER}` : 'none',
              }}
            >
              <div style={{ width: 152, flexShrink: 0, ...fx(localTime, 0.45 + i * 0.1, 0.45, 10) }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 12px', borderRadius: R_PILL, background: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BD}`, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{tp[0]}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0, ...fx(localTime, 0.55 + i * 0.1, 0.45, 10) }}>
                <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: INK, lineHeight: 1.4 }}>{tp[1]}</div>
              </div>
              <div style={{ width: 108, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <FlowArrow length={96} localTime={localTime} delay={0.9 + i * 0.1} />
              </div>
            </div>
          ))}
        </div>

        {/* Fund record rail */}
        <div style={{ width: 236, flexShrink: 0, background: ACCENT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ ...fx(localTime, 0.85, 0.65, 0), position: 'relative', textAlign: 'center' }}>
            <PerryLogo height={36} style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: WHITE, letterSpacing: '-0.01em' }}>Acme Ltd</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 6, letterSpacing: '0.04em' }}>one fund record</div>
            <div style={{ marginTop: 22, padding: '10px 14px', borderRadius: R_BOX, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.95)', lineHeight: 1.45 }}>5 teams</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 1.4 }}>One shared legal context</div>
            </div>
          </div>
          {(() => {
            const pr = (localTime * 0.45) % 1;
            return <div style={{ position: 'absolute', inset: 16, borderRadius: R_BOX, border: '1.5px solid rgba(255,255,255,0.28)', opacity: (1 - pr) * 0.55, transform: `scale(${1 + pr * 0.06})`, pointerEvents: 'none' }} />;
          })()}
        </div>
      </div>

      {/* Bottom line */}
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 40, ...fx(localTime, 3.2, 0.7, 10), display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 26, height: 26, borderRadius: R_DOT, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 12 12"><path d="M2.5 6l2.2 2.2L9.5 3.5" stroke={WHITE} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <span style={{ fontFamily: SANS, fontSize: 16, color: INK_SOFT, fontWeight: 500 }}>Each team asks different questions — <span style={{ color: INK, fontWeight: 600 }}>one record keeps the answers connected.</span></span>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — WHEN CLAUDE IS ENOUGH vs WHEN PERRY IS MORE VALUABLE
// ═══════════════════════════════════════════════════════════════════════════
function DecisionCard({ title, tag, tagTone, items, localTime, delay, cardBorder, emphasized, logo }) {
  return (
    <div style={{ flex: emphasized ? 1.08 : 1, padding: 26, background: WHITE, border: `${emphasized ? 1.5 : 1}px solid ${cardBorder}`, borderRadius: R_PANEL, boxShadow: emphasized ? '0 1px 2px rgba(28,27,24,.05), 0 16px 40px rgba(0,156,127,.12)' : SHADOW, ...fx(localTime, delay, 0.6, 18) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {logo && <PerryLogo height={26} />}
          <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>{title}</div>
        </div>
        <Chip tone={tagTone}>{tag}</Chip>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {items.map((it, i) => (
          <div key={it} style={{ ...fx(localTime, delay + 0.4 + i * 0.13, 0.4, 8), display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: R_DOT, background: tagTone === 'accent' ? ACCENT : GREEN, marginTop: 8, flexShrink: 0 }} />
            <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: INK, lineHeight: 1.4 }}>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function S5_Decision() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <Eyebrow n="04" label="Which Tool Fits" />
      <div style={{ position: 'absolute', left: 64, top: 100, ...fx(localTime, 0.1, 0.6, 12) }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: INK }}>Not a better question — a fit question.</div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 176, display: 'flex', gap: 26, alignItems: 'flex-start' }}>
        <DecisionCard
          title="Claude is enough" tag="Task-based work" tagTone="green" cardBorder={BORDER}
          localTime={localTime} delay={0.3}
          items={['Small team', 'Limited document volume', 'Mainly one-off review', 'Word & Excel outputs suffice', 'You can supply the documents each task needs']}
        />
        <DecisionCard
          title="Is more valuable" tag="System-based work" tagTone="accent" cardBorder={ACCENT_BD} emphasized logo
          localTime={localTime} delay={0.55}
          items={['Many funds, companies & investors', 'Years of records must stay connected', 'Obligations tracked continuously', 'Multiple teams collaborate on one record', "New documents update records — and you don't want to build the schemas yourself"]}
        />
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 38, ...fx(localTime, 2.0, 0.7, 10), textAlign: 'center' }}>
        <span style={{ fontFamily: SANS, fontSize: 15, color: INK_SOFT, fontWeight: 500 }}>As funds, investors and records accumulate, work shifts from one-off tasks toward a persistent system — <span style={{ color: ACCENT, fontWeight: 700 }}>Perry's core bet.</span></span>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 7 — FINAL ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════
function LayerCard({ name, sub, verbs, tone, localTime, delay, logo }) {
  const tones = {
    claude: { bg: CLAUDE_BG, bd: CLAUDE_BD, title: CLAUDE_INK, sub: CLAUDE, pillBg: CLAUDE_SOFT, pillFg: CLAUDE, pillBd: CLAUDE_BD },
    light:  { bg: WHITE, bd: ACCENT_BD, title: INK, sub: ACCENT, pillBg: ACCENT_SOFT, pillFg: ACCENT, pillBd: ACCENT_BD },
  };
  const s = tones[tone] || tones.light;
  return (
    <div style={{ flex: 1, padding: 28, background: s.bg, border: `1px solid ${s.bd}`, borderRadius: R_PANEL, boxShadow: SHADOW, ...fx(localTime, delay, 0.6, 18) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        {logo ? <PerryLogo height={30} /> : <div style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: s.title }}>{name}</div>}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 12.5, color: s.sub, letterSpacing: '0.03em', marginTop: 6, marginBottom: 20 }}>{sub}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {verbs.map((v, i) => (
          <div key={v} style={fx(localTime, delay + 0.4 + i * 0.1, 0.4, 8)}>
            <span style={{ display: 'inline-block', padding: '8px 15px', borderRadius: R_PILL, fontFamily: SANS, fontSize: 15, fontWeight: 600, background: s.pillBg, color: s.pillFg, border: `1px solid ${s.pillBd}` }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function S7_Final() {
  const { localTime } = useSprite();
  return (
    <Scene>
      <Eyebrow n="05" label="Final Assessment" />
      <div style={{ position: 'absolute', left: 64, right: 64, top: 128, display: 'flex', gap: 26, alignItems: 'stretch' }}>
        <LayerCard name="Claude" sub="CAPABILITY LAYER" tone="claude" localTime={localTime} delay={0.2} verbs={['Reads', 'Reasons', 'Extracts', 'Drafts', 'Compares']} />
        <LayerCard name="Perry" sub="OPERATING-SYSTEM LAYER" tone="light" logo localTime={localTime} delay={0.5} verbs={['Stores', 'Connects', 'Tracks', 'Coordinates', 'Governs']} />
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 428, ...fx(localTime, 1.3, 0.8, 16) }}>
        <div style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: INK, lineHeight: 1.32, letterSpacing: '-0.01em', maxWidth: 1040 }}>
          Claude provides the capability. Perry <span style={{ color: ACCENT }}>packages that capability</span> into a legal system designed for long-term use.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 46, ...fx(localTime, 2.2, 0.8, 10), display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <span style={{ width: 22, height: 22, borderRadius: R_MIN, background: AMBER_SOFT, border: `1px solid ${AMBER_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: AMBER }}>!</span>
        <span style={{ fontFamily: SANS, fontSize: 14.5, color: INK_SOFT, fontWeight: 500, maxWidth: 980, lineHeight: 1.45 }}>That value still depends on whether Perry's persistent data, workflow, collaboration &amp; governance are real, mature, and hard to reproduce — worth verifying in the demo.</span>
      </div>
    </Scene>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
function Explainer() {
  return (
    <Stage width={1280} height={720} duration={100} background={BG} persistKey="claude-perry">
      <Sprite start={0}     end={4.8}>   <S1_Title /></Sprite>
      <Sprite start={4.5}   end={7.2}>   <QInterstitial ghost="?" kicker="The Question" lines={['Are Claude and Perry', 'even the same kind of thing?']} /></Sprite>
      <Sprite start={6.9}   end={18.9}>  <S2_Distinction /></Sprite>
      <Sprite start={18.6}  end={21.3}>  <QInterstitial ghost="02" kicker="Section 02" lines={['What can Claude', 'already do today?']} /></Sprite>
      <Sprite start={21}    end={33}>    <S3_ClaudeDoes /></Sprite>
      <Sprite start={32.7}  end={35.5}>  <QInterstitial ghost="03" kicker="Section 03" lines={['So what would', 'Perry actually add?']} /></Sprite>
      <Sprite start={35.2}  end={52.4}>  <S4_PerryAdds /></Sprite>
      <Sprite start={52.1}  end={66.4}>  <S4b_Activity /></Sprite>
      <Sprite start={66.1}  end={79.4}>  <S4c_Unified /></Sprite>
      <Sprite start={79.1}  end={81.8}>  <QInterstitial ghost="04" kicker="Section 04" lines={['Which one do', 'you actually need?']} /></Sprite>
      <Sprite start={81.5}  end={93.1}> <S5_Decision /></Sprite>
      <Sprite start={92.8}  end={100}>   <S7_Final /></Sprite>
    </Stage>
  );
}

window.Explainer = Explainer;
