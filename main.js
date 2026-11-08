(() => {
"use strict";
/* every load starts at the top so the intro always plays on a clean page (no restored scroll, no #hash jump) */
try { history.scrollRestoration = "manual"; } catch (e) {}
if (location.hash) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
scrollTo({ top: 0, left: 0, behavior: "instant" });
addEventListener("pageshow", e => { if (e.persisted) location.reload(); });
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const now = () => performance.now();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const small = () => innerWidth < 700;
const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
const lite = () => touch || small();   // phones / tablets / small windows: lighter rendering + solid name. Desktop path = v1, unchanged
/* phone variants (desktop never reads these): <html data-v="1|2"> or ?v=1 / ?v=2
   V1 = the original particle name, brighter + tighter.  V2 = brighter + denser + soft glow. */
const VAR = new URLSearchParams(location.search).get("v") || document.documentElement.dataset.v || "2";
const LPV = VAR === "1"
  ? { cap: 7000, min: 1.4, jf: .5, size: 1.55, wob: .35, boost: 1.45, white: .22, glow: 0, sdim: .55, halo: 1, hf: 1.6, dpr: 1 }
  : { cap: 9000, min: 1.2, jf: .3, size: 1.6, wob: .3, boost: 1.5, white: .35, glow: 0, sdim: .8, halo: 1, hf: 4, dpr: 1 };
document.documentElement.dataset.v = VAR;
{ const q = new URLSearchParams(location.search); for (const k in LPV) if (q.has(k)) LPV[k] = +q.get(k); }
const setLiteClass = () => document.documentElement.classList.toggle("lite", lite());
setLiteClass();

/* ---------- terminal script (time-driven, no timers) ---------- */
const STACK = "C · C++ · JavaScript · React · Node.js · Supabase";
const L = [
  { at: 300, cmd: "g++ -std=c++17 -O2 hara.cpp -o hara", cps: 48 },
  { at: 1150, html: '<span class="o">compiling</span> hara.cpp …' },
  { at: 1330, html: '<span class="o">linking  </span> ' + STACK },
  { at: 1520, html: '<span class="k">[ok]</span> build finished, 0 errors' },
  { at: 1650, cmd: "./hara", cps: 30 },
  { at: 1950, html: '→ rendering identity' , cur: true },
];
const EXPLODE = 2250;          // ms: output characters break into particles
const tlog = document.getElementById("tlog"), term = document.getElementById("term"), skipBtn = document.getElementById("skip");
let lastLog = "";
function renderLog(el) {
  let out = "";
  for (let i = 0; i < L.length; i++) {
    const l = L[i]; if (el < l.at) break;
    const nextAt = L[i + 1] ? L[i + 1].at : 1e9;
    if (l.cmd) { const n = Math.min(l.cmd.length, Math.floor((el - l.at) / 1000 * l.cps));
      out += '<span class="p">$</span> ' + l.cmd.slice(0, n) + (el < nextAt ? '<span class="cur"></span>' : "") + "\n"; }
    else out += l.html + (l.cur ? ' <span class="cur"></span>' : "") + "\n";
  }
  if (out !== lastLog) { tlog.innerHTML = out; lastLog = out; }
}

/* ---------- sampling helpers ---------- */
const off = document.createElement("canvas"), og = off.getContext("2d", { willReadFrequently: true });
function prepOff() { off.width = innerWidth; off.height = innerHeight; og.clearRect(0, 0, off.width, off.height); og.fillStyle = "#fff"; }
function readPts(cap, minStep) {
  const W = off.width, H = off.height, d = og.getImageData(0, 0, W, H).data;
  let filled = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 128) filled++;
  filled *= 4;
  const step = Math.max(minStep, Math.sqrt(filled / cap));
  const pts = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const jx = x + Math.random() * step * .8, jy = y + Math.random() * step * .8;
    const ix = jx | 0, iy = jy | 0; if (ix >= W || iy >= H) continue;
    if (d[(iy * W + ix) * 4 + 3] > 128) pts.push(jx, jy);
  }
  return { pts, step };
}
const nameEl = document.getElementById("name"), bigEl = document.getElementById("big"), wrapEl = document.getElementById("namewrap");
function sampleText(el, cap, minStep, jf = .8) {
  const R = el.getBoundingClientRect(); const pad = 20;
  const c = document.createElement("canvas"); c.width = Math.ceil(R.width + pad * 2); c.height = Math.ceil(R.height + pad * 2);
  const g = c.getContext("2d", { willReadFrequently: true }); g.fillStyle = "#fff";
  const cs = getComputedStyle(el);
  g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  try { g.letterSpacing = cs.letterSpacing; } catch (e) {}
  g.textBaseline = "alphabetic";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const r = document.createRange();
  for (let n; (n = walker.nextNode());) {
    const s = n.textContent; const re = /\S+/g; let m;
    while ((m = re.exec(s))) {
      r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
      const b = r.getBoundingClientRect(); const word = m[0].toUpperCase(); const mt = g.measureText(word);
      const asc = mt.fontBoundingBoxAscent || parseFloat(cs.fontSize) * .9, desc = mt.fontBoundingBoxDescent || parseFloat(cs.fontSize) * .25;
      g.fillText(word, b.left - R.left + pad, b.top - R.top + pad + (b.height - asc - desc) / 2 + asc);
    }
  }
  const W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data;
  let filled = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 128) filled++; filled *= 4;
  const step = Math.max(minStep, Math.sqrt(filled / cap)); const pts = [];
  const ox = R.left - pad, oy = R.top + scrollY - pad;
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const jx = x + Math.random() * step * jf, jy = y + Math.random() * step * jf; const ix = jx | 0, iy = jy | 0;
    if (ix < W && iy < H && d[(iy * W + ix) * 4 + 3] > 128) pts.push(ox + jx, oy + jy);
  }
  return { pts, step };
}
function sampleName() { return lite() ? sampleText(nameEl, LPV.cap, LPV.min, LPV.jf) : sampleText(nameEl, 34000, 1.5); }
/* fit big display headings so no word overflows (also under Android text scaling) */
function fitText(el) {
  el.style.fontSize = "";
  let fs = parseFloat(getComputedStyle(el).fontSize), n = 0;
  while (el.scrollWidth > el.clientWidth + 1 && fs > 20 && n++ < 30) { fs *= .95; el.style.fontSize = fs + "px"; }
}
function fitAll() { if (!lite()) { nameEl.style.fontSize = bigEl.style.fontSize = ""; return; } fitText(nameEl); fitText(bigEl); }
function sampleTerm() {
  prepOff();
  const cs = getComputedStyle(tlog);
  og.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; og.textBaseline = "alphabetic";
  const walker = document.createTreeWalker(tlog, NodeFilter.SHOW_TEXT);
  const r = document.createRange();
  for (let n; (n = walker.nextNode());) {
    const s = n.textContent;
    for (let i = 0; i < s.length; i++) {
      if (/\s/.test(s[i])) continue;
      r.setStart(n, i); r.setEnd(n, i + 1);
      const b = r.getBoundingClientRect(); if (!b.width) continue;
      const mt = og.measureText(s[i]); const asc = mt.fontBoundingBoxAscent || 11, desc = mt.fontBoundingBoxDescent || 3;
      og.fillText(s[i], b.left, b.top + (b.height - asc - desc) / 2 + asc);
    }
  }
  // the block cursors are part of the output too
  tlog.querySelectorAll(".cur").forEach(c => { const b = c.getBoundingClientRect(); og.fillRect(b.left, b.top, b.width, b.height); });
  return readPts(lite() ? 3000 : 9000, 1).pts;
}

