import { useState, useEffect, useRef, useCallback } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #070B14; color: #F1F5F9; font-family: 'Sora', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #070B14; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,.4); border-radius: 3px; }
  @keyframes floatY   { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-14px)} }
  @keyframes spinCube { from{transform:rotateX(18deg) rotateY(0deg)} to{transform:rotateX(18deg) rotateY(360deg)} }
  @keyframes scanDown { from{top:-2px} to{top:100%} }
  @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.5)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ping     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
  @keyframes rotate   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .page-enter { animation: fadeUp 0.42s cubic-bezier(.22,1,.36,1) forwards; }
  .hover-lift { transition: transform .25s ease, box-shadow .25s ease; }
  .hover-lift:hover { transform: translateY(-5px); }
  .btn-glow { transition: all .25s ease !important; }
  .btn-glow:hover { box-shadow: 0 10px 36px rgba(99,102,241,.6) !important; transform: translateY(-2px) !important; }
  .nav-item { transition: color .2s; cursor: pointer; }
  .nav-item:hover { color: #818CF8 !important; }
  input[type=range] { accent-color: #6366F1; }
`;

const C = {
  bg: "#070B14", surface: "#0F1729", card: "#131E33",
  border: "rgba(99,102,241,.18)", borderHover: "rgba(99,102,241,.4)",
  primary: "#6366F1", cyan: "#06B6D4", green: "#22C55E",
  yellow: "#F59E0B", pink: "#EC4899",
  text: "#F1F5F9", muted: "#64748B", subtle: "#1E2D45",
};

/* ── PARTICLE CANVAS ── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      dx: (Math.random() - .5) * .35, dy: (Math.random() - .5) * .35,
      r: Math.random() * 1.4 + .3,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,.35)"; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${.07 * (1 - d / 110)})`; ctx.lineWidth = .6; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ── 3D CUBE ── */
function Cube({ size = 160 }) {
  const h = size / 2;
  return (
    <div style={{ perspective: 500, width: size, height: size }}>
      <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", animation: "spinCube 14s linear infinite" }}>
        {[
          { t: `translateZ(${h}px)`, bg: "rgba(99,102,241,.18)" },
          { t: `rotateY(180deg) translateZ(${h}px)`, bg: "rgba(6,182,212,.14)" },
          { t: `rotateY(90deg) translateZ(${h}px)`, bg: "rgba(139,92,246,.14)" },
          { t: `rotateY(-90deg) translateZ(${h}px)`, bg: "rgba(34,197,94,.12)" },
          { t: `rotateX(90deg) translateZ(${h}px)`, bg: "rgba(99,102,241,.1)" },
          { t: `rotateX(-90deg) translateZ(${h}px)`, bg: "rgba(6,182,212,.1)" },
        ].map((f, i) => (
          <div key={i} style={{ position: "absolute", width: size, height: size, border: "1px solid rgba(99,102,241,.35)", background: f.bg, transform: f.t, backdropFilter: "blur(2px)" }} />
        ))}
        <div style={{ position: "absolute", inset: "38%", background: "radial-gradient(circle,rgba(99,102,241,.9),transparent)", borderRadius: "50%", filter: "blur(6px)" }} />
      </div>
    </div>
  );
}

/* ── NAVBAR ── */
const NAV_PAGES = ["Home", "Features", "Studio", "Pipeline", "Pricing"];

function NavBar({ page, navigate }) {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, height: 62, background: "rgba(7,11,20,.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px" }}>
      <div onClick={() => navigate("Home")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#6366F1,#06B6D4)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>⬡</div>
        <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.5 }}>AR<span style={{ color: C.primary }}>Studio</span></span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {NAV_PAGES.map(p => (
          <button key={p} className="nav-item" onClick={() => navigate(p)} style={{
            background: page === p ? "rgba(99,102,241,.14)" : "transparent",
            border: `1px solid ${page === p ? "rgba(99,102,241,.3)" : "transparent"}`,
            color: page === p ? "#818CF8" : C.muted,
            padding: "6px 16px", borderRadius: 8,
            fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: page === p ? 600 : 400, cursor: "pointer", transition: "all .2s",
          }}>{p}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "'Sora',sans-serif", fontSize: 13 }}>Sign In</button>
        <button onClick={() => navigate("Studio")} className="btn-glow" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 18px rgba(99,102,241,.4)" }}>
          Start Free
        </button>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════
   PAGE: HOME
══════════════════════════════════ */
function HomePage({ navigate }) {
  return (
    <div className="page-enter" style={{ minHeight: "100vh", paddingTop: 62 }}>
      {/* HERO */}
      <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <Particles />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: "radial-gradient(circle,rgba(99,102,241,.09),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 44px", width: "100%", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 100, padding: "5px 14px", marginBottom: 28, fontSize: 12, color: "#818CF8", fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "ping 2s ease infinite", display: "inline-block" }} />
              No-Code AR Platform — Now in Public Beta
            </div>
            <h1 style={{ fontSize: "clamp(38px,4.5vw,62px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, marginBottom: 24 }}>
              Transform 3D Models<br />
              <span style={{ background: "linear-gradient(120deg,#6366F1 0%,#06B6D4 50%,#22C55E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Into AR Apps</span><br />
              Instantly
            </h1>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75, marginBottom: 38, maxWidth: 490 }}>
              A no-code cloud platform that converts any 3D model into a fully functional AR Android application — automatically. No Unity. No coding. No complexity.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={() => navigate("Studio")} className="btn-glow" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", border: "none", color: "#fff", padding: "14px 34px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora',sans-serif", boxShadow: "0 8px 28px rgba(99,102,241,.45)" }}>
                Start Building →
              </button>
              <button onClick={() => navigate("Pipeline")} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: C.muted, padding: "14px 28px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontFamily: "'Sora',sans-serif", transition: "all .2s" }}>
                ▶ View Pipeline
              </button>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 48, paddingTop: 36, borderTop: `1px solid ${C.border}` }}>
              {[["80%","Cost Reduction"],["< 5min","Build Time"],["ARCore","Powered"],["Zero","Code Required"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={{ animation: "floatY 5s ease-in-out infinite" }}><Cube size={170} /></div>
            <div style={{ width: 148, height: 256, background: C.card, border: "2px solid rgba(99,102,241,.28)", borderRadius: 26, overflow: "hidden", boxShadow: "0 32px 80px rgba(99,102,241,.18)", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, background: "linear-gradient(135deg,rgba(99,102,241,.15),rgba(6,182,212,.08))", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, position: "relative" }}>
                {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
                  <div key={i} style={{ position:"absolute",[v]:14,[h]:14,width:16,height:16, borderTop:v==="top"?"2px solid #6366F1":"none", borderBottom:v==="bottom"?"2px solid #6366F1":"none", borderLeft:h==="left"?"2px solid #6366F1":"none", borderRight:h==="right"?"2px solid #6366F1":"none" }} />
                ))}
                <div style={{ fontSize: 32, animation: "floatY 3.5s ease-in-out infinite" }}>⬡</div>
                <div style={{ width: 50, height: 3, background: "rgba(99,102,241,.5)", borderRadius: 2 }} />
                <div style={{ width: 34, height: 3, background: "rgba(6,182,212,.4)", borderRadius: 2 }} />
                <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: C.green, fontFamily: "'Space Mono',monospace" }}>AR LIVE</div>
              </div>
              <div style={{ height: 28, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 36, height: 4, background: "rgba(255,255,255,.12)", borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOW STRIP */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "44px", background: "rgba(99,102,241,.03)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[["⬡","Upload 3D Model","GLB · OBJ · GLTF"],["◈","Configure Layers","Labels & hotspots"],["▶","Generate APK","One-click build"],["📱","Download & Deploy","Android ready"]].map((f,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:14,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 24px",flex:"1 1 200px",maxWidth:260 }}>
              <div style={{ width:42,height:42,background:"rgba(99,102,241,.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:C.primary,flexShrink:0 }}>{f[0]}</div>
              <div>
                <div style={{ fontSize:14,fontWeight:700 }}>{f[1]}</div>
                <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{f[2]}</div>
              </div>
              {i<3 && <div style={{ marginLeft:"auto",color:C.primary,fontSize:18,opacity:.4 }}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section style={{ padding: "80px 44px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: C.cyan, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Industrial Applications</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, marginBottom: 48 }}>Built for Every <span style={{ color: C.cyan }}>Industry</span></h2>
          <div style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
            {[["🎓","Education","AR learning models"],["🫀","Medical","3D anatomy viz"],["⚙️","Engineering","Machine simulations"],["🏭","Manufacturing","Equipment training"],["🏛️","Architecture","3D building walkthrough"]].map(ind => (
              <div key={ind[1]} className="hover-lift" style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px 22px",width:180,cursor:"default" }}>
                <div style={{ fontSize:34,marginBottom:12 }}>{ind[0]}</div>
                <div style={{ fontSize:15,fontWeight:700,marginBottom:6 }}>{ind[1]}</div>
                <div style={{ fontSize:12,color:C.muted,lineHeight:1.5 }}>{ind[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 44px",textAlign:"center",background:"linear-gradient(180deg,transparent,rgba(99,102,241,.06),transparent)" }}>
        <h2 style={{ fontSize:48,fontWeight:900,letterSpacing:-2,marginBottom:18 }}>
          Ready to Build Your<br />
          <span style={{ background:"linear-gradient(120deg,#6366F1,#06B6D4,#22C55E)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>First AR App?</span>
        </h2>
        <p style={{ color:C.muted,fontSize:16,marginBottom:36 }}>No code. No Unity. No complexity. Upload → Configure → Download.</p>
        <div style={{ display:"flex",gap:14,justifyContent:"center" }}>
          <button onClick={() => navigate("Studio")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6366F1,#06B6D4)",border:"none",color:"#fff",padding:"15px 40px",borderRadius:12,cursor:"pointer",fontSize:16,fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:"0 10px 36px rgba(99,102,241,.45)" }}>Open Studio →</button>
          <button onClick={() => navigate("Pricing")} style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.12)",color:C.muted,padding:"15px 32px",borderRadius:12,cursor:"pointer",fontSize:16,fontFamily:"'Sora',sans-serif" }}>View Pricing</button>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════
   PAGE: FEATURES
══════════════════════════════════ */
const FEATURES_DATA = [
  { icon:"⬡", title:"3D Model Upload", sub:"GLB · OBJ · GLTF", color:C.primary, desc:"Drag-and-drop uploader with automatic polycount validation, mobile optimization checks, and cloud storage integration.", tags:["Drag & Drop","Auto-Validate","Mobile Check"] },
  { icon:"◈", title:"Web 3D Preview", sub:"WebGL Renderer", color:C.cyan, desc:"Inspect your model in a real-time browser viewer powered by Three.js with rotate, zoom, and layer isolation controls.", tags:["Three.js","Rotate","Zoom","Inspect"] },
  { icon:"⊞", title:"Layer Configuration", sub:"Interactive Builder", color:"#8B5CF6", desc:"Add labels, interactive hotspots, exploded views, and opacity toggles to every component of your 3D model.", tags:["Hotspots","Exploded View","Labels","Opacity"] },
  { icon:"▶", title:"APK Generator", sub:"One-Click Build", color:C.green, desc:"Full automation pipeline: upload → config → Unity build → ARCore injection → downloadable Android APK.", tags:["Unity Build","ARCore","Auto-Deploy"] },
  { icon:"◎", title:"AR Video Suite", sub:"30FPS Capture", color:C.yellow, desc:"Record AR sessions with annotation tools, timestamp comments, playback preview, and trainer review upload.", tags:["Record","Annotate","30FPS","Review"] },
  { icon:"✦", title:"AI Auto-Label", sub:"Neural Detection", color:C.pink, desc:"AI automatically identifies and labels all model components. Voice-guided AR learning and classroom sync included.", tags:["AI Labels","Voice Guide","Classroom"] },
  { icon:"◑", title:"Surface Detection", sub:"ARCore Powered", color:C.cyan, desc:"Place 3D models on real-world surfaces using ARCore plane detection. Pinch, rotate, drag with full gesture support.", tags:["ARCore","Pinch-Zoom","Drag","Surface"] },
  { icon:"⬧", title:"Classroom Mode", sub:"Multi-Device Sync", color:C.primary, desc:"Synchronize AR sessions across multiple devices simultaneously for collaborative training and education.", tags:["Sync","Multi-Device","Education"] },
  { icon:"☁", title:"Cloud Storage", sub:"Firebase Backend", color:C.green, desc:"All models and APKs stored securely in Firebase Storage with real-time Firestore sync and user auth.", tags:["Firebase","Secure","Real-time"] },
];

function FeaturesPage({ navigate }) {
  const [hov, setHov] = useState(null);
  return (
    <div className="page-enter" style={{ minHeight: "100vh", paddingTop: 62 }}>
      <div style={{ position: "relative", padding: "70px 44px 50px", textAlign: "center", overflow: "hidden" }}>
        <Particles />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Platform Capabilities</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, marginBottom: 18 }}>
            Everything to <span style={{ background: "linear-gradient(120deg,#6366F1,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Build AR</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Complete automated pipeline engineered for non-technical creators.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px 60px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {FEATURES_DATA.map((f, i) => (
          <div key={i} className="hover-lift" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ background: hov===i ? C.subtle : C.card, border: `1px solid ${hov===i ? f.color+"44" : C.border}`, borderRadius: 20, padding: "28px 26px", cursor: "default", transition: "all .3s", position: "relative", overflow: "hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${f.color},transparent)`,opacity:hov===i?1:0,transition:"opacity .3s" }} />
            <div style={{ width:46,height:46,background:`${f.color}18`,border:`1px solid ${f.color}28`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:f.color,marginBottom:16 }}>{f.icon}</div>
            <div style={{ fontSize:17,fontWeight:700,marginBottom:3 }}>{f.title}</div>
            <div style={{ fontSize:10,color:f.color,fontWeight:600,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:12 }}>{f.sub}</div>
            <div style={{ color:C.muted,fontSize:13,lineHeight:1.65,marginBottom:18 }}>{f.desc}</div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {f.tags.map(t => <span key={t} style={{ fontSize:10,padding:"3px 9px",background:`${f.color}12`,border:`1px solid ${f.color}22`,borderRadius:100,color:"#94A3B8" }}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign:"center",padding:"0 44px 80px" }}>
        <button onClick={() => navigate("Studio")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6366F1,#818CF8)",border:"none",color:"#fff",padding:"14px 36px",borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:"0 8px 28px rgba(99,102,241,.4)" }}>
          Try All Features in Studio →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   PAGE: STUDIO
══════════════════════════════════ */
function BuildProgress({ active, onDone }) {
  const STEPS = ["Uploading model to cloud...","Validating geometry & polycount...","Generating JSON config...","Triggering Unity build pipeline...","Injecting AR template...","Compiling APK...","✓ APK Ready to Download!"];
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (!active) { setStep(-1); return; }
    setStep(0);
    const iv = setInterval(() => setStep(s => { if (s >= STEPS.length-1) { clearInterval(iv); onDone(); return s; } return s+1; }), 950);
    return () => clearInterval(iv);
  }, [active]);
  if (step < 0) return null;
  return (
    <div style={{ background:"rgba(0,0,0,.35)",border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginTop:18 }}>
      <div style={{ fontSize:10,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14 }}>Build Pipeline</div>
      {STEPS.map((s,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8,opacity:i>step?.25:1,transition:"opacity .4s" }}>
          <div style={{ width:20,height:20,borderRadius:"50%",flexShrink:0,background:i<step?C.green:i===step?C.primary:"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,transition:"background .3s",animation:i===step?"pulseRing 1.2s infinite":"none" }}>{i<step?"✓":i+1}</div>
          <div style={{ fontSize:12,color:i===step?"#F1F5F9":i<step?C.green:C.muted,fontFamily:"'Space Mono',monospace" }}>{s}</div>
        </div>
      ))}
      <div style={{ marginTop:14,background:"rgba(255,255,255,.05)",borderRadius:3,height:4,overflow:"hidden" }}>
        <div style={{ height:"100%",background:`linear-gradient(90deg,${C.primary},${C.cyan})`,width:`${(step/(STEPS.length-1))*100}%`,transition:"width .95s ease",borderRadius:3 }} />
      </div>
    </div>
  );
}

function Toggle({ defaultOn=true }) {
  const [on,setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(!on)} style={{ width:40,height:22,borderRadius:11,background:on?C.primary:"rgba(255,255,255,.08)",cursor:"pointer",position:"relative",transition:"background .3s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .3s" }} />
    </div>
  );
}

function StudioPage() {
  const [tab, setTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [building, setBuilding] = useState(false);
  const [done, setDone] = useState(false);
  const [layers, setLayers] = useState([{id:1,name:"Component A"},{id:2,name:"Component B"}]);
  const [nextId, setNextId] = useState(3);
  const handleFile = f => { if(f){setFile(f);setDone(false);} };

  return (
    <div className="page-enter" style={{ minHeight:"100vh",paddingTop:62 }}>
      <div style={{ maxWidth:1300,margin:"0 auto",padding:"32px 44px 60px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:30,fontWeight:800,letterSpacing:-1 }}>AR Studio <span style={{ color:C.primary }}>Dashboard</span></h1>
          <p style={{ color:C.muted,fontSize:14,marginTop:4 }}>Build your AR Android app in four simple steps</p>
        </div>
        <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:22,overflow:"hidden",boxShadow:"0 40px 100px rgba(99,102,241,.12)" }}>
          {/* Chrome */}
          <div style={{ background:"rgba(0,0,0,.3)",borderBottom:`1px solid ${C.border}`,padding:"12px 22px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",gap:7 }}>
              {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{ width:12,height:12,borderRadius:"50%",background:c }}/>)}
            </div>
            <span style={{ fontSize:11,color:C.muted,fontFamily:"'Space Mono',monospace" }}>ARStudio — Web IDE v2.4</span>
            <span style={{ fontSize:10,color:C.green,fontFamily:"'Space Mono',monospace" }}>● CONNECTED</span>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"210px 1fr 270px",minHeight:580 }}>
            {/* Sidebar */}
            <div style={{ background:"rgba(0,0,0,.25)",borderRight:`1px solid ${C.border}`,padding:"20px 12px" }}>
              <div style={{ fontSize:9,color:"#334155",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:12,paddingLeft:8 }}>Workspace</div>
              {[{key:"upload",icon:"⬡",label:"Upload Model"},{key:"preview",icon:"◈",label:"3D Preview"},{key:"layers",icon:"⊞",label:"Layer Config"},{key:"settings",icon:"⚙",label:"Build Settings"}].map(item=>(
                <button key={item.key} onClick={()=>setTab(item.key)} style={{ display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 12px",borderRadius:9,marginBottom:3,textAlign:"left",background:tab===item.key?"rgba(99,102,241,.14)":"transparent",border:`1px solid ${tab===item.key?"rgba(99,102,241,.3)":"transparent"}`,color:tab===item.key?"#818CF8":C.muted,cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:tab===item.key?600:400,transition:"all .2s" }}>
                  <span style={{ fontSize:15 }}>{item.icon}</span>{item.label}
                </button>
              ))}
              <div style={{ height:1,background:C.border,margin:"20px 8px" }}/>
              <div style={{ fontSize:9,color:"#334155",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:10,paddingLeft:8 }}>Recent</div>
              {["engine_piston.glb","anatomy_v3.obj","turbine_01.glb"].map(f=>(
                <div key={f} style={{ padding:"6px 10px",fontSize:10,color:"#334155",fontFamily:"'Space Mono',monospace",cursor:"pointer",borderRadius:6 }} onMouseEnter={e=>e.target.style.color=C.muted} onMouseLeave={e=>e.target.style.color="#334155"}>{f}</div>
              ))}
            </div>

            {/* Main */}
            <div style={{ padding:26,overflowY:"auto" }}>
              {tab==="upload" && (
                <div>
                  <h2 style={{ fontSize:20,fontWeight:700,marginBottom:5 }}>Upload 3D Model</h2>
                  <p style={{ color:C.muted,fontSize:13,marginBottom:20 }}>GLB · OBJ · GLTF — Max 200MB</p>
                  <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>document.getElementById("sf").click()}
                    style={{ border:`2px dashed ${dragging?C.primary:"rgba(99,102,241,.28)"}`,borderRadius:14,padding:"40px 20px",textAlign:"center",cursor:"pointer",background:dragging?"rgba(99,102,241,.07)":"rgba(99,102,241,.02)",transition:"all .25s" }}>
                    <input id="sf" type="file" accept=".glb,.obj,.gltf" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
                    <div style={{ fontSize:38,marginBottom:10 }}>{file?"✓":"⬡"}</div>
                    {file?<><div style={{ color:C.green,fontWeight:700,fontSize:15 }}>{file.name}</div><div style={{ color:C.muted,fontSize:12,marginTop:4 }}>Ready to process</div></> :<><div style={{ fontWeight:600,marginBottom:5 }}>Drop your 3D model here</div><div style={{ color:C.muted,fontSize:13 }}>or click to browse files</div></>}
                  </div>
                  {file && (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16 }}>
                      {[["Filename",file.name],["Size",(file.size/1024/1024).toFixed(2)+" MB"],["Format",file.name.split(".").pop().toUpperCase()],["Status","✓ Valid"]].map(([k,v])=>(
                        <div key={k} style={{ background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px" }}>
                          <div style={{ fontSize:10,color:C.muted,marginBottom:3 }}>{k}</div>
                          <div style={{ fontSize:13,fontWeight:600,color:v.includes("✓")?C.green:C.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <BuildProgress active={building} onDone={()=>{setBuilding(false);setDone(true);}} />
                </div>
              )}

              {tab==="preview" && (
                <div>
                  <h2 style={{ fontSize:20,fontWeight:700,marginBottom:5 }}>3D Preview Window</h2>
                  <p style={{ color:C.muted,fontSize:13,marginBottom:20 }}>Real-time WebGL renderer · Three.js</p>
                  <div style={{ height:340,background:"radial-gradient(ellipse at center,rgba(99,102,241,.1) 0%,rgba(7,11,20,.9) 70%)",border:`1px solid ${C.border}`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)`,backgroundSize:"36px 36px" }} />
                    <div style={{ position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(99,102,241,.5),transparent)",animation:"scanDown 3s linear infinite" }} />
                    <div style={{ animation:"floatY 4s ease-in-out infinite, rotate 20s linear infinite",fontSize:64,position:"relative",zIndex:1 }}>⬡</div>
                    <div style={{ color:C.muted,fontSize:12,fontFamily:"'Space Mono',monospace",position:"relative",zIndex:1 }}>{file?`▸ ${file.name}`:"No model loaded — upload first"}</div>
                    <div style={{ position:"absolute",bottom:14,right:14,display:"flex",gap:6,zIndex:2 }}>
                      {["⟲ Rotate","⊕ Zoom","◈ Inspect"].map(c=>(
                        <button key={c} style={{ background:"rgba(7,11,20,.8)",border:`1px solid ${C.border}`,color:"#818CF8",fontSize:10,padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"'Sora',sans-serif" }}>{c}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab==="layers" && (
                <div>
                  <h2 style={{ fontSize:20,fontWeight:700,marginBottom:5 }}>Layer Configuration</h2>
                  <p style={{ color:C.muted,fontSize:13,marginBottom:20 }}>Add hotspots, labels, exploded views</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    {layers.map(l=>(
                      <div key={l.id} style={{ background:"rgba(255,255,255,.025)",border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ width:34,height:34,background:"rgba(99,102,241,.15)",border:"1px solid rgba(99,102,241,.25)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>⬡</div>
                        <input defaultValue={l.name} style={{ flex:1,background:"none",border:"none",color:C.text,fontSize:14,fontWeight:600,fontFamily:"'Sora',sans-serif",outline:"none" }} />
                        <div style={{ display:"flex",gap:5 }}>
                          {[["👁","Visible"],["🔊","Voice"],["💥","Explode"]].map(([ic,tt])=>(
                            <button key={ic} title={tt} style={{ background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:13 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,.2)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}>{ic}</button>
                          ))}
                          <button onClick={()=>setLayers(p=>p.filter(x=>x.id!==l.id))} style={{ background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:12,color:"#EF4444" }}>✕</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>{setLayers(p=>[...p,{id:nextId,name:`Layer ${nextId}`}]);setNextId(n=>n+1);}}
                      style={{ background:"rgba(99,102,241,.06)",border:"1.5px dashed rgba(99,102,241,.25)",borderRadius:12,padding:13,color:C.primary,cursor:"pointer",fontSize:13,fontFamily:"'Sora',sans-serif" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,.12)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,.06)"}>
                      + Add Layer
                    </button>
                  </div>
                </div>
              )}

              {tab==="settings" && (
                <div>
                  <h2 style={{ fontSize:20,fontWeight:700,marginBottom:5 }}>Build Settings</h2>
                  <p style={{ color:C.muted,fontSize:13,marginBottom:20 }}>Configure AR experience parameters</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                    <div style={{ background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px" }}>
                      <div style={{ fontSize:13,color:C.muted,marginBottom:10 }}>Zoom Range</div>
                      <div style={{ display:"flex",gap:14 }}>
                        {[["Min Zoom",0.1,1,0.5],["Max Zoom",1,5,3]].map(([l,min,max,def])=>(
                          <div key={l} style={{ flex:1 }}>
                            <div style={{ fontSize:11,color:C.muted,marginBottom:6 }}>{l}</div>
                            <input type="range" min={min} max={max} step={0.1} defaultValue={def} style={{ width:"100%" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {[["Gesture Controls",true,"Pinch, rotate, drag support"],["Video Recording",true,"30FPS AR session capture"],["Surface Detection",true,"ARCore plane detection"],["Voice Guidance",true,"AI narration on tap"],["AI Auto-Label",true,"Neural part detection"],["AR Classroom Mode",false,"Multi-device session sync"],["Annotation Tools",true,"Draw over AR view"],["Exploded View",false,"Animated part separation"]].map(([label,def,desc])=>(
                      <div key={label} style={{ background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",gap:12 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13,fontWeight:600 }}>{label}</div>
                          <div style={{ fontSize:11,color:C.muted,marginTop:2 }}>{desc}</div>
                        </div>
                        <Toggle defaultOn={def} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ borderLeft:`1px solid ${C.border}`,padding:"20px 18px",display:"flex",flexDirection:"column",gap:20 }}>
              <div>
                <div style={{ fontSize:9,color:"#334155",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:10 }}>Config Preview</div>
                <div style={{ background:"rgba(0,0,0,.35)",border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontFamily:"'Space Mono',monospace",fontSize:9.5,color:C.muted,lineHeight:1.7,maxHeight:180,overflow:"auto" }}>
                  <pre style={{ margin:0,whiteSpace:"pre-wrap" }}>{`{
  "model": "${file?file.name:"pending"}",
  "layers": ${layers.length},
  "arcore": true,
  "ai_labels": true,
  "recording": true
}`}</pre>
                </div>
              </div>
              <div>
                <div style={{ fontSize:9,color:"#334155",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:10 }}>Generate APK</div>
                <button onClick={()=>{if(file&&!building){setBuilding(true);setDone(false);setTab("upload");}}} disabled={!file||building} className={file&&!building?"btn-glow":""}
                  style={{ width:"100%",padding:"13px",borderRadius:10,background:file&&!building?"linear-gradient(135deg,#6366F1,#06B6D4)":"rgba(255,255,255,.05)",border:"none",color:file&&!building?"#fff":C.muted,fontSize:13,fontWeight:700,cursor:file&&!building?"pointer":"not-allowed",fontFamily:"'Sora',sans-serif",transition:"all .25s",boxShadow:file&&!building?"0 6px 22px rgba(99,102,241,.4)":"none" }}>
                  {building?"⟳ Building...":done?"⬇ Download APK":"⬡ Generate APK"}
                </button>
                {!file&&<div style={{ fontSize:10,color:C.muted,textAlign:"center",marginTop:6 }}>Upload a model first</div>}
                {done&&<div style={{ marginTop:10,padding:"10px 12px",background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.25)",borderRadius:9,textAlign:"center" }}><div style={{ color:C.green,fontSize:12,fontWeight:700 }}>✓ Build Complete</div><div style={{ color:C.muted,fontSize:10,marginTop:3 }}>ar_experience.apk — 24.7 MB</div></div>}
              </div>
              <div>
                <div style={{ fontSize:9,color:"#334155",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:10 }}>AI Features</div>
                {[["✦","Auto-Label Parts",C.pink],["🔊","Voice Guidance",C.yellow],["◎","Classroom Sync",C.cyan]].map(([ic,label,col])=>(
                  <div key={label} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:7,background:"rgba(255,255,255,.02)",marginBottom:5 }}>
                    <span style={{ color:col,fontSize:12 }}>{ic}</span>
                    <span style={{ fontSize:11,color:C.muted,flex:1 }}>{label}</span>
                    <span style={{ fontSize:9,color:C.green,fontFamily:"'Space Mono',monospace" }}>ON</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   PAGE: PIPELINE
══════════════════════════════════ */
const PIPE = [
  {step:"01",icon:"⬡",label:"Upload Model",desc:"GLB/OBJ uploaded to Firebase Storage via drag-and-drop interface.",color:C.primary},
  {step:"02",icon:"◈",label:"Validate",desc:"Automatic polycount check, mobile compatibility validation, format verification.",color:C.cyan},
  {step:"03",icon:"⊟",label:"Generate Config",desc:"JSON config built from layer settings and build preferences.",color:"#8B5CF6"},
  {step:"04",icon:"◩",label:"Unity Pipeline",desc:"Unity Batch Mode CLI triggered — AR Foundation template loaded.",color:C.yellow},
  {step:"05",icon:"◱",label:"ARCore Inject",desc:"ARCore surface detection and gesture controls injected into the AR scene.",color:C.pink},
  {step:"06",icon:"▼",label:"Compile APK",desc:"Android APK compiled and signed using Docker-based Unity build environment.",color:C.green},
  {step:"07",icon:"📱",label:"Download",desc:"Ready APK delivered to user dashboard for instant download.",color:C.cyan},
];

const JSON_CODE = `{
  "project_id": "ar_lab_model_001",
  "model_url": "cloud-storage/model.glb",
  "features": {
    "zoom_limit": [0.5, 3.0],
    "enable_layers": true,
    "video_recording": "enabled",
    "arcore_surface": true
  },
  "layers": [
    {
      "id": "part_engine",
      "label": "Engine Piston",
      "interactive": true,
      "voice_guide": "enabled"
    },
    {
      "id": "part_valve",
      "label": "Intake Valve",
      "interactive": true,
      "opacity": 0.85
    }
  ],
  "ai": {
    "auto_label": true,
    "classroom_sync": false,
    "voice_narration": true
  },
  "build": {
    "target": "android",
    "min_sdk": 24,
    "arcore_required": true
  }
}`;

function PipelinePage({ navigate }) {
  const [active, setActive] = useState(null);
  return (
    <div className="page-enter" style={{ minHeight:"100vh",paddingTop:62 }}>
      <div style={{ position:"relative",padding:"70px 44px 50px",textAlign:"center",overflow:"hidden" }}>
        <Particles />
        <div style={{ position:"relative",zIndex:1 }}>
          <div style={{ color:C.green,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:14 }}>Automation Pipeline</div>
          <h1 style={{ fontSize:50,fontWeight:900,letterSpacing:-2,marginBottom:16 }}>From Upload to <span style={{ background:"linear-gradient(120deg,#22C55E,#06B6D4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Android APK</span></h1>
          <p style={{ color:C.muted,fontSize:16,maxWidth:500,margin:"0 auto" }}>Seven automated stages — zero manual steps. Click any node to explore.</p>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 44px 60px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",gap:0,marginBottom:40,overflowX:"auto",padding:"20px 0" }}>
          {PIPE.map((p,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",flex:i<PIPE.length-1?1:0,minWidth:110 }}>
              <div onClick={()=>setActive(active===i?null:i)} style={{ textAlign:"center",cursor:"pointer",width:110 }}>
                <div style={{ width:60,height:60,borderRadius:"50%",margin:"0 auto 10px",background:active===i?`${p.color}30`:"rgba(255,255,255,.04)",border:`2px solid ${active===i?p.color:"rgba(255,255,255,.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,transition:"all .3s",boxShadow:active===i?`0 0 24px ${p.color}55`:"none",animation:active===i?"pulseRing 1.5s infinite":"none" }}>{p.icon}</div>
                <div style={{ fontSize:9,color:p.color,fontFamily:"'Space Mono',monospace",marginBottom:3 }}>{p.step}</div>
                <div style={{ fontSize:12,fontWeight:700,lineHeight:1.3 }}>{p.label}</div>
              </div>
              {i<PIPE.length-1&&<div style={{ flex:1,height:2,background:`linear-gradient(90deg,${PIPE[i].color}55,${PIPE[i+1].color}55)`,margin:"0 4px",position:"relative",top:-22 }}><div style={{ position:"absolute",right:-5,top:-4,color:C.muted,fontSize:9 }}>▶</div></div>}
            </div>
          ))}
        </div>

        {active!==null&&(
          <div style={{ background:C.card,border:`1px solid ${PIPE[active].color}33`,borderRadius:16,padding:"22px 26px",marginBottom:40,animation:"fadeUp .3s ease" }}>
            <div style={{ display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:48,height:48,borderRadius:12,background:`${PIPE[active].color}18`,border:`1px solid ${PIPE[active].color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{PIPE[active].icon}</div>
              <div>
                <div style={{ fontWeight:700,fontSize:17 }}>{PIPE[active].label}</div>
                <div style={{ color:PIPE[active].color,fontSize:11,fontFamily:"'Space Mono',monospace",marginTop:2 }}>Step {PIPE[active].step}</div>
              </div>
            </div>
            <p style={{ color:C.muted,fontSize:14,marginTop:14,lineHeight:1.65 }}>{PIPE[active].desc}</p>
          </div>
        )}

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:60 }}>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"28px 26px" }}>
            <div style={{ color:C.primary,fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",marginBottom:18 }}>Technology Stack</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[["Frontend","React · Next.js · Tailwind","⚛"],["3D Engine","Three.js · WebGL","◈"],["Backend","Node.js · Express","⚙"],["Database","Firebase Firestore","☁"],["Storage","Firebase Storage","📦"],["Auth","Firebase Auth","🔒"],["AR Engine","Unity · ARCore","⬡"],["Build","Docker · Unity CLI","◱"]].map(([cat,tech,ic])=>(
                <div key={cat} style={{ background:"rgba(255,255,255,.02)",border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px" }}>
                  <div style={{ fontSize:14,marginBottom:4 }}>{ic}</div>
                  <div style={{ fontSize:11,fontWeight:700,marginBottom:2 }}>{cat}</div>
                  <div style={{ fontSize:10,color:C.muted }}>{tech}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"28px 26px" }}>
            <div style={{ color:C.cyan,fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",marginBottom:16 }}>JSON Config Example</div>
            <div style={{ background:"rgba(0,0,0,.35)",borderRadius:10,padding:"14px 16px",fontFamily:"'Space Mono',monospace",fontSize:9.5,lineHeight:1.7,color:C.muted,maxHeight:280,overflow:"auto" }}>
              <pre style={{ margin:0 }}>
                {JSON_CODE.split("\n").map((line,i)=>{
                  const c = line
                    .replace(/"([^":,{}\[\]]+)":/g,`<span style="color:${C.green}">"$1":</span>`)
                    .replace(/: "(.*?)"/g,`: <span style="color:${C.yellow}">"$1"</span>`)
                    .replace(/: (true|false)/g,`: <span style="color:#818CF8">$1</span>`)
                    .replace(/: (\d+\.?\d*)/g,`: <span style="color:${C.cyan}">$1</span>`)
                    .replace(/([{}\[\]])/g,`<span style="color:${C.primary}">$1</span>`);
                  return <span key={i} dangerouslySetInnerHTML={{__html:c+"\n"}}/>;
                })}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign:"center",padding:"0 44px 80px" }}>
        <button onClick={()=>navigate("Studio")} className="btn-glow" style={{ background:"linear-gradient(135deg,#22C55E,#06B6D4)",border:"none",color:"#fff",padding:"14px 36px",borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"'Sora',sans-serif",boxShadow:"0 8px 28px rgba(34,197,94,.35)" }}>
          Build Your AR App Now →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   PAGE: PRICING
══════════════════════════════════ */
const PLANS = [
  { name:"Starter",price:"Free",period:"",color:C.muted,desc:"Perfect for exploring AR development",
    features:["3 AR app builds/month","GLB & OBJ upload","Basic 3D preview","50MB model limit","Community support"], cta:"Get Started Free",outline:true },
  { name:"Pro",price:"$49",period:"/month",color:C.primary,popular:true,desc:"For professionals & educators",
    features:["Unlimited AR builds","All 3D formats","AI auto-labeling","Voice guidance","200MB model limit","Video recording suite","Priority support","Custom branding"], cta:"Start Pro Trial",outline:false },
  { name:"Enterprise",price:"$199",period:"/month",color:C.cyan,desc:"For teams & organizations",
    features:["Everything in Pro","AR Classroom Mode","Multi-device sync","500MB model limit","Custom domain","SSO & team auth","SLA guarantee","Dedicated support"], cta:"Contact Sales",outline:true },
];

function PricingPage({ navigate }) {
  return (
    <div className="page-enter" style={{ minHeight:"100vh",paddingTop:62 }}>
      <div style={{ position:"relative",padding:"70px 44px 50px",textAlign:"center",overflow:"hidden" }}>
        <Particles />
        <div style={{ position:"relative",zIndex:1 }}>
          <div style={{ color:C.yellow,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:14 }}>Pricing Plans</div>
          <h1 style={{ fontSize:50,fontWeight:900,letterSpacing:-2,marginBottom:16 }}>Simple, <span style={{ background:"linear-gradient(120deg,#F59E0B,#EC4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Transparent Pricing</span></h1>
          <p style={{ color:C.muted,fontSize:16,maxWidth:460,margin:"0 auto" }}>Start free, scale as you grow. No hidden fees. Cancel anytime.</p>
        </div>
      </div>

      <div style={{ maxWidth:1060,margin:"0 auto",padding:"0 44px 80px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22,alignItems:"start" }}>
        {PLANS.map((plan,i)=>(
          <div key={i} className="hover-lift" style={{ background:plan.popular?"linear-gradient(160deg,rgba(99,102,241,.12),rgba(6,182,212,.08))":C.card,border:`1px solid ${plan.popular?C.primary:C.border}`,borderRadius:22,padding:"34px 28px",position:"relative",boxShadow:plan.popular?"0 20px 60px rgba(99,102,241,.2)":"none" }}>
            {plan.popular&&<div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#6366F1,#818CF8)",borderRadius:100,padding:"4px 16px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(99,102,241,.4)" }}>✦ Most Popular</div>}
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:14,fontWeight:700,color:plan.color,marginBottom:6 }}>{plan.name}</div>
              <div style={{ display:"flex",alignItems:"baseline",gap:3,marginBottom:8 }}>
                <span style={{ fontSize:42,fontWeight:900,letterSpacing:-2 }}>{plan.price}</span>
                <span style={{ color:C.muted,fontSize:14 }}>{plan.period}</span>
              </div>
              <div style={{ color:C.muted,fontSize:13 }}>{plan.desc}</div>
            </div>
            <button onClick={()=>navigate("Studio")} className="btn-glow" style={{ width:"100%",padding:"12px",borderRadius:10,marginBottom:24,background:!plan.outline?"linear-gradient(135deg,#6366F1,#818CF8)":"transparent",border:plan.outline?`1px solid ${plan.color}55`:"none",color:!plan.outline?"#fff":plan.color,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:!plan.outline?"0 6px 22px rgba(99,102,241,.4)":"none" }}>
              {plan.cta}
            </button>
            <div style={{ height:1,background:C.border,marginBottom:20 }} />
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {plan.features.map(f=>(
                <div key={f} style={{ display:"flex",alignItems:"center",gap:10,fontSize:13 }}>
                  <span style={{ color:C.green,fontSize:14,flexShrink:0 }}>✓</span>
                  <span style={{ color:"#CBD5E1" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:`rgba(99,102,241,.04)`,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"60px 44px" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <h2 style={{ fontSize:30,fontWeight:800,textAlign:"center",marginBottom:36,letterSpacing:-1 }}>Frequently Asked</h2>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            {[["Do I need Unity installed?","No. Our cloud platform handles all Unity builds remotely. You never touch Unity."],["What Android versions are supported?","Android 7.0+ with ARCore support (API 24+). Covers 95%+ of modern devices."],["Can I update my AR app after building?","Yes — re-upload your model, adjust settings, and rebuild anytime."],["Is my 3D model data secure?","All models are encrypted in Firebase Storage and isolated per user account."]].map(([q,a])=>(
              <div key={q} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 22px" }}>
                <div style={{ fontSize:14,fontWeight:700,marginBottom:8 }}>{q}</div>
                <div style={{ fontSize:13,color:C.muted,lineHeight:1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   FOOTER
══════════════════════════════════ */
function Footer({ navigate }) {
  return (
    <footer style={{ borderTop:`1px solid ${C.border}`,padding:"36px 44px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
      <div onClick={()=>navigate("Home")} style={{ display:"flex",alignItems:"center",gap:9,cursor:"pointer" }}>
        <div style={{ width:28,height:28,background:"linear-gradient(135deg,#6366F1,#06B6D4)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>⬡</div>
        <span style={{ fontWeight:800,fontSize:15 }}>AR<span style={{ color:C.primary }}>Studio</span></span>
      </div>
      <div style={{ display:"flex",gap:24 }}>
        {NAV_PAGES.map(p=><span key={p} onClick={()=>navigate(p)} style={{ color:C.muted,fontSize:13,cursor:"pointer",transition:"color .2s" }} onMouseEnter={e=>e.target.style.color="#818CF8"} onMouseLeave={e=>e.target.style.color=C.muted}>{p}</span>)}
      </div>
      <div style={{ color:"#1E293B",fontSize:12 }}>© 2025 ARStudio. All rights reserved.</div>
    </footer>
  );
}

/* ══════════════════════════════════
   ROOT APP ROUTER
══════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("Home");
  const [key, setKey] = useState(0);

  const navigate = useCallback(p => {
    setPage(p);
    setKey(k => k+1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderPage = () => {
    switch(page) {
      case "Home":     return <HomePage navigate={navigate} />;
      case "Features": return <FeaturesPage navigate={navigate} />;
      case "Studio":   return <StudioPage />;
      case "Pipeline": return <PipelinePage navigate={navigate} />;
      case "Pricing":  return <PricingPage navigate={navigate} />;
      default:         return <HomePage navigate={navigate} />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <NavBar page={page} navigate={navigate} />
      <div key={key}>{renderPage()}</div>
      <Footer navigate={navigate} />
    </>
  );
}
