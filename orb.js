/* orb.js — one scroll-linked particle object: sphere → torus → cube → galaxy → {hpg}
   Original code, no libraries. Separate from main.js so the name/intro engine is untouched. */
(() => {
"use strict";
const cv = document.getElementById("orb"); if (!cv) return;
const ctx = cv.getContext("2d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const phone = () => innerWidth < 760;
let seed = 7; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

let N = 0, shapes = [], jit, col, W = 0, H = 0, dpr = 1;
const SH = 5;
function textPoints(n) {
  const c = document.createElement("canvas"); c.width = 900; c.height = 300;
  const g = c.getContext("2d"); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = '800 190px "Unbounded", system-ui, sans-serif'; g.fillText("{hpg}", 450, 150);
  const d = g.getImageData(0, 0, 900, 300).data, px = [];
  for (let y = 0; y < 300; y += 2) for (let x = 0; x < 900; x += 2) if (d[(y * 900 + x) * 4 + 3] > 128) px.push(x, y);
  let minx = 1e9, maxx = -1e9; for (let i = 0; i < px.length; i += 2) { minx = Math.min(minx, px[i]); maxx = Math.max(maxx, px[i]); }
  const sc = 2.3 / Math.max(1, maxx - minx), out = new Float32Array(n * 3), M = px.length / 2;
  for (let i = 0; i < n; i++) { const q = ((i * 2654435761 >>> 0) % M) * 2;
    out[i * 3] = (px[q] - 450) * sc + (rnd() - .5) * .02; out[i * 3 + 1] = (px[q + 1] - 150) * sc + (rnd() - .5) * .02; out[i * 3 + 2] = (rnd() - .5) * .22; }
  return out;
}
function build() {
  N = phone() ? 700 : 1500; seed = 7;
  const mk = () => new Float32Array(N * 3);
  const sp = mk(), to = mk(), cu = mk(), ga = mk();
  for (let i = 0; i < N; i++) {
    const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    sp.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
    const u = rnd() * 6.2832, v = rnd() * 6.2832, R = .72, rr = .3;
    to.set([(R + rr * Math.cos(v)) * Math.cos(u), rr * Math.sin(v), (R + rr * Math.cos(v)) * Math.sin(u)], i * 3);
    const f = (rnd() * 6) | 0, a = (rnd() - .5) * 1.7, b = (rnd() - .5) * 1.7, s = (f & 1 ? .85 : -.85);
    cu.set(f < 2 ? [s, a, b] : f < 4 ? [a, s, b] : [a, b, s], i * 3);
    const arm = i % 3, t = Math.pow(rnd(), .65) * 1.15, an = t * 4.6 + arm * 2.0944 + (rnd() - .5) * .35 * (1.1 - t);
    ga.set([Math.cos(an) * t, (rnd() - .5) * .16 * (1.15 - t) + Math.sin(an * .5) * .04, Math.sin(an) * t], i * 3);
  }
  shapes = [sp, to, cu, ga, textPoints(N)];
  jit = new Float32Array(N * 2); col = new Uint8Array(N);
  for (let i = 0; i < N; i++) { jit[i * 2] = rnd(); jit[i * 2 + 1] = rnd(); const r = rnd(); col[i] = r < .55 ? 0 : r < .82 ? 1 : r < .93 ? 2 : 3; }
}
const COL = ["143,176,255", "157,255,196", "255,138,92", "238,241,255"];
/* layout keyframes along the page: P, x, y (fractions of viewport), radius multiplier, alpha */
const KF_D = [[0, .76, .52, 1.25, 0], [.07, .76, .52, 1.25, 0], [.16, .5, .5, 1.85, .30], [.34, .5, .5, 1.85, .26], [.5, .84, .5, 1.0, .5], [.68, .12, .5, 1.0, .42], [.86, .86, .45, 1.0, .5], [1, .5, .4, 1.4, .4]];
const KF_P = [[0, .62, .16, .8, 0], [.07, .62, .16, .8, 0], [.16, .5, .5, 1.5, .26], [.34, .5, .5, 1.5, .22], [.5, .8, .5, .6, .45], [.68, .2, .5, .65, .4], [.86, .8, .5, .65, .45], [1, .5, .45, 1.0, .4]];
function kf(P) {
  const K = phone() ? KF_P : KF_D;
  for (let i = 1; i < K.length; i++) if (P <= K[i][0]) { const a = K[i - 1], b = K[i], t = sm((P - a[0]) / (b[0] - a[0] || 1)); return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t), lerp(a[4], b[4], t)]; }
  const l = K[K.length - 1]; return [l[1], l[2], l[3], l[4]];
}
const STOPS = [0, .2, .4, .62, .86];   // shape i is fully formed at STOPS[i]
function shapeAt(P) {
  for (let i = 0; i < SH - 1; i++) if (P < STOPS[i + 1]) { const t = (P - STOPS[i]) / (STOPS[i + 1] - STOPS[i]); return [i, eio((t - .3) / .6)]; }
  return [SH - 2, 1];
}
function resize() {
  dpr = Math.min(devicePixelRatio || 1, phone() ? 1.5 : 2);
  W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
}
let t0 = performance.now(), P = 0, Ps = 0, mx = 0, my = 0, smx = 0, smy = 0, last = t0, showAt = 3800;
const skip = () => { showAt = 0; };
document.getElementById("skip")?.addEventListener("click", skip);
addEventListener("keydown", e => { if (e.key === "Enter" || e.key === "Escape") skip(); });
if (/[?&]skip/.test(location.search)) showAt = 0;
let mpx = -999, mpy = -999;
addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; mpx = e.clientX; mpy = e.clientY; }, { passive: true });
document.addEventListener("mouseleave", () => { mpx = mpy = -999; });