/* ---------- WebGL ---------- */
const cv = document.getElementById("gl");
const gl = !reduce && cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
if (!gl) document.body.classList.add("static");
const VS = `
attribute vec2 aStart; attribute vec2 aTarget; attribute vec4 aRand; attribute vec2 aT2;
uniform vec2 uRes; uniform vec2 uC; uniform float uOut, uIn; uniform float uT, uTime, uScroll, uScrollPx, uDpr, uSize, uMouseOn, uVel; uniform vec2 uMouse; uniform float uWob, uBoost, uWhite;
varying vec3 vCol; varying float vA;
float eo(float x){x=clamp(x,0.,1.);return 1.-pow(1.-x,3.);}
float eio(float x){x=clamp(x,0.,1.);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)/2.;}
void main(){
  float t=uT;
  float ang=aRand.x*6.2831853;
  float del=.12+aStart.x/uRes.x*.45+aRand.z*.08;
  float e=eo((t-del)/1.0);
  vec2 from=aStart-uC; float fl=length(from);
  vec2 rd=normalize(from+vec2(cos(ang),sin(ang))*fl*.9+1e-3);
  float dist=40.+pow(aRand.y,1.4)*min(uRes.x,1000.)*.34;
  vec2 shimmer=vec2(sin(t*40.+aRand.x*90.),cos(t*37.+aRand.y*90.))*smoothstep(0.,.15,t)*(1.-e)*1.6;
  vec2 p=aStart+shimmer+rd*dist*e+vec2(0.,-50.*aRand.z*e);
  float a=eio((t-.48-aRand.w*.45-aTarget.x/uRes.x*.25)/1.15);
  float sw=(1.-a)*e*.9*(aRand.x>.5?1.:-1.)*(.4+aRand.w);
  vec2 cc=vec2(uRes.x*.5,uRes.y*.45); vec2 q=p-cc;
  p=cc+vec2(q.x*cos(sw)-q.y*sin(sw),q.x*sin(sw)+q.y*cos(sw));
  vec2 dir=aTarget-p;
  vec2 pos=mix(p,aTarget,a)+vec2(-dir.y,dir.x)*sin(a*3.14159)*.22*(aRand.x-.5);
  float settled=smoothstep(.85,1.,a);
  pos+=vec2(sin(uTime*.9+aRand.y*50.),cos(uTime*.8+aRand.z*50.))*(.6+1.4*aRand.w)*settled*uWob;
  vec2 d=pos-(uMouse+vec2(0.,uScrollPx*.6)); float l=length(d); float R=95.+uVel*70.;
  float f=exp(-l*l/(R*R))*uMouseOn*settled;
  pos+=d/max(l,.001)*f*(30.+uVel*55.)+vec2(-d.y,d.x)/max(l,1.)*f*(14.+uVel*30.);
  float s=eio(uScroll/.85);
  vec2 c=vec2(uRes.x*.5,uRes.y*.45);
  pos=c+(pos-c)*(1.+s*(1.2+aRand.y*4.5))+vec2(cos(ang*3.),sin(ang*3.))*s*180.*aRand.w;
  pos.y-=uScrollPx*.6;
  float a2=eio((uScroll-uIn+.55-aRand.w*.2)/.45)*(1.-eio((uScroll-uOut-aRand.w*.2)/.5));
  vec2 t2=aT2-vec2(0.,uScrollPx)+vec2(sin(uTime*.9+aRand.y*50.),cos(uTime*.8+aRand.z*50.))*(.6+1.4*aRand.w)*uWob;
  vec2 d2=t2-uMouse; float l2=length(d2); float f2=exp(-l2*l2/(R*R))*uMouseOn*a2;
  t2+=d2/max(l2,.001)*f2*(30.+uVel*55.);
  vec2 dd=t2-pos;
  pos=mix(pos,t2,a2)+vec2(-dd.y,dd.x)*sin(a2*3.14159)*.25*(aRand.x-.5);
  f=max(f,f2);
  vec2 clip=pos/uRes*2.-1.; clip.y=-clip.y;
  gl_Position=vec4(clip,0.,1.);
  vec3 green=vec3(.62,1.,.77), hot=vec3(1.,.9,.78);
  vec3 ice=mix(vec3(.62,.72,1.),vec3(.86,.9,1.),aTarget.x/uRes.x);
  vec3 fin=aRand.y<.07?vec3(1.,.55,.36):(aRand.y<.3?vec3(.56,.69,1.):mix(ice,vec3(1.),.55));
  vec3 col=mix(green,hot,smoothstep(0.,.3,t));
  col=mix(col,fin,smoothstep(.35,1.,a));
  col+=f*vec3(.35,.5,.4);
  vCol=col;
  float flight=(1.-settled)*step(0.,t)*e;
  vA=step(0.,t)*(.9+.18*sin(uTime*2.+aRand.w*40.)*settled)*mix(1.-s*.82,1.,a2);
  gl_PointSize=uSize*uDpr*(.75+aRand.w*.55)*(1.+flight*.35+s*.6*(1.-a2));
  // phones only (desktop: uBoost=1, uWhite=0 -> identical): brighter, slightly whiter landed letters
  float land=max(settled,smoothstep(.85,1.,a2));
  vA*=1.+(uBoost-1.)*land;
  vCol=mix(vCol,min(vCol*1.15+vec3(.18),vec3(1.)),uWhite*land);
}`;
const FS = `precision mediump float; varying vec3 vCol; varying float vA; uniform float uGlow;
void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.08,d);
  float h=smoothstep(.5,0.,d); a=mix(a,max(smoothstep(.3,.1,d),h*h*.5),uGlow); a*=vA; gl_FragColor=vec4(vCol*a,a); }`;
