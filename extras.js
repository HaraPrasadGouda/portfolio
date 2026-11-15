
(function () {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CS = {
    scam: { t: "Scam Shield", tag: "Solo project", problem: "Fake internship and job offers (\u201cpay \u20b9999 registration\u201d, \u201crefundable laptop deposit\u201d) target students who have never seen a real offer letter.",
      built: "Paste a message or upload a PDF or screenshot and get a 0\u2013100 risk score, the exact red-flag lines quoted back, a company check, and a plain explanation in 8 Indian languages. It keeps working without AI or internet APIs: rules and a trained ML model run on-device, and Gemini adds deeper reasoning when available.",
      tech: "Python, FastAPI, scikit-learn, Gemini", shots: ["shots/scam1.jpg", "shots/scam2.jpg"], result: "Trained on 17,880 real job postings. On 3,576 held-out ones, rules + ML flagged 83% of fakes (rules alone: 10%) and marked only 0.3% of genuine posts as Likely Scam. (Figures from the project README.)",
      links: [["Live demo", "https://scam-shield-cxtg.onrender.com"], ["Code", "https://github.com/HaraPrasadGouda/scam-shield"]] },
    sub: { t: "SubTrack", tag: "Team project \u00b7 Odoo x Make-A-Ton 9.0", problem: "A software company needs one place to run the whole subscription lifecycle: plans, quotations, recurring invoices with GST, payments and overdue reminders.",
      built: "A full subscription management system: products and plans, quotation templates, subscriptions (draft \u2192 active, pause, renew, cancel), invoices with PDF, payments, dunning on day 1/3/7, and a customer self-service portal. I worked on the backend and API integration.",
      tech: "React, Vite, Tailwind, FastAPI, SQLAlchemy, SQLite, JWT, pytest", result: "Built for the Odoo x Make-A-Ton 9.0 hackathon, with 45 automated tests and three role-based logins (admin, staff, portal customer).",
      shots: ["shots/sub_dashboard.jpg", "shots/sub_subscriptions.jpg"], links: [["Code", "https://github.com/HaraPrasadGouda/subtrack-odoo"]] },
    campus: { t: "CampusDebug OS", tag: "BPUT Hackathon 2026 finalist \u00b7 Team lead", problem: "Hostel gate passes, complaints, mess, attendance and cleaning run on paper and WhatsApp, so students wait and staff cannot see what is pending.",
      built: "One installable web app with separate dashboards for students, wardens, teachers and admins: leave and gate passes with a rotating QR, hostel complaints tracked from report to close, attendance, mess and cleaning schedules, and notifications. I led team Tech-IQ and built the app.",
      tech: "React 19, Node.js, Express 5, Supabase (Postgres), PWA, ESP32 IoT sensors", result: "Finalist at the BPUT Hackathon 2026 (finale at BPUT, Rourkela, 12\u201313 Nov). 240 automated tests pass on the codebase.",
      links: [["Code", "https://github.com/HaraPrasadGouda/CampusDebug-OS"]] }
  };
  const ids = ["scam", "sub", "campus"];
  const cards = $$(".cards .card");
  const dlg = document.createElement("div"); dlg.className = "cs"; dlg.id = "cs"; dlg.hidden = true; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true");
  dlg.innerHTML = '<div class="cs-bg" data-x></div><div class="cs-box"><button class="cs-x" data-x aria-label="Close">\u00d7</button><div class="cs-body"></div></div>';
  document.body.appendChild(dlg);
  const body = dlg.querySelector(".cs-body"); let last = null, shotI = 0;
  const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  function show() { $$("#cs .shot").forEach((e, i) => e.classList.toggle("on", i === shotI)); $$("#cs .dots i").forEach((e, i) => e.classList.toggle("on", i === shotI)); }
  function open(k) {
    const c = CS[k]; last = document.activeElement; shotI = 0;
    let h = `<p class="cs-tag">${esc(c.tag)}</p><h3>${esc(c.t)}</h3>`;
    if (c.shots) h += `<div class="slider"><div class="shots">${c.shots.map((s, i) => `<img class="shot${i ? "" : " on"}" src="${s}" alt="${esc(c.t)} screen ${i + 1}" loading="lazy" draggable="false">`).join("")}</div><button class="sl-n sl-p" aria-label="Previous">\u2039</button><button class="sl-n sl-nx" aria-label="Next">\u203a</button><div class="dots">${c.shots.map((s, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div></div>`;
    h += `<div class="cs-grid"><div><b>Problem</b><p>${esc(c.problem)}</p></div><div><b>What I built</b><p>${esc(c.built)}</p></div><div><b>Tech</b><p>${esc(c.tech)}</p></div><div><b>Result</b><p>${esc(c.result)}</p></div></div>`;
    if (c.links.length) h += `<p class="cs-links">${c.links.map(l => `<a class="btn line" href="${l[1]}" target="_blank" rel="noopener"><span>${l[0]}</span><b aria-hidden="true">\u2197</b></a>`).join("")}</p>`; else h += `<p class="cs-note">Private repository.</p>`;
    body.innerHTML = h; dlg.hidden = false; requestAnimationFrame(() => dlg.classList.add("in")); document.documentElement.classList.add("cs-open");
    const p = body.querySelector(".sl-p"), n = body.querySelector(".sl-nx");
    if (p) { const m = CS[k].shots.length; p.onclick = () => { shotI = (shotI + m - 1) % m; show(); }; n.onclick = () => { shotI = (shotI + 1) % m; show(); }; }
    dlg.querySelector(".cs-x").focus();
  }
  function close() { dlg.classList.remove("in"); document.documentElement.classList.remove("cs-open"); setTimeout(() => { dlg.hidden = true; }, 220); if (last && last.focus) last.focus(); }
  dlg.addEventListener("click", e => { if (e.target.hasAttribute("data-x")) close(); });
  cards.forEach((c, i) => { const k = ids[i]; if (!k) return; c.tabIndex = 0; c.setAttribute("role", "button"); c.setAttribute("aria-label", "Open case study: " + CS[k].t);
    const hint = document.createElement("span"); hint.className = "cs-hint"; hint.textContent = "case study \u2192"; c.appendChild(hint);
    c.addEventListener("click", e => { if (e.target.closest("a")) return; open(k); });
    c.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a")) { e.preventDefault(); open(k); } }); });

  // ---- command menu ( / ) ----
  const ITEMS = [["Projects", "#work"], ["About", "#about"], ["Skills", "#stack"], ["Case study: Scam Shield", "cs:scam"], ["Case study: SubTrack", "cs:sub"], ["Case study: CampusDebug OS", "cs:campus"], ["Interactive terminal", "term:"], ["GitHub", "https://github.com/HaraPrasadGouda"], ["LinkedIn", "https://www.linkedin.com/in/hara-prasad-gouda-a1121b371"], ["Resume (PDF)", "Hara_Prasad_Gouda_Resume.pdf"], ["Back to top", "#top"]];
  const cm = document.createElement("div"); cm.className = "cmd"; cm.hidden = true; cm.setAttribute("role", "dialog"); cm.setAttribute("aria-label", "Command menu");
  cm.innerHTML = '<div class="cs-bg" data-x></div><div class="cmd-box"><div class="cmd-in"><span class="pr">$</span><input id="cmdi" type="text" autocomplete="off" spellcheck="false" placeholder="type a command\u2026"></div><ul id="cmdl"></ul><p class="cmd-f">\u2191\u2193 move \u00b7 enter go \u00b7 esc close</p></div>';
  document.body.appendChild(cm);
  const inp = cm.querySelector("#cmdi"), list = cm.querySelector("#cmdl"); let sel = 0, shown = ITEMS;
  function render() { const q = inp.value.trim().toLowerCase(); shown = ITEMS.filter(x => x[0].toLowerCase().includes(q)); sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((x, i) => `<li data-i="${i}" class="${i === sel ? "on" : ""}"><span>${esc(x[0])}</span><em>${(x[1].startsWith("http") || x[1].endsWith(".pdf")) ? "\u2197" : x[1].startsWith("cs:") ? "case study" : x[1].startsWith("term:") ? "open" : "go"}</em></li>`).join("") : '<li class="none">no match</li>'; }
  function openCmd() { if (!dlg.hidden) return; cm.hidden = false; inp.value = ""; sel = 0; render(); requestAnimationFrame(() => cm.classList.add("in")); inp.focus(); }
  function closeCmd() { cm.classList.remove("in"); setTimeout(() => { cm.hidden = true; }, 160); }
  function run(i) { const x = shown[i]; if (!x) return; closeCmd(); const v = x[1];
    if (v.startsWith("http") || v.endsWith(".pdf")) window.open(v, "_blank", "noopener"); else if (v.startsWith("cs:")) setTimeout(() => open(v.slice(3)), 200);
    else if (v.startsWith("term:")) setTimeout(openTerm, 200);
    else { const t = $(v); if (t) { const y = v === "#top" ? 0 : t.getBoundingClientRect().top + scrollY - 20; scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); } } }
  inp.addEventListener("input", () => { sel = 0; render(); });
  inp.addEventListener("keydown", e => { if (e.key === "ArrowDown") { sel = Math.min(sel + 1, shown.length - 1); render(); e.preventDefault(); } else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); } else if (e.key === "Enter") run(sel); });
  list.addEventListener("click", e => { const li = e.target.closest("li[data-i]"); if (li) run(+li.dataset.i); });
  cm.addEventListener("click", e => { if (e.target.hasAttribute("data-x")) closeCmd(); });
  addEventListener("keydown", e => {
    if (e.key === "Escape") { if (!dlg.hidden) close(); else if (!cm.hidden) closeCmd(); return; }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA)$/.test((e.target.tagName || "")) && cm.hidden) { e.preventDefault(); openCmd(); }
    if (!dlg.hidden && e.key === "ArrowRight") { const n = $("#cs .sl-nx"); n && n.click(); } if (!dlg.hidden && e.key === "ArrowLeft") { const n = $("#cs .sl-p"); n && n.click(); }
  });
  const hint = document.createElement("button"); hint.className = "kbd-hint"; hint.type = "button"; hint.innerHTML = "press <kbd>/</kbd> menu · <kbd>t</kbd> terminal"; hint.addEventListener("click", openCmd); document.body.appendChild(hint);
  const navcmd = document.getElementById("navcmd"); if (navcmd) navcmd.addEventListener("click", openCmd);

  // ---- interactive terminal easter egg (press t, or / menu → Interactive terminal) ----
  const it = document.createElement("div"); it.className = "it"; it.hidden = true; it.setAttribute("role", "dialog"); it.setAttribute("aria-modal", "true"); it.setAttribute("aria-label", "Interactive terminal");
  it.innerHTML = '<div class="cs-bg" data-x></div><div class="it-box"><div class="tbar"><i></i><i></i><i></i><span>~/hara — zsh</span></div><div class="it-log" id="itlog" aria-live="polite"></div><div class="it-in"><span class="p">$</span><input id="iti" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command"></div><button class="cs-x" data-x aria-label="Close terminal">\u00d7</button></div>';
  document.body.appendChild(it);
  const itlog = it.querySelector("#itlog"), iti = it.querySelector("#iti");
  const U = (t, h) => `<a href="${h}" target="_blank" rel="noopener">${t}</a>`;
  function print(html) { const d = document.createElement("div"); d.innerHTML = html; itlog.appendChild(d); itlog.scrollTop = itlog.scrollHeight; }
  function openTerm() { if (!dlg.hidden || !cm.hidden) return; it.hidden = false; it.classList.add("in"); document.documentElement.classList.add("cs-open");
    if (!itlog.dataset.hi) { itlog.dataset.hi = 1;
      print('<span class="k">~/hara</span> \u2014 interactive shell. Type <span class="u">help</span> to look around.'); }
    iti.value = ""; setTimeout(() => iti.focus(), 60); }
  function closeTerm() { it.classList.remove("in"); document.documentElement.classList.remove("cs-open"); setTimeout(() => { it.hidden = true; }, 180); if (last && last.focus) last.focus(); }
  const ABOUT = "I'm a 2nd-year CSE student at REC, Bhubaneswar. I like finding real-life problems and turning them into simple apps people can actually use. I lead team Tech-IQ, a BPUT Hackathon 2026 finalist.";
  const CMDS = {
    help() { return ['<span class="k">commands</span>',
      '  <span class="u">whoami</span>      who is this',
      '  <span class="u">projects</span>    what I built \u00b7 try <span class="u">scam</span> / <span class="u">sub</span> / <span class="u">campus</span>',
      '  <span class="u">skills</span>      tech I work with',
      '  <span class="u">contact</span>     find me online',
      '  <span class="u">resume</span>      open the PDF',
      '  <span class="u">ls</span> · <span class="u">cat</span>    poke around the files',
      '  <span class="u">clear</span> · <span class="u">exit</span>'].join("\n"); },
    whoami() { return '<b>Hara Prasad Gouda</b> \u2014 2nd-year CSE student at REC, Bhubaneswar. I build web apps that solve real problems, from spotting scams to running hostel gate passes.'; },
    projects() { return ['<span class="k">3 projects</span>',
      '  01  <a data-cs="scam">Scam Shield</a> \u2014 spot scam messages (solo, live demo)',
      '  02  <a data-cs="sub">SubTrack</a> \u2014 subscription lifecycle (Odoo x Make-A-Ton)',
      '  03  <a data-cs="campus">CampusDebug OS</a> \u2014 campus ops app (BPUT finalist, team lead)'].join("\n"); },
    skills() { return 'C \u00b7 C++ \u00b7 JavaScript \u00b7 React \u00b7 Node.js \u00b7 Supabase \u00b7 HTML \u00b7 CSS \u00b7 Docker \u00b7 Git \u00b7 GitHub'; },
    contact() { return ['find me here:',
      '  ' + U("GitHub \u2197", "https://github.com/HaraPrasadGouda"),
      '  ' + U("LinkedIn \u2197", "https://www.linkedin.com/in/hara-prasad-gouda-a1121b371"),
      '  ' + U("haraprasad5001@gmail.com \u2197", "mailto:haraprasad5001@gmail.com")].join("\n"); },
    resume() { window.open("Hara_Prasad_Gouda_Resume.pdf", "_blank", "noopener"); return 'opening resume \u2026'; },
    hire() { return ['good taste. ' + U("GitHub \u2197", "https://github.com/HaraPrasadGouda") + ' \u00b7 ' + U("LinkedIn \u2197", "https://www.linkedin.com/in/hara-prasad-gouda-a1121b371") + ' \u00b7 ' + U("email \u2197", "mailto:haraprasad5001@gmail.com"),
      'or jump straight to the ' + U("resume \u2197", "Hara_Prasad_Gouda_Resume.pdf")].join("\n"); },
    ls() { return 'projects/   about.md   stack.txt   resume.pdf   shots/'; },
    date() { return new Date().toString(); },
    clear() { itlog.innerHTML = ""; return null; },
    exit() { closeTerm(); return null; },
    scam() { closeTerm(); open("scam"); return null; },
    sub() { closeTerm(); open("sub"); return null; },
    campus() { closeTerm(); open("campus"); return null; },
    sudo() { return '<span class="o">hara is not in the sudoers file. this incident will be reported \u2026 to my LinkedIn.</span>'; }
  };
  function runCmd(raw) {
    const line = raw.trim(); if (!line) return;
    const name = line.split(/\s+/)[0].toLowerCase(), arg = line.split(/\s+/).slice(1).join(" ");
    print(`<span class="o">~ $</span> ${esc(line)}`);
    if (name === "cat") {
      if (arg === "about.md") print(ABOUT); else if (arg === "stack.txt") print(CMDS.skills());
      else print(`<span class="o">cat: ${esc(arg || "")}: no such file \u00b7 try ls</span>`);
      return;
    }
    const c = CMDS[name];
    const out = c ? c() : `<span class="o">zsh: command not found: ${esc(name)} \u00b7 try <span class="u">help</span></span>`;
    if (out != null) print(out);
  }
  const hist = []; let hi = 0;
  iti.addEventListener("keydown", e => {
    if (e.key === "Enter") { const v = iti.value; if (v.trim()) { hist.push(v); hi = hist.length; } iti.value = ""; runCmd(v); e.preventDefault(); }
    else if (e.key === "ArrowUp") { if (hist.length) { hi = Math.max(0, hi - 1); iti.value = hist[hi]; } e.preventDefault(); }
    else if (e.key === "ArrowDown") { hi = Math.min(hist.length, hi + 1); iti.value = hist[hi] || ""; e.preventDefault(); }
  });
  itlog.addEventListener("click", e => { const a = e.target.closest("a[data-cs]"); if (a) { closeTerm(); open(a.dataset.cs); } });
  it.addEventListener("click", e => { if (e.target.hasAttribute("data-x")) closeTerm(); });
  itlog.addEventListener("mousedown", () => setTimeout(() => { if (!it.hidden) iti.focus(); }, 0));
  addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA)$/.test((e.target.tagName || ""));
    if (e.key === "Escape") { if (!it.hidden) { closeTerm(); return; } }
    if (e.key === "t" && !e.ctrlKey && !e.metaKey && !e.altKey && !typing && dlg.hidden && cm.hidden && it.hidden) { e.preventDefault(); openTerm(); }
  });

  // ---- letter reveal on headings ----
  function split(el) { if (el.dataset.sp) return; el.dataset.sp = 1; const t = el.textContent; el.setAttribute("aria-label", t); el.textContent = "";
    t.split(/(\s+)/).forEach(w => { if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(" ")); return; } const wr = document.createElement("span"); wr.className = "w"; wr.setAttribute("aria-hidden", "true");
      [...w].forEach((ch, i) => { const s = document.createElement("span"); s.className = "ch"; s.textContent = ch; s.style.transitionDelay = (i * 28) + "ms"; wr.appendChild(s); }); el.appendChild(wr); }); }
  const heads = $$(".end-line");
  if (!reduce && "IntersectionObserver" in window) { heads.forEach(h => { split(h); h.classList.add("rv"); });
    const io = new IntersectionObserver(es => es.forEach(en => { en.target.classList.toggle("rv-in", en.isIntersecting); }), { threshold: .35 }); heads.forEach(h => io.observe(h)); }
})();


