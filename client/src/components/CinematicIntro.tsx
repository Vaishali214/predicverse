import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw, Volume2, VolumeX, Compass } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   PREDICVERSE — 10-Second Cinematic Logo Reveal
   FIX: All 5 scenes always mounted, visibility controlled by CSS
   opacity transitions only → zero flicker / flash between scenes.

   Scene 1 ·  0.0 – 2.0s  · Black void · Typewriter cities
   Scene 2 ·  2.0 – 4.0s  · Headline cards
   Scene 3 ·  4.0 – 6.5s  · World map images (crossfade)
   Scene 4 ·  6.5 – 8.5s  · Ink particles · Letterpress logo
   Scene 5 ·  8.5 – 10.0s · Final newspaper front page
───────────────────────────────────────────────────────────────── */

const TOTAL = 10.0;

const S1_END  = 2.0;
const S2_END  = 4.0;
const S3_END  = 6.5;
const S4_END  = 8.5;

const S1_TYPE_START = 0.3;
const S1_TYPE_END   = 1.8;

const S2_CARD_START = 2.1;
const S2_CARD_STEP  = 0.19;
const S2_CAPTION    = 3.7;

const S3_PIN_START  = 4.5;
const S3_PIN_END    = 6.4;

const S4_PARTICLE_START = 6.5;
const S4_LOGO_START = 6.75;
const S4_LOGO_END   = 8.1;

const S5_TAGLINE    = 9.1;
const S5_FADE_OUT   = 9.8;

const AUDIO_TRANSITIONS = [S1_END, S2_END, S3_END, S4_END];