const SVS = `attribute vec3 aP; attribute float aR;
uniform vec2 uRes; uniform float uTime, uScroll, uDpr, uFade; uniform vec2 uM; uniform vec4 uBox; uniform float uSDim;
varying float vA; varying vec3 vC;
void main(){
  float z=fract(aP.z-uTime*.006-uScroll*.35)+.05;
  float r=uTime*.012; vec2 q=vec2(aP.x*cos(r)-aP.y*sin(r),aP.x*sin(r)+aP.y*cos(r));
  vec2 pos=uRes*.5+q*uRes.x*.42/z+uM*(60./z);
  vec2 clip=pos/uRes*2.-1.; clip.y=-clip.y; gl_Position=vec4(clip,0.,1.);
  float near=1.-z;
  gl_PointSize=uDpr*(.8+near*2.6);
  vA=uFade*(.25+.75*near)*(.6+.4*sin(uTime*1.7+aR*60.))*smoothstep(1.05,.85,z);
  vC=mix(vec3(.7,.75,1.),vec3(1.,.8,.7),step(.88,aR));
  vec2 bq=max(max(uBox.xy-pos,pos-uBox.zw),0.); vA*=1.-uSDim*(1.-smoothstep(0.,70.,length(bq)));
}`;
const SFS = `precision mediump float; varying float vA; varying vec3 vC;
void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d)*vA; gl_FragColor=vec4(vC*a,a); }`;
function prog(vs, fs) {
  const p = gl.createProgram();
  for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); }
  gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
  return { p, u };
}
let outAt = 3, inAt = 1;
let termC = [innerWidth / 2, innerHeight / 2];
let P1, P2, pbuf, sbuf, count = 0, scount = 0, ptSize = 2.4, dpr = 1;
const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999, on: 0, son: 0, vel: 0, nx: 0, ny: 0, snx: 0, sny: 0 };
function buildStars() {
  scount = lite() ? 260 : 1400;
  const a = new Float32Array(scount * 4);
  for (let i = 0; i < scount; i++) { const r = Math.sqrt(Math.random()) * 1.3, th = Math.random() * 6.283; a.set([Math.cos(th) * r, Math.sin(th) * r * .8, Math.random(), Math.random()], i * 4); }
  sbuf = sbuf || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
}
function buildParticles(starts) {
  const { pts, step } = sampleName();
  count = pts.length / 2; ptSize = step * (lite() ? LPV.size : 1.3);
  if (!starts || !starts.length) starts = pts;
  const sN = starts.length / 2;
  const t2 = lite() ? sampleText(bigEl, count, LPV.min, LPV.jf).pts : sampleText(bigEl, count, 1.5).pts; const M = Math.max(1, t2.length / 2);
  const bb = bigEl.getBoundingClientRect(); outAt = (bb.bottom + scrollY) / innerHeight - .15; inAt = (bb.top + scrollY) / innerHeight - .35;
  const a = new Float32Array(count * 10);
  for (let i = 0; i < count; i++) {
    const s = (Math.random() * sN | 0) * 2; const q = (i % M) * 2;
    a.set([starts[s] + (Math.random() - .5) * .8, starts[s + 1] - (skipped ? 0 : 0) + (Math.random() - .5) * .8, pts[i * 2], pts[i * 2 + 1], Math.random(), Math.random(), Math.random(), Math.random(), (t2[q] || 0) + (Math.random() - .5), (t2[q + 1] || 0) + (Math.random() - .5)], i * 10);
  }
  pbuf = pbuf || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
}
let VW = innerWidth, VH = innerHeight;
function resizeGL() {
  dpr = Math.min(devicePixelRatio || 1, lite() ? LPV.dpr : 2);
  VW = lite() ? (cv.clientWidth || innerWidth) : innerWidth; VH = lite() ? (cv.clientHeight || innerHeight) : innerHeight;
  cv.width = Math.round(VW * dpr); cv.height = Math.round(VH * dpr);
  gl.viewport(0, 0, cv.width, cv.height);
}
function attr(p, name, size, stride, offset) { const loc = gl.getAttribLocation(p, name); if (loc < 0) return; gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset); }
function draw(t, time, scroll) {
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  // stars
  gl.useProgram(P2.p); gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
  attr(P2.p, "aP", 3, 16, 0); attr(P2.p, "aR", 1, 16, 12);
  gl.uniform2f(P2.u.uRes, VW, VH); gl.uniform1f(P2.u.uTime, time); gl.uniform1f(P2.u.uScroll, scroll);
  gl.uniform1f(P2.u.uDpr, dpr); gl.uniform1f(P2.u.uFade, reduce ? 1 : clamp((t + 2.2) / 1.5, .25, 1)); gl.uniform2f(P2.u.uM, pointer.snx, pointer.sny);
  if (lite() && L8) { const n = L8.name, k = clamp((t - 1.2) / 1.2, 0, 1) * (1 - clamp(scroll * 2, 0, 1)); gl.uniform4f(P2.u.uBox, n.x + 18, n.y - scrollY + 18, n.x + n.w - 18, n.y - scrollY + n.h - 18); gl.uniform1f(P2.u.uSDim, LPV.sdim * k); }
  else gl.uniform1f(P2.u.uSDim, 0);
  gl.drawArrays(gl.POINTS, 0, scount);
  if (!count) return;
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.useProgram(P1.p); gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
  attr(P1.p, "aStart", 2, 40, 0); attr(P1.p, "aTarget", 2, 40, 8); attr(P1.p, "aRand", 4, 40, 16); attr(P1.p, "aT2", 2, 40, 32);
  const u = P1.u;
  gl.uniform2f(u.uRes, VW, VH); gl.uniform2f(u.uC, termC[0], termC[1]); gl.uniform1f(u.uT, t); gl.uniform1f(u.uTime, time);
  gl.uniform1f(u.uScroll, scroll); gl.uniform1f(u.uOut, outAt); gl.uniform1f(u.uIn, inAt); gl.uniform1f(u.uScrollPx, scrollY); gl.uniform1f(u.uDpr, dpr); gl.uniform1f(u.uSize, ptSize);
  gl.uniform2f(u.uMouse, pointer.sx, pointer.sy); gl.uniform1f(u.uMouseOn, pointer.son); gl.uniform1f(u.uVel, pointer.vel);
  const LP = lite() ? LPV : null;
  gl.uniform1f(u.uWob, LP ? LP.wob : 1); gl.uniform1f(u.uBoost, LP ? LP.boost : 1); gl.uniform1f(u.uWhite, LP ? LP.white : 0); gl.uniform1f(u.uGlow, LP ? LP.glow : 0);
  gl.drawArrays(gl.POINTS, 0, count);
}