(function(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches; if(reduce)return;
  const sec=document.getElementById("about"), lis=[...document.querySelectorAll(".ab-facts li")]; if(!sec||!lis.length)return;
  const phone=()=>innerWidth<900;
  const DIR=[[1,-.2,6],[.6,1,-8],[1.1,.7,5],[.4,-1,-6]];   // from right / below-right / far below / above
  const cl=(v,a,b)=>Math.min(b,Math.max(a,v)); let done=false;
  function tick(){
    const vh=innerHeight, base=(vh*.92-sec.getBoundingClientRect().top)/(vh*.55);
    lis.forEach((li,i)=>{
      const p=cl(base-i*.12,0,1), e=1-Math.pow(1-p,3);
      if(p>=1){ if(li.dataset.fx){li.style.transform="";li.style.opacity="";li.dataset.fx="";} return; }
      const k=1-e, d=DIR[i%4], w=phone()?.35:1;
      li.dataset.fx=1; li.style.opacity=(e).toFixed(2);
      li.style.transform="translate("+(d[0]*420*w*k).toFixed(0)+"px,"+(d[1]*300*k).toFixed(0)+"px) rotate("+(d[2]*k*3).toFixed(1)+"deg) scale("+(.85+.15*e).toFixed(3)+")";
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

(function(){
  const sec=document.getElementById("how"); if(!sec)return;
  const S=[["Find a real problem","Scam Shield came from fake internship offers that target students. CampusDebug OS came from hostel gate passes and complaints that ran on paper and WhatsApp. I start where people actually lose time or money."],
           ["Build it end to end","React and Node.js on the web, Supabase for data, FastAPI where it fits. I led team Tech-IQ and built the CampusDebug OS app, with separate dashboards for students, wardens, teachers and admins."],
           ["Test it before showing it","240 automated tests on CampusDebug OS, 45 on SubTrack, and a held-out test set for the Scam Shield model. If it is not tested, it is not done."]];
  const n=document.getElementById("hown"),h=document.getElementById("howh"),p=document.getElementById("howp"),bar=document.getElementById("howbar"),tx=document.querySelector(".how-txt");
  let cur=-1;
  function set(i){ if(i===cur)return; const first=cur<0; cur=i; const go=()=>{n.textContent="0"+(i+1);h.textContent=S[i][0];p.textContent=S[i][1];n.classList.remove("sw");tx.classList.remove("sw");};
    if(first){go();return;} n.classList.add("sw");tx.classList.add("sw");setTimeout(go,260); }
  function tick(){ const r=sec.getBoundingClientRect(),tot=sec.offsetHeight-innerHeight; const pr=Math.min(1,Math.max(0,-r.top/tot));
    set(Math.min(2,Math.floor(pr*3.0001))); bar.style.width=(pr*100).toFixed(1)+"%"; requestAnimationFrame(tick); }
  set(0); requestAnimationFrame(tick);
})();