/* ---------- skills network (hero): skills as nodes, linked when close, mouse pulls & lights them ---------- */
const SK = [["C", .55, .30], ["C++", .62, .15], ["JavaScript", .79, .09], ["React", .94, .22], ["Node.js", .57, .73], ["Supabase", .93, .60],
  ["HTML", .70, .90], ["CSS", .83, .94], ["Docker", .53, .52], ["Git", .96, .84], ["GitHub", .62, .86]];
const SKP = [["C", .12, .60], ["C++", .38, .66], ["JavaScript", .70, .62], ["React", .90, .74], ["Node.js", .20, .80], ["Supabase", .55, .84],
  ["HTML", .86, .90], ["CSS", .10, .93], ["Docker", .40, .93], ["Git", .72, .98], ["GitHub", .93, .55]];
function drawNet(time, a) {
  if (a <= .01) return;
  const P_ = phone(), S = P_ ? SKP : SK, t = time / 1000, pts = [];
  for (let i = 0; i < S.length; i++) {
    let x = S[i][1] * W + Math.sin(t * .5 + i * 1.7) * 14, y = S[i][2] * H + Math.cos(t * .42 + i * 2.3) * 14;
    const dx = mpx - x, dy = mpy - y, d = Math.hypot(dx, dy);
    if (d < 240) { const k = (1 - d / 240) * 26; x += dx / (d || 1) * k; y += dy / (d || 1) * k; }
    pts.push([x, y, d]);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = "lighter"; ctx.lineWidth = 1;
  const R = P_ ? 150 : 215;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < R) { ctx.strokeStyle = `rgba(143,176,255,${((1 - d / R) * .32 * a).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); }
  }
  ctx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace'; ctx.textBaseline = "middle";
  for (let i = 0; i < pts.length; i++) {
    const [x, y, d] = pts[i], near = d < 260;
    if (near) { ctx.strokeStyle = `rgba(157,255,196,${((1 - d / 260) * .55 * a).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(mpx, mpy); ctx.lineTo(x, y); ctx.stroke(); }
    const hot = d < 70, r = hot ? 4.6 : 3;
    ctx.fillStyle = hot ? `rgba(157,255,196,${a})` : `rgba(160,185,255,${(.85 * a).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    ctx.fillStyle = `rgba(143,176,255,${(.12 * a).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.2832); ctx.fill();
    if (!P_) { ctx.fillStyle = hot ? `rgba(157,255,196,${a})` : `rgba(205,214,255,${(.72 * a).toFixed(3)})`; ctx.fillText(S[i][0], x + 11, y); }
  }
  ctx.globalCompositeOperation = "source-over";
}
function draw(time, still) {
  const dt = Math.min(.05, (time - last) / 1000); last = time;
  const docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  P = clamp(scrollY / docH, 0, 1);
  Ps = still ? P : lerp(Ps, P, 1 - Math.pow(.002, dt));
  smx = lerp(smx, mx, .06); smy = lerp(smy, my, .06);
  const [x, y, rm, al] = kf(Ps);
  const fade = still ? 1 : sm((time - t0 - showAt) / 1500);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  if (fade <= 0.001) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (al < .01) return;
  const base = clamp(Math.min(W, H) * .19, 78, 190), R = base * rm;
  const cx = x * W, cy = y * H;
  const [k, e] = still ? [0, 0] : shapeAt(Ps);
  const A = shapes[k], B = shapes[k + 1];
  const spin = still ? .6 : time / 1000 * .28 + Ps * 5.5, tilt = .32 + smy * .5, yaw = spin + smx * .9;
  const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cx_ = Math.cos(tilt), sx_ = Math.sin(tilt);
  const sw = Math.sin(e * Math.PI);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "lighter";
  const D = 3.4, sz = Math.max(.8, R / 120);
  const flat = e > .98 && k === SH - 2;            // finished "{hpg}" holds still & readable
  for (let c = 0; c < 4; c++) {
    ctx.fillStyle = `rgb(${COL[c]})`;
    for (let i = 0; i < N; i++) {
      if (col[i] !== c) continue;
      const j = i * 3, r1 = jit[i * 2], r2 = jit[i * 2 + 1];
      let px = lerp(A[j], B[j], e), py = lerp(A[j + 1], B[j + 1], e), pz = lerp(A[j + 2], B[j + 2], e);
      if (sw > 0.001) { const o = (r1 - .5) * .9 * sw; px += -py * o; py += px * o * .0 + (r2 - .5) * .5 * sw; pz += (r2 - .5) * .9 * sw; const g = 1 + sw * .28 * r1; px *= g; py *= g; pz *= g; }
      // rotate (yaw about Y, then tilt about X)
      let X = px * cy_ + pz * sy_, Z = -px * sy_ + pz * cy_, Y = py;
      const Y2 = Y * cx_ - Z * sx_, Z2 = Y * sx_ + Z * cx_;
      const s = D / (D - Z2), sx = cx + X * s * R, sy = cy + Y2 * s * R;
      const near = clamp((Z2 + 1.3) / 2.6, 0, 1);
      ctx.globalAlpha = fade * al * (.28 + .72 * near);
      const d = sz * (.7 + near * 1.5) * (.8 + r2 * .5);
      ctx.fillRect(sx - d / 2, sy - d / 2, d, d);
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
}
/* ---------- typing line (hero, bottom-left) ---------- */
const typedEl = document.getElementById("typed");
const PH = ["solving real-life problems", "BPUT Hackathon 2026 finalist", "C · C++ · JavaScript · React", "shipping things people use"];
let pi = 0, ci = 0, dir = 1, wait = 0, tlast = 0;
function typeTick(time) {
  if (!typedEl) return;
  if (time - tlast < (dir > 0 ? 55 : 28)) return; tlast = time;
  if (wait > 0) { wait--; return; }
  const s = PH[pi];
  ci += dir; typedEl.textContent = s.slice(0, ci);
  if (dir > 0 && ci >= s.length) { dir = -1; wait = 34; }
  else if (dir < 0 && ci <= 0) { dir = 1; pi = (pi + 1) % PH.length; wait = 6; }
}
const $ = id => document.getElementById(id);
const pcard = $("pcard"), pdrop = $("pcdrop"), pin = $("pcin"), pslot = $("pslot"), pback = $("pcback"), card3 = $("card3");
let SL = null, landed = false;
const offs = el => { let x = 0, y = 0; for (let e = el; e; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
function measureC() {
  if (!pslot) return; const r = pslot.getBoundingClientRect(); SL = { x: r.left, y: r.top + scrollY, w: r.width, h: r.height };
  pcard.classList.toggle("sm", SL.w < 200); measureA();
}
if (card3 && pback) { pback.innerHTML = card3.innerHTML; if (!reduce) card3.classList.add("cd-hold"); }
const abtext = $("abtext"); let AB = null;
if (abtext) { const pa = document.createElement("div"); pa.className = "pc-about"; pa.textContent = abtext.textContent; pin.appendChild(pa); if (!reduce) abtext.classList.add("cd-hold"); }
function measureA() { if (abtext) { const r = offs(abtext); AB = r; } }
const spr = { y: 0, y0: 0, x0: 0, t: 0, on: false };
function flyTick(dt) {
  if (!pcard || !SL) return;
  const sy = scrollY, vh = innerHeight, T = card3 ? offs(card3) : null;
  // launch: double-tap (optionally pull down first, then let go) → card shoots up out of sight, drops back with a bounce, then the usual slow sway
  if (spr.on) { spr.t += dt;
    const upT = .26, dnT = 1.15, top = -(SL.y - sy + SL.h + 90);
    if (spr.t < upT) { const k = spr.t / upT; spr.y = lerp(spr.y0, top, k * k * k); }
    else if (spr.t < upT + dnT) { const k = (spr.t - upT) / dnT, c1 = 1.2; spr.y = top * (1 - (1 + (c1 + 1) * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2))); }
    else { spr.on = false; spr.y = 0; }
    const fx = spr.x0 * Math.max(0, 1 - spr.t / .3); pdrop.style.translate = spr.on ? `${fx.toFixed(1)}px ${spr.y.toFixed(1)}px` : ""; pdrop.style.rotate = spr.on ? `${(fx / 18).toFixed(2)}deg` : ""; }
  if (reduce || !T) { pcard.style.transform = `translate3d(${SL.x}px,${SL.y - sy}px,0)`; pcard.style.width = SL.w + "px"; pcard.style.height = SL.h + "px"; return; }
  const a = 30, s1 = Math.max(a + 260, T.y - vh * .3), t = clamp((sy - a) / (s1 - a), 0, 1);
  let X, Y, w, h, flip, rz;
  const s2 = AB ? Math.max(s1 + 260, AB.y - vh * .28) : s1, t2 = AB ? clamp((sy - s1 - 40) / (s2 - s1 - 40), 0, 1) : 0;
  if (t2 <= 0) {
    const e = t * t; X = lerp(SL.x, T.x, e) + Math.sin(t * Math.PI) * -34; Y = lerp(SL.y - sy, T.y - sy, e);
    w = lerp(SL.w, T.w, e); h = lerp(SL.h, T.h, e); flip = 180 * sm((t - .3) / .65); rz = Math.sin(t * Math.PI * 2) * 7 * (1 - t);
  } else {
    const e = t2 * t2 * (3 - 2 * t2); X = lerp(T.x, AB.x, e) + Math.sin(t2 * Math.PI) * 40; Y = lerp(T.y, AB.y, e) - sy;
    w = lerp(T.w, AB.w, e); h = lerp(T.h, AB.h, e); flip = 180 + 180 * sm((t2 - .12) / .8); rz = Math.sin(t2 * Math.PI * 2) * -6 * (1 - t2);
  }
  pcard.style.width = w.toFixed(1) + "px"; pcard.style.height = h.toFixed(1) + "px";
  pcard.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) rotate(${rz.toFixed(2)}deg)`;
  $("pcflip").style.transform = `rotateY(${flip.toFixed(1)}deg)`;
  pin.classList.toggle("ab", flip > 270);
  pdrop.style.setProperty("--cut", clamp(sy / 90, 0, 1).toFixed(3));
  pcard.classList.toggle("fly", sy > 8);
  const d1 = t >= 1, d2 = t2 >= 1;
  card3.classList.toggle("cd-hold", !d1 || t2 > 0); if (abtext) abtext.classList.toggle("cd-hold", !d2);
  pcard.style.visibility = d2 ? "hidden" : "";
  landed = d2;
}
function cardTick(dt) {
  if (!pin) return;
  pin.style.setProperty("--ry", (smx * 14).toFixed(2) + "deg"); pin.style.setProperty("--rx", (-smy * 10).toFixed(2) + "deg");
  flyTick(dt);
}
/* double-tap the card, pull it down, let go → it shoots up, then goes back to its slow sway */
if (pin && !reduce) {
  let lastTap = 0, drag = false, y0 = 0, x0 = 0, pull = 0, pullX = 0, pid = -1;
  const launch = () => { spr.y0 = pull; spr.x0 = pullX; spr.t = 0; spr.on = true; pull = 0; pullX = 0; };
  const move = e => { if (!drag) return; const dy = Math.max(0, e.clientY - y0), dx = e.clientX - x0; pull = 260 * Math.tanh(dy / 200); pullX = 220 * Math.tanh(dx / 200); pdrop.style.translate = `${pullX.toFixed(1)}px ${pull.toFixed(1)}px`; pdrop.style.rotate = `${(pullX / 18).toFixed(2)}deg`; if (e.cancelable) e.preventDefault(); };
  const stop = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", cancel); };
  const up = () => { if (!drag) return; drag = false; stop(); launch(); };
  const cancel = e => { if (e.pointerType === "mouse") return; up(); };   // browsers cancel mouse drags of images; only touch cancel ends the pull
  pin.addEventListener("pointerdown", e => {
    if (scrollY > 8 || spr.on) return; const n = performance.now();
    if (n - lastTap < 600) { drag = true; y0 = e.clientY; x0 = e.clientX; pull = 0; pullX = 0; pid = e.pointerId; e.preventDefault(); lastTap = 0;
      addEventListener("pointermove", move, { passive: false }); addEventListener("pointerup", up); addEventListener("pointercancel", cancel); } else lastTap = n;
  });
  pin.addEventListener("mousedown", e => e.preventDefault());
  pin.addEventListener("dragstart", e => e.preventDefault());
  pin.addEventListener("selectstart", e => e.preventDefault());
  pin.addEventListener("touchmove", e => { if (drag) e.preventDefault(); }, { passive: false });
}
const rowEls = [...document.querySelectorAll("#stack .row")];
function rowTick(time) {   // skills lines: always drifting (top → right, bottom ← left) and pushed further by scroll
  rowEls.forEach((r, i) => { const sp = r.firstElementChild; const per = sp.offsetWidth / 2; if (per < 50) return;
    const v = (reduce ? 0 : time / 1000 * (phone() ? 38 : 60)) + scrollY * .6;
    const m = ((v % per) + per) % per;
    r.style.transform = `translate3d(${(i ? -m : m - per).toFixed(1)}px,0,0)`; });
}
function loop(time) {
  const _dt = Math.min(.05, (time - (loop._t || time)) / 1000); loop._t = time;
  cardTick(_dt); rowTick(time);
  if (!document.hidden) { draw(time, false); typeTick(time); }
  requestAnimationFrame(loop);
}
function init() {
  build(); resize(); measureC(); setTimeout(measureC, 400); setTimeout(measureC, 2500);
  if (reduce) { rowTick(0); cardTick(0); draw(performance.now(), true); if (typedEl) typedEl.textContent = PH[0]; return; }
  requestAnimationFrame(loop);
}
let rT = 0; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { build(); resize(); measureC(); }, 150); });
(document.fonts ? Promise.all([document.fonts.load('800 100px "Unbounded"')]).catch(() => 0).then(() => document.fonts.ready) : Promise.resolve()).then(init);
})();