/* ---------- pointer ---------- */
addEventListener("pointermove", e => {
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = 1;
  if (pointer.sx < -9000) { pointer.sx = pointer.x; pointer.sy = pointer.y; }
  pointer.nx = e.clientX / innerWidth - .5; pointer.ny = e.clientY / innerHeight - .5;
}, { passive: true });
addEventListener("pointerleave", () => pointer.on = 0);
document.addEventListener("mouseleave", () => pointer.on = 0);
addEventListener("touchend", () => pointer.on = 0, { passive: true });
const mags = [...document.querySelectorAll(".btn")];

/* ---------- UI reveal ---------- */
const ui = [...document.querySelectorAll("[data-ui]")];
let uiDone = false;
function revealUI(k0) {
  if (uiDone) return;
  if (lite() && k0 - (ui.length - 1) * .09 > .75) uiDone = true;
  ui.forEach((el, i) => { const k = easeOut((k0 - i * .09) / .7); el.style.opacity = k; if (!el.classList.contains("nav") && !el.classList.contains("hint")) el.style.transform = `translate3d(0,${(1 - k) * 16}px,0)`; });
}

/* ---------- scroll-linked pieces ---------- */
const cards = [...document.querySelectorAll(".card")];
const rows = [...document.querySelectorAll(".row")];
const stackSec = document.getElementById("stack");
const barEl = document.getElementById("bar"), pctEl = document.getElementById("pct");
let lastPct = -1, lastSY = -1, L8 = null;
function docTop(el) { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; }
function measure() {   // layout read once (load / resize), never per frame
  L8 = { cards: cards.map(docTop), stack: docTop(stackSec), stackH: stackSec.offsetHeight, maxS: Math.max(1, document.documentElement.scrollHeight - innerHeight), vh: innerHeight,
         name: (() => { const r = (lite() ? wrapEl : nameEl).getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; })(),
         mags: mags.map(b => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, fixed: false }; }) };
  lastSY = -1;
}
const cardK = cards.map(() => -1);
function scrollFX_v1() {   // desktop: exactly the v1 behaviour
  const vh = innerHeight, maxS = Math.max(1, document.documentElement.scrollHeight - vh);
  const p = clamp(scrollY / maxS, 0, 1); const pc = Math.round(p * 100);
  if (pc !== lastPct) { lastPct = pc; const n = Math.round(p * 10); barEl.textContent = "▓".repeat(n) + "░".repeat(10 - n); pctEl.textContent = pc + "%"; }
  cards.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const k = easeOut(clamp((vh - r.top - i * 40) / (vh * .55), 0, 1));
    c.style.opacity = k.toFixed(3);
    c.style.transform = `translate3d(0,calc(${((1 - k) * 110).toFixed(1)}px + var(--lift)),0) rotateX(${((1 - k) * 28).toFixed(2)}deg) scale(${(.92 + .08 * k).toFixed(3)})`;
  });
  const sr = stackSec.getBoundingClientRect(); const sp = (vh - sr.top);
  }