interface CinematicIntroProps {
  onComplete?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Particle {
  id: number; x: number; y: number;
  tx: number; ty: number;
  size: number; delay: number; opacity: number;
}

const CITY_STRING = 'Kyoto  •  Tokyo  •  Delhi  •  London  •  Rome  •  Cairo  •  Paris  •  New York  •  Sydney  •  Rio de Janeiro  •  Cape Town  •  Istanbul';

const MAP_PINS = [
  { name: 'TOKYO',     x: 82, y: 33 },
  { name: 'DELHI',     x: 66, y: 42 },
  { name: 'LONDON',    x: 48, y: 24 },
  { name: 'PARIS',     x: 50, y: 27 },
  { name: 'ROME',      x: 52, y: 32 },
  { name: 'CAIRO',     x: 56, y: 40 },
  { name: 'NEW YORK',  x: 26, y: 30 },
  { name: 'SYDNEY',    x: 86, y: 78 },
  { name: 'RIO',       x: 35, y: 73 },
  { name: 'CAPE TOWN', x: 55, y: 80 },
  { name: 'ISTANBUL',  x: 58, y: 30 },
  { name: 'BANGKOK',   x: 74, y: 48 },
];

const PAGE_PREVIEWS = [
  { label: 'CULTURE DISCOVERY',    tag: 'BREAKING',      bg: '#F8F5EF', text: '#111111' },
  { label: 'HIDDEN CIVILIZATIONS', tag: 'FEATURE',       bg: '#111111', text: '#F8F5EF' },
  { label: 'STREET FOOD CAPITALS', tag: 'GASTRONOMY',    bg: '#F8F5EF', text: '#111111' },
  { label: 'ANCIENT TRADITIONS',   tag: 'HERITAGE',      bg: '#C1282D', text: '#F8F5EF' },
  { label: 'UNESCO HERITAGE',      tag: 'TRAVEL INTEL',  bg: '#F8F5EF', text: '#111111' },
  { label: 'EXPEDITIONS',          tag: 'DISPATCH',      bg: '#B8860B', text: '#F8F5EF' },
];

/* ── Smooth scene opacity helper ────────────────────────────────
   Each scene fades IN over 0.35s at its start and fades OUT 0.35s
   before its end. This creates smooth fast cross-dissolves. */
const sceneOpacity = (elapsed: number, start: number, end: number): number => {
  const FADE = 0.35;
  if (elapsed < start) return 0;
  if (elapsed < start + FADE) return (elapsed - start) / FADE;
  if (elapsed > end - FADE && elapsed < end) return (end - elapsed) / FADE;
  if (elapsed >= end) return 0;
  return 1;
};

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete, isOpen, onClose,
}) => {
  const [elapsed,        setElapsed       ] = useState(0);
  const [isPlaying,      setIsPlaying     ] = useState(true);
  const [soundOn,        setSoundOn       ] = useState(true);
  const [typedCities,    setTypedCities   ] = useState('');
  const [pinReveal,      setPinReveal     ] = useState(0);
  const [logoLetters,    setLogoLetters   ] = useState(0);
  const [particles,      setParticles     ] = useState<Particle[]>([]);
  const [taglineVisible, setTaglineVisible] = useState(false);

  const audioCtx    = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const firedAudio  = useRef<Set<number>>(new Set());

  const LOGO = 'PREDICVERSE';

  /* ── Compute current scene (for HUD only, NOT for conditional rendering) ── */
  const scene = elapsed < S1_END ? 1
              : elapsed < S2_END ? 2
              : elapsed < S3_END ? 3
              : elapsed < S4_END ? 4
              : 5;

  /* ── Audio ── */
  const beep = useCallback((
    freq: number, dur: number, vol = 0.12, type: OscillatorType = 'triangle',
  ) => {
    if (!soundOn) return;
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + dur);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch { /* ignore */ }
  }, [soundOn]);

  /* ── Particles seed ── */
  useEffect(() => {
    if (elapsed >= S4_PARTICLE_START && particles.length === 0) {
      setParticles(Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        tx: 44 + Math.random() * 12,
        ty: 38 + Math.random() * 12,
        size: 2 + Math.random() * 6,
        delay: Math.random() * 1.2,
        opacity: 0.35 + Math.random() * 0.65,
      })));
    }
  }, [elapsed, particles.length]);

  /* ── Master timer ── */
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    intervalRef.current = window.setInterval(() => {
      setElapsed(prev => {
        const next = +(prev + 0.05).toFixed(2);
        if (next >= TOTAL) {
          setIsPlaying(false);
          onComplete?.();
          return TOTAL;
        }
        return next;
      });
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, isPlaying, onComplete]);

  /* ── Typewriter ── */
  useEffect(() => {
    if (elapsed < S1_TYPE_START) { setTypedCities(''); return; }
    if (elapsed <= S1_TYPE_END) {
      const progress = (elapsed - S1_TYPE_START) / (S1_TYPE_END - S1_TYPE_START);
      const chars    = Math.floor(progress * CITY_STRING.length);
      const newStr   = CITY_STRING.substring(0, chars);
      if (newStr !== typedCities) {
        setTypedCities(newStr);
        if (chars % 4 === 0) beep(900 + Math.random() * 300, 0.016, 0.06, 'square');
      }
    }
  }, [elapsed]);

  /* ── Map pins ── */
  useEffect(() => {
    if (elapsed >= S3_PIN_START && elapsed < S3_PIN_END) {
      const idx = Math.floor(((elapsed - S3_PIN_START) / (S3_PIN_END - S3_PIN_START)) * MAP_PINS.length);
      if (idx > pinReveal) { setPinReveal(idx); beep(440, 0.06, 0.09); }
    }
  }, [elapsed, pinReveal]);

  /* ── Logo letterpress ── */
  useEffect(() => {
    if (elapsed >= S4_LOGO_START) {
      if (elapsed >= S4_LOGO_END) {
        if (logoLetters < LOGO.length) setLogoLetters(LOGO.length);
      } else {
        const progress = (elapsed - S4_LOGO_START) / (S4_LOGO_END - S4_LOGO_START);
        const idx = Math.min(LOGO.length, Math.floor(progress * (LOGO.length + 1)));
        if (idx > logoLetters) {
          setLogoLetters(idx);
          beep(180, 0.25, 0.22, 'sine');
        }
      }
    }
  }, [elapsed, logoLetters]);

  /* ── Tagline chime ── */
  useEffect(() => {
    if (elapsed >= S5_TAGLINE && !taglineVisible) {
      setTaglineVisible(true);
      beep(523.25, 1.1, 0.1, 'sine');
    }
  }, [elapsed, taglineVisible]);

  /* ── Transition audio ── */
  useEffect(() => {
    const t = +elapsed.toFixed(1);
    AUDIO_TRANSITIONS.forEach(b => {
      if (t === b && !firedAudio.current.has(b)) {
        firedAudio.current.add(b);
        beep(b === S1_END ? 150 : b === S2_END ? 200 : b === S3_END ? 120 : 320, 0.35, 0.2, 'sine');
      }
    });
  }, [+elapsed.toFixed(1)]);

  /* ── Reset ── */
  const handleReset = () => {
    setElapsed(0); setTypedCities(''); setPinReveal(0);
    setLogoLetters(0); setParticles([]); setTaglineVisible(false);
    firedAudio.current.clear(); setIsPlaying(true);
  };

  if (!isOpen) return null;

  /* Scene opacities — all computed here, all scenes always in DOM */
  const op1 = sceneOpacity(elapsed, 0,      S1_END);
  const op2 = sceneOpacity(elapsed, S1_END,  S2_END);
  const op3 = sceneOpacity(elapsed, S2_END,  S3_END);
  const op4 = sceneOpacity(elapsed, S3_END,  S4_END);
  const op5 = elapsed >= S5_FADE_OUT
    ? Math.max(0, 1 - (elapsed - S5_FADE_OUT) / (TOTAL - S5_FADE_OUT))
    : sceneOpacity(elapsed, S4_END, TOTAL + 2); // never fades out naturally

  /* Shared transition string */
  const TR = 'opacity 0.35s ease';

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden select-none"
      style={{ fontFamily: "'Playfair Display','Times New Roman',serif", background: '#0a0a0a' }}
    >

      {/* ── Film grain overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[9999] opacity-[0.038]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '220px 220px',
        }}
      />

      {/* ── HUD Controls ── */}
      <div className="absolute top-3 left-3 right-3 z-[10001] flex items-center justify-between pointer-events-auto">
        <div
          className="flex items-center gap-2 bg-black/90 px-3 py-1.5 border border-[#444]"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}
        >
          <span className="w-2 h-2 rounded-full bg-[#C1282D] animate-pulse" />
          <span style={{ color: '#B8860B', fontWeight: 700 }}>PREDICVERSE</span>
          <span style={{ color: '#444' }}>|</span>
          <span style={{ color: '#ccc' }}>CINEMATIC INTRO</span>
          <span style={{ color: '#444' }}>|</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{elapsed.toFixed(1)}s / {TOTAL.toFixed(1)}s</span>
          <span style={{ color: '#444' }}>|</span>
          <span style={{ color: '#B8860B', fontWeight: 700 }}>SCENE {scene}/5</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundOn(s => !s)}
            style={{ padding: '6px 8px', border: '1px solid #444', background: '#111', color: '#fff', cursor: 'pointer' }}>
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button onClick={handleReset}
            style={{ padding: '6px 8px', border: '1px solid #444', background: '#111', color: '#fff', cursor: 'pointer' }}>
            <RotateCcw size={14} />
          </button>
          <button onClick={onClose}
            style={{
              padding: '6px 16px', border: '1px solid #C1282D',
              background: '#C1282D', color: '#fff',
              fontSize: 11, fontFamily: 'Inter,sans-serif',
              fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            ENTER GAZETTE <X size={12} />
          </button>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
          SCENE 1 · 0.0 – 4.0s — always in DOM, opacity controlled
         ══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#0a0a0a', opacity: op1, transition: TR, pointerEvents: op1 > 0.01 ? 'auto' : 'none' }}
      >
        <div style={{
          background: '#F8F5EF', width: 'min(700px, 94vw)', padding: '44px 52px',
          border: '3px solid #111', boxShadow: '10px 10px 0 #111, 0 0 100px rgba(0,0,0,0.85)',
          position: 'relative',
        }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(#000 1px,transparent 1px)', backgroundSize: '8px 8px' }} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #111', paddingBottom:10, marginBottom:24 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#444', fontWeight:700 }}>VOL. CXXVI · No. 42,910</span>
            <span style={{ background:'#C1282D', color:'#F8F5EF', padding:'3px 12px', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:900, letterSpacing:'0.15em', animation:'pulse 1s infinite' }}>LIVE DISPATCH</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#444', fontWeight:700 }}>Friday, August 7 · 2026</span>
          </div>

          <div style={{ textAlign:'center', marginBottom:10 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#B8860B', fontWeight:900, letterSpacing:'0.28em' }}>✦ THE GLOBAL INTELLIGENCE NETWORK ✦</span>
          </div>

          <div style={{ textAlign:'center', minHeight:52, padding:'14px 0 22px' }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, color:'#111', fontWeight:700, letterSpacing:'0.07em' }}>{typedCities}</span>
            <span style={{ display:'inline-block', width:11, height:22, background:'#C1282D', marginLeft:3, verticalAlign:'middle', animation:'pulse 0.65s infinite' }} />
          </div>

          <div style={{ borderTop:'1px solid #111', paddingTop:10, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#777', textAlign:'center', letterSpacing:'0.14em' }}>
            EDITION: GLOBAL INTERNATIONAL — CURRENCY: AUTO-CONVERT — UPDATED: LIVE
          </div>

          <div style={{ marginTop:20, textAlign:'center', borderTop:'1px dashed #ccc', paddingTop:14 }}>
            <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:13, fontStyle:'italic', color:'#555', margin:0 }}>
              "The world's most distinguished travel &amp; culture chronicle — dispatched daily from every latitude and longitude on the globe."
            </p>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
          SCENE 2 · 4.0 – 8.0s — always in DOM
         ══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8"
        style={{ background: '#F8F5EF', opacity: op2, transition: TR, pointerEvents: op2 > 0.01 ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
             style={{ backgroundImage:'radial-gradient(#000 1px,transparent 1px)', backgroundSize:'6px 6px' }} />

        <div style={{ position:'relative', maxWidth:820, width:'100%' }}>
          <div style={{ marginBottom:18, display:'flex', alignItems:'center', gap:12, borderBottom:'3px solid #111', paddingBottom:12 }}>
            <span style={{ background:'#C1282D', color:'#F8F5EF', padding:'3px 14px', fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:900, letterSpacing:'0.22em' }}>BREAKING</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#444', fontWeight:700 }}>Global Culture &amp; Travel Intelligence · August 2026</span>
            <span style={{ marginLeft:'auto', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#B8860B', fontWeight:700 }}>✦ VOL. CXXVI</span>
          </div>

          <h2 style={{ fontSize:'clamp(30px,7vw,76px)', fontWeight:900, color:'#111', lineHeight:1.0, textTransform:'uppercase', letterSpacing:'-0.015em', borderBottom:'4px solid #111', paddingBottom:14, marginBottom:22 }}>
            CULTURE DISCOVERY
          </h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
            {PAGE_PREVIEWS.map((card, i) => {
              const visible = elapsed >= S2_CARD_START + i * S2_CARD_STEP;
              return (
                <div key={card.label} style={{ background:card.bg, color:card.text, border:'2px solid #111', padding:'14px 16px', opacity:visible?1:0, transform:visible?'translateY(0) scale(1)':'translateY(20px) scale(0.94)', transition:'opacity 0.35s ease, transform 0.35s ease' }}>
                  <div style={{ fontFamily:'Inter,sans-serif', fontSize:9, fontWeight:900, letterSpacing:'0.22em', opacity:0.8, marginBottom:5 }}>{card.tag}</div>
                  <div style={{ fontSize:14, fontWeight:900, textTransform:'uppercase', lineHeight:1.2, letterSpacing:'-0.01em' }}>{card.label}</div>
                </div>
              );
            })}
          </div>

          <p style={{ marginTop:20, fontStyle:'italic', fontSize:14, color:'#555', fontFamily:"'Lora',Georgia,serif", opacity:elapsed>=S2_CAPTION?1:0, transition:'opacity 0.6s ease' }}>
            "Stories that define civilizations across seven continents — dispatched from every corner of the globe."
          </p>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
          SCENE 3 · 8.0 – 13.0s — always in DOM — 2-image crossfade
         ══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: '#0d0a06', opacity: op3, transition: TR, pointerEvents: op3 > 0.01 ? 'auto' : 'none' }}
      >
        <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden' }}>

          {/* Map Image A */}
          <img src="/world_map_a.png" alt="World Map A"
            style={{
              position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
              filter:'sepia(0.18) contrast(1.05)',
              opacity: (() => {
                const inV  = Math.min(1, Math.max(0, (elapsed - S2_END) / 0.3));
                const outV = Math.max(0, 1 - (elapsed - 5.1) / 0.4);
                return Math.min(inV, outV);
              })(),
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Map Image B */}
          <img src="/world_map_b.png" alt="World Map B"
            style={{
              position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
              filter:'sepia(0.15) contrast(1.04)',
              opacity: Math.min(1, Math.max(0, (elapsed - 5.2) / 0.4)),
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Top bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, background:'rgba(10,8,4,0.82)', backdropFilter:'blur(2px)', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #C1282D' }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#C1282D', fontWeight:900, letterSpacing:'0.18em' }}>CARTOGRAPHY EXPLORATION · GLOBAL DISPATCH</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#B8860B', fontWeight:700 }}>✦ PREDICVERSE NAVIGATION ATLAS ✦</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#F8F5EF', fontWeight:700, background:elapsed<5.2?'#C1282D':'#B8860B', padding:'2px 10px', transition:'background 0.3s ease' }}>
              MAP {elapsed < 5.2 ? 'I' : 'II'} / II
            </span>
          </div>

          {/* Bottom bar */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(10,8,4,0.82)', backdropFilter:'blur(2px)', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(184,134,11,0.4)' }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#B8860B', fontWeight:700, letterSpacing:'0.22em' }}>PREDICVERSE GLOBAL NAVIGATION ATLAS · EDITION 2026</span>
            <div style={{ background:'#111', color:'#F8F5EF', fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, padding:'3px 12px', letterSpacing:'0.12em', border:'1px solid #444' }}>
              {Math.min(pinReveal, MAP_PINS.length)}/{MAP_PINS.length} LOCATIONS DISCOVERED
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#999', fontWeight:700, transition:'all 0.5s ease' }}>
              {elapsed < 5.2 ? 'WESTERN HEMISPHERE & EURASIA' : 'EASTERN HEMISPHERE & OCEANIA'}
            </span>
          </div>

          {/* Vignette */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)' }} />
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
          SCENE 4 · 13.0 – 17.0s — always in DOM
         ══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#F8F5EF', opacity: op4, transition: TR, pointerEvents: op4 > 0.01 ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
             style={{ backgroundImage:'radial-gradient(#000 1px,transparent 1px)', backgroundSize:'5px 5px' }} />

        {/* Ink particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map(p => {
            const progress = Math.min(1, Math.max(0, (elapsed - S4_PARTICLE_START - p.delay * 0.35) / 2.0));
            const cx = p.x + (p.tx - p.x) * progress;
            const cy = p.y + (p.ty - p.y) * progress;
            return (
              <div key={p.id} style={{ position:'absolute', left:`${cx}%`, top:`${cy}%`, width:p.size, height:p.size, background:'#111', borderRadius:'50%', opacity:p.opacity*(1-progress*0.65), transform:'translate(-50%,-50%)', transition:'all 0.1s linear' }} />
            );
          })}
        </div>

        <div style={{ position:'relative', textAlign:'center' }}>
          <div style={{ marginBottom:22 }}>
            <Compass size={36} color="#B8860B" style={{ margin:'0 auto', display:'block' }} />
          </div>

          <h1 style={{ fontSize:'clamp(44px,10vw,116px)', fontWeight:900, letterSpacing:'-0.03em', textTransform:'uppercase', lineHeight:1, margin:0, color:'#111', filter:'drop-shadow(4px 4px 0 rgba(0,0,0,0.15))' }}>
            {LOGO.split('').map((char, i) => (
              <span key={i} style={{ display:'inline-block', opacity:i<logoLetters?1:0, transform:i<logoLetters?'scaleY(1) translateY(0)':'scaleY(0.5) translateY(10px)', transition:'opacity 0.22s ease, transform 0.26s cubic-bezier(0.34,1.56,0.64,1)', textShadow:i<logoLetters?'2px 2px 0 rgba(0,0,0,0.1)':'none' }}>
                {char}
              </span>
            ))}
          </h1>

          <div style={{ height:5, background:'#111', margin:'18px auto 0', width:logoLetters>0?`${(logoLetters/LOGO.length)*100}%`:'0%', transition:'width 0.22s linear', maxWidth:750 }} />
          <div style={{ height:2, background:'#C1282D', margin:'6px auto 0', width:logoLetters>=LOGO.length?'40%':'0%', transition:'width 0.35s ease 0.15s', maxWidth:300 }} />

          <p style={{ marginTop:18, fontFamily:'Inter,sans-serif', fontSize:12, fontWeight:900, letterSpacing:'0.34em', textTransform:'uppercase', color:'#444', opacity:logoLetters>=LOGO.length?1:0, transition:'opacity 0.5s ease' }}>
            THE WORLD TRAVEL &amp; CULTURE CHRONICLE
          </p>
          <p style={{ marginTop:6, fontFamily:"'Lora',Georgia,serif", fontSize:14, fontStyle:'italic', color:'#777', opacity:elapsed>=S4_LOGO_END?1:0, transition:'opacity 0.5s ease' }}>
            Est. 2026 · Dispatched from every latitude &amp; longitude
          </p>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════
          SCENE 5 · 17.0 – 20.0s — always in DOM
         ══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#F8F5EF', opacity: op5, transition: TR, pointerEvents: op5 > 0.01 ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 opacity-[0.045] pointer-events-none"
             style={{ backgroundImage:'radial-gradient(#000 1px,transparent 1px)', backgroundSize:'6px 6px' }} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background:'radial-gradient(ellipse at 60% 30%, rgba(218,185,120,0.14) 0%, transparent 70%)' }} />

        <div style={{ position:'relative', width:'100%', maxWidth:900, border:'6px solid #111', background:'#F8F5EF', boxShadow:'12px 12px 0 #111', paddingBottom:22 }}>

          {/* Ticker */}
          <div style={{ background:'#111', color:'#F8F5EF', padding:'6px 0', overflow:'hidden', display:'flex', alignItems:'center' }}>
            <span style={{ background:'#C1282D', padding:'2px 14px', fontFamily:'Inter,sans-serif', fontSize:10, fontWeight:900, letterSpacing:'0.22em', flexShrink:0, marginRight:14 }}>LIVE DISPATCH</span>
            <div style={{ overflow:'hidden', flex:1 }}>
              <span style={{ display:'inline-block', whiteSpace:'nowrap', fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:'#ccc', animation:'ticker-scroll 14s linear infinite' }}>
                Culture Discovery &nbsp;•&nbsp; Travel Intelligence &nbsp;•&nbsp; Heritage &nbsp;•&nbsp; Cuisine &nbsp;•&nbsp; Expeditions &nbsp;•&nbsp; Hidden Gems &nbsp;•&nbsp; UNESCO Sites &nbsp;•&nbsp; Ancient Traditions &nbsp;•&nbsp;
                Culture Discovery &nbsp;•&nbsp; Travel Intelligence &nbsp;•&nbsp; Heritage &nbsp;•&nbsp; Cuisine &nbsp;•&nbsp; Expeditions &nbsp;•&nbsp; Hidden Gems &nbsp;•&nbsp; UNESCO Sites &nbsp;•&nbsp; Ancient Traditions &nbsp;&nbsp;
              </span>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 30px', borderBottom:'1px solid #111', fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#444', fontWeight:700 }}>
            <span>VOL. CXXVI · No. 42,910</span>
            <span>EDITION: GLOBAL INTERNATIONAL</span>
            <span>CURRENCY: AUTO-CONVERT · UPDATED: LIVE</span>
          </div>

          <div style={{ textAlign:'center', padding:'30px 30px 18px', borderBottom:'5px solid #111' }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#B8860B', fontWeight:900, letterSpacing:'0.3em', marginBottom:10 }}>
              ✦ THE WORLD'S PREMIER TRAVEL &amp; CULTURE CHRONICLE ✦
            </div>
            <h1 style={{ fontSize:'clamp(42px,9vw,108px)', fontWeight:900, letterSpacing:'-0.02em', textTransform:'uppercase', lineHeight:1, color:'#111', margin:0 }}>
              PREDICVERSE
            </h1>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, margin:'14px 0 12px' }}>
              <div style={{ height:2, background:'#111', width:140 }} />
              <Compass size={24} color="#B8860B" style={{ flexShrink:0, animation:'spin 18s linear infinite' }} />
              <div style={{ height:2, background:'#111', width:140 }} />
            </div>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:11, fontWeight:900, letterSpacing:'0.3em', textTransform:'uppercase', color:'#444', margin:0 }}>
              THE WORLD TRAVEL &amp; CULTURE CHRONICLE — EST. 2026
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 2px 2fr', gap:0, padding:'22px 30px', minHeight:200 }}>
            <div style={{ paddingRight:22 }}>
              <div style={{ fontFamily:'Inter,sans-serif', fontSize:9, fontWeight:900, letterSpacing:'0.2em', color:'#C1282D', marginBottom:8 }}>GLOBAL MAP</div>
              <div style={{ background:'#EDE8DA', border:'2px solid #6b5c3a', position:'relative', paddingBottom:'62%', overflow:'hidden' }}>
                <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 100 62" preserveAspectRatio="none">
                  <path d="M5 20 Q20 16 35 18 Q45 14 55 16 Q65 13 75 15 Q85 12 95 16 L95 38 Q85 42 75 40 Q65 44 52 41 Q42 44 32 42 Q20 46 10 44 L5 42 Z" fill="#d4c9aa" stroke="#6b5c3a" strokeWidth="0.5" />
                  <path d="M52 26 Q58 24 62 28 Q64 34 62 40 Q59 44 54 44 Q50 44 49 38 Q48 30 52 26 Z" fill="#c9bc9a" stroke="#6b5c3a" strokeWidth="0.4" />
                  {MAP_PINS.map(p => <circle key={p.name} cx={p.x} cy={p.y*0.62} r="1.8" fill="#C1282D" opacity="0.87" />)}
                </svg>
              </div>
            </div>

            <div style={{ background:'#111', width:2 }} />

            <div style={{ paddingLeft:22 }}>
              <div style={{ fontFamily:'Inter,sans-serif', fontSize:9, fontWeight:900, letterSpacing:'0.2em', color:'#C1282D', marginBottom:8 }}>TOP STORIES</div>
              <h3 style={{ fontSize:22, fontWeight:900, textTransform:'uppercase', lineHeight:1.1, color:'#111', margin:'0 0 12px', borderBottom:'2px solid #111', paddingBottom:10 }}>
                EXPLORING TIMELESS DESTINATIONS AND HIDDEN CULTURES
              </h3>
              <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:13, color:'#444', lineHeight:1.65, margin:0, fontStyle:'italic' }}>
                From the terraced rice paddies of Bali to the gilded spires of Saint Petersburg,
                every corner of our globe holds ancient stories waiting to be dispatched.
                PREDICVERSE is your intelligence network across all seven continents.
              </p>
            </div>
          </div>

          <div style={{ textAlign:'center', borderTop:'2px solid #111', padding:'18px 30px 0', opacity:taglineVisible?1:0, transition:'opacity 0.8s ease' }}>
            <p style={{ fontSize:20, fontStyle:'italic', color:'#444', margin:0, letterSpacing:'0.05em' }}>
              Discover.&nbsp;&nbsp;Understand.&nbsp;&nbsp;
              <span style={{ color:'#C1282D', fontStyle:'normal', fontWeight:900 }}>Experience.</span>
            </p>
          </div>
        </div>
      </div>


      {/* ── Progress bar with scene markers ── */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:5, background:'#1a1a1a', zIndex:10002 }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg, #C1282D, #B8860B)', width:`${(elapsed/TOTAL)*100}%`, transition:'width 0.05s linear', boxShadow:'0 0 10px rgba(193,40,45,0.5)' }} />
        {[S1_END, S2_END, S3_END, S4_END].map(t => (
          <div key={t} style={{ position:'absolute', top:0, bottom:0, left:`${(t/TOTAL)*100}%`, width:2, background:'rgba(255,255,255,0.25)' }} />
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.25; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

    </div>
  );
};