function scrollFX() {
  if (!lite()) return scrollFX_v1();
  if (!L8) measure();
  const sy = scrollY; if (sy === lastSY) return; lastSY = sy;
  const vh = L8.vh;
  const p = clamp(sy / L8.maxS, 0, 1); const pc = Math.round(p * 100);
  if (pc !== lastPct) { lastPct = pc; const n = Math.round(p * 10); barEl.textContent = "▓".repeat(n) + "░".repeat(10 - n); pctEl.textContent = pc + "%"; }
  cards.forEach((c, i) => {
    const top = L8.cards[i] - sy;
    const k = easeOut(clamp((vh - top - i * 40) / (vh * .55), 0, 1));
    if (Math.abs(k - cardK[i]) < .002) return; cardK[i] = k;
    c.style.opacity = k.toFixed(3);
    c.style.transform = `translate3d(0,calc(${((1 - k) * 110).toFixed(1)}px + var(--lift)),0) rotateX(${((1 - k) * 28).toFixed(2)}deg) scale(${(.92 + .08 * k).toFixed(3)})`;
  });
  const sp = vh - (L8.stack - sy);
  if (sp > -200 && sp < vh + L8.stackH + 200) {
  }
}

/* ---------- custom cursor (desktop pointer only) ---------- */
const curEl = document.getElementById("cur"), ring = curEl.querySelector(".ring"), dot = curEl.querySelector(".dot");
const fine = matchMedia("(pointer: fine)").matches && !reduce;
const cur = { x: -100, y: -100, rx: -100, ry: -100 };
if (fine) {
  document.documentElement.classList.add("has-cur");
  addEventListener("pointermove", e => { cur.x = e.clientX; cur.y = e.clientY; if (cur.rx < -50) { cur.rx = cur.x; cur.ry = cur.y; } }, { passive: true });
  document.addEventListener("pointerover", e => {
    const card = e.target.closest(".card"), link = e.target.closest("a,button");
    curEl.classList.toggle("view", !!card && !link); curEl.classList.toggle("link", !!link);
  });
}
function curTick(dt) {
  if (!fine) return;
  const f = 1 - Math.pow(.0005, dt);
  cur.rx = lerp(cur.rx, cur.x, f); cur.ry = lerp(cur.ry, cur.y, f);
  dot.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
  ring.style.transform = `translate3d(${cur.rx}px,${cur.ry}px,0)`;
}

/* ---------- main loop ---------- */
let lastG = -1, lastB = -1, lastMask = "", lastDrawSY = -1, remeasured = false;
let T0 = 0, last = 0, exploded = false, skipped = false;
function skip() { if (!skipped) { skipped = true; } }
skipBtn.addEventListener("click", skip);
addEventListener("keydown", e => { if (e.key === "Enter" || e.key === "Escape") skip(); });
if (/[?&]skip/.test(location.search)) skipped = true;

function frame() {
  const tnow = now(); const dt = Math.min(50, tnow - last) / 1000; last = tnow;
  let el = tnow - T0;
  if (skipped && el < EXPLODE + 2300) { T0 -= (EXPLODE + 2300 - el); el = EXPLODE + 2300; }
  // terminal
  if (el < EXPLODE) { renderLog(el); term.style.opacity = clamp(el / 250, 0, 1); term.style.transform = `translate(-50%,-50%) scale(${lerp(.96, 1, easeOut(el / 300))})`; }
  if (!exploded && el >= EXPLODE) {
    exploded = true;
    const tr = term.getBoundingClientRect(); termC = [tr.left + tr.width / 2, tr.top + tr.height / 2];
    const starts = skipped ? null : sampleTerm();
    buildParticles(starts);
    tlog.style.color = "transparent"; tlog.querySelectorAll("span").forEach(s => s.style.cssText = "color:transparent;background:transparent");
  }
  const t = (el - EXPLODE) / 1000;
  if (exploded) { const k = clamp(t / .45, 0, 1); term.style.opacity = 1 - k; term.style.transform = `translate(-50%,-50%) scale(${1 + k * .06})`; if (k >= 1) term.style.display = "none"; }
  revealUI(t - 1.45);
  if (uiDone && !remeasured) { remeasured = true; measure(); }
  // pointer smoothing
  const f = 1 - Math.pow(.0025, dt);
  if (pointer.x > -9000) {
    const px = pointer.sx, py = pointer.sy;
    pointer.sx = lerp(pointer.sx, pointer.x, f); pointer.sy = lerp(pointer.sy, pointer.y, f);
    const v = Math.hypot(pointer.sx - px, pointer.sy - py) / Math.max(dt, .001) / 1800;
    pointer.vel = lerp(pointer.vel, clamp(v, 0, 1), .12);
  }
  pointer.son = lerp(pointer.son, pointer.on, .08);
  pointer.snx = lerp(pointer.snx, pointer.nx, f * .5); pointer.sny = lerp(pointer.sny, pointer.ny, f * .5);
  // magnetic CTAs
  const scroll = scrollY / innerHeight;
  scrollFX(); curTick(dt);
  if (!lite()) {
    // desktop: v1 behaviour, untouched
    mags.forEach(b => { const r = b.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const dx = pointer.sx - cx, dy = pointer.sy - cy; const d = Math.hypot(dx, dy); const k = d < 120 ? (1 - d / 120) : 0; b.style.transform = `translate3d(${dx * k * .28}px,${dy * k * .35}px,0)`; });
    const gk = easeOut((t - 1.6) / 1.2) * (1 - clamp(scroll * 1.6, 0, 1));
    if (Math.abs(gk - lastG) > .004) { nameEl.style.textShadow = `0 0 46px rgba(110,140,255,${(.32 * gk).toFixed(3)}), 0 0 120px rgba(120,90,255,${(.18 * gk).toFixed(3)})`; lastG = gk; }
    draw(t, el / 1000, scroll);
    requestAnimationFrame(frame); return;
  }
  // the v1 halo behind the particle letters: static text-shadow (CSS), only its opacity moves = compositor, no repaint
  const nk = easeOut((t - 1.6) / 1.2) * (1 - clamp(scroll * LPV.hf, 0, 1)) * LPV.halo;
  if (Math.abs(nk - lastG) > .004 || (nk === 0) !== (lastG === 0)) { nameEl.style.opacity = nk.toFixed(3); lastG = nk; }
  // where a finger scatters the particles, the halo opens too (so no glow "ghost" of the letters is left behind)
  if (L8) {
    const hr = (95 + pointer.vel * 70) * 1.25 * pointer.son * (nk > 0 ? 1 : 0);
    const hx = Math.round(pointer.sx - L8.name.x), hy = Math.round(pointer.sy - (L8.name.y - scrollY));
    const near = hx > -hr && hy > -hr && hx < L8.name.w + hr && hy < L8.name.h + hr;
    const key = hr < 2 || !near ? "off" : hx + "," + hy + "," + Math.round(hr);
    if (key !== lastMask) { lastMask = key;
      if (key === "off") { wrapEl.style.webkitMaskImage = wrapEl.style.maskImage = ""; }
      else { const m = `radial-gradient(circle ${Math.round(hr)}px at ${hx}px ${hy}px, transparent 55%, #000 100%)`; wrapEl.style.webkitMaskImage = m; wrapEl.style.maskImage = m; } }
  }
  // past the particles' range: nothing in the hero moves, so phones only redraw the starfield when scroll changes
  const idle = lite() && exploded && scroll > outAt + .9 && scrollY === lastDrawSY;
  if (!idle) { draw(t, el / 1000, scroll); lastDrawSY = scrollY; }
  requestAnimationFrame(frame);
}

let rT = 0, lastW = innerWidth;
function onResize() {
  // phones fire resize when the browser toolbar slides on scroll: same width = nothing to rebuild
  if (lite() && innerWidth === lastW) { measure(); return; }
  lastW = innerWidth; setLiteClass();
  fitAll(); measure();
  if (!gl) return; resizeGL();
  if (exploded) buildParticles(null);
}
addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(onResize, 150); });

function start() {
  if (!gl) { document.body.classList.add("static"); fitAll(); return; }
  try { P1 = prog(VS, FS); P2 = prog(SVS, SFS); } catch (e) { console.error(e); document.body.classList.add("static"); return; }
  fitAll(); measure();
  resizeGL(); buildStars();
  if (reduce) { document.body.classList.add("static"); draw(0, 0, 0); return; }
  T0 = now(); last = T0; requestAnimationFrame(frame);
}
const fontsReady = document.fonts ? Promise.all([document.fonts.load('800 100px "Unbounded"'), document.fonts.load('400 14px "IBM Plex Mono"')]).catch(() => 0).then(() => document.fonts.ready) : Promise.resolve();
if (reduce) { document.body.classList.add("static"); }
fontsReady.then(start);
})();
