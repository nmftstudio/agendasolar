(() => {
'use strict';
const KEY = 'orbita.v4';
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], D3 = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hm = m => m >= 1440 ? '24:00' : pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const toMin = v => { const [h, m] = v.split(':').map(Number); return h * 60 + m; };
const fmtM = m => { const h = Math.floor(m / 60), r = Math.round(m % 60); return h && r ? `${h} h ${r} min` : h ? `${h} h` : `${r} min`; };
const fmtH = h => h < 1 ? Math.round(h * 60) + ' min' : String(Math.round(h * 10) / 10).replace('.', ',') + ' h';
const uid = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const todayIdx = () => (new Date().getDay() + 6) % 7;
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };

/* ---------- Datos iniciales: prioridades (Familia al centro) y Semana A ---------- */
const ACTS = [
  ['fam', 'Familia', '#ffd23f', 1], ['bud', 'Práctica budista', '#8b7bff'], ['trab', 'Trabajo e ingresos', '#5aa9ff'],
  ['prog', 'Programación (NMFT)', '#27f5c9'], ['foto', 'Fotografía', '#ff3d81'], ['plom', 'Plomero y gasista', '#ff9f43'],
  ['hogar', 'Labores del hogar', '#c9a27e'], ['bib', 'Biblioteca Semilla del Sur', '#b6f04a'],
  ['radio', 'Radio "Kantos Rodados"', '#ff7a59'], ['desc', 'Descanso y sueño', '#8795a8']
];
// Lunes a domingo. "inicio-fin:actividad:título" (horas decimales: 20.5 = 20:30). Sin título = nombre de la actividad.
const SEMANA_A = [
  '7-8:bud;8-13:trab:Uber;13-14:fam:Almuerzo y familia;14-16:prog;16-17:hogar;17-18:desc:Descanso libre;18-19:fam:Familia;19-20.5:foto;20.5-22.5:fam:Cena y familia;22.5-23:desc:Descanso y a dormir',
  '7-8:bud;8-13:trab:Uber;13-14:fam:Almuerzo y familia;14-16:prog;16-17:desc:Descanso libre;17-19:fam:Familia;19-20.5:radio:Radio con Marianela;20.5-22.5:fam:Cena y familia;22.5-23:desc:Descanso y a dormir',
  '7-8:bud;8-13:trab:Uber;13-14:fam:Almuerzo y familia;14-16:prog;16-17.5:foto;17.5-18.5:hogar;18.5-20.5:bib;20.5-22.5:fam:Cena y familia;22.5-23:desc:Descanso y a dormir',
  '7-8:bud;8-13:trab:Uber;13-14:fam:Almuerzo y familia;14-16:prog;16-18:fam:Cuidar a Sol;18-19:hogar;19-21:fam:Familia;21-22.5:fam:Cena y familia;22.5-23:desc:Descanso y a dormir',
  '8.5-9:fam:Desayuno;9-10:bud;10-15:trab:Uber;15-16:fam:Almuerzo y familia;16-18:desc:Siesta;18-19.5:fam:Familia;19.5-20.5:fam:Cena y familia;20.5-21:desc:Salida al hotel;21-24:trab:Hotel (noche)',
  '0-8:trab:Hotel (turno del viernes);8-9:desc:Regreso y desayuno;9-15:desc:Dormir;15-16:fam:Almuerzo y familia;16-17:bud;17-18:hogar;18-19.5:fam:Familia;19.5-20.5:fam:Cena y familia;20.5-21:desc:Salida al hotel;21-24:trab:Hotel (noche)',
  '0-8:trab:Hotel (turno del sábado);8-9:desc:Regreso y desayuno;9-15:desc:Dormir;15-16:fam:Almuerzo y familia;16-17:bud;17-19:foto:Fotografía en familia;19-19.5:desc:Revisión de la semana;19.5-21:fam:Familia;21-22.5:fam:Cena y familia;22.5-23:desc:Descanso y a dormir'
];
function seed() {
  const blocks = [];
  SEMANA_A.forEach((day, d) => day.split(';').forEach(x => {
    const [r, a, t] = x.split(':'), [s, e] = r.split('-').map(v => Math.round(v * 60));
    blocks.push({ id: 'b' + blocks.length, d, s, e, a, t: t || '' });
  }));
  let log = {};
  try { const o = JSON.parse(localStorage.getItem('orbita.v3')); if (o && o.log) log = o.log; } catch (e) {}
  return { activities: ACTS.map(([id, name, color, c]) => ({ id, name, color, center: !!c })), blocks, log, timer: null };
}
function clean(d) {
  if (!d || !Array.isArray(d.activities) || !Array.isArray(d.blocks)) throw new Error('formato');
  const activities = d.activities.map(a => ({ id: String(a.id).replace(/[^\w-]/g, ''), name: String(a.name).slice(0, 40), color: /^#[0-9a-f]{6}$/i.test(a.color) ? a.color : '#888888', center: !!a.center }));
  const ids = new Set(activities.map(a => a.id));
  const blocks = d.blocks.filter(b => ids.has(b.a) && b.d >= 0 && b.d < 7 && b.s >= 0 && b.e <= 1440 && b.s < b.e)
    .map((b, i) => ({ id: 'b' + i, d: b.d | 0, s: b.s | 0, e: b.e | 0, a: b.a, t: String(b.t || '').slice(0, 40) }));
  return { activities, blocks, log: d.log && typeof d.log === 'object' ? d.log : {}, timer: null };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.activities && s.blocks) {
      const c = clean(s);
      if (s.timer && c.activities.some(a => a.id === s.timer.id)) c.timer = { id: s.timer.id, start: +s.timer.start };
      return c;
    }
  } catch (e) {}
  return seed();
}
let S = load(), day = todayIdx(), offset = 0, mode = 'plan', editB = null, editA = null, selDays = new Set(), lastM = -1;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const act = id => S.activities.find(a => a.id === id);
const lab = b => b.t || (act(b.a) || {}).name || '';

/* ---------- Cálculos ---------- */
function weekKey(off) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const planned = id => S.blocks.filter(b => b.a === id).reduce((t, b) => t + b.e - b.s, 0) / 60;
function realMin(id, off) {
  let m = (S.log[weekKey(off)] || {})[id] || 0;
  if (off === 0 && S.timer && S.timer.id === id) m += (Date.now() - S.timer.start) / 60000;
  return m;
}
const val = a => mode === 'plan' ? planned(a.id) : realMin(a.id, offset) / 60;
function stopTimer() {
  if (!S.timer) return;
  const w = weekKey(0), m = (Date.now() - S.timer.start) / 60000;
  S.log[w] = S.log[w] || {}; S.log[w][S.timer.id] = (S.log[w][S.timer.id] || 0) + m; S.timer = null;
}
function toggleTimer(id) {
  const was = S.timer && S.timer.id === id; stopTimer();
  if (!was) S.timer = { id, start: Date.now() };
  save(); renderActs(); renderNow(true);
}
function gaps(d, skipId) {
  const bl = S.blocks.filter(b => b.d === d && b.id !== skipId).sort((a, b) => a.s - b.s), out = []; let cur = 0;
  bl.forEach(b => { if (b.s - cur >= 15) out.push([cur, b.s]); cur = Math.max(cur, b.e); });
  if (1440 - cur >= 15) out.push([cur, 1440]);
  return out;
}

/* ---------- Pestañas ---------- */
function show(v) {
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  window.scrollTo(0, 0); resize();
}
$('.tabs').onclick = e => { if (e.target.dataset.v) show(e.target.dataset.v); };
$('#modeSeg').onclick = e => {
  if (!e.target.dataset.m) return; mode = e.target.dataset.m;
  $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === mode)); renderLegend();
};

/* ---------- Semana (bloques con nombre) ---------- */
function blockHTML(b) {
  const a = act(b.a) || { name: '?', color: '#888' }, now = b.d === todayIdx() && nowMin() >= b.s && nowMin() < b.e;
  const prev = b.s === 0 && S.blocks.some(x => x.d === (b.d + 6) % 7 && x.e === 1440 && x.a === b.a);
  const next = b.e === 1440 && S.blocks.some(x => x.d === (b.d + 1) % 7 && x.s === 0 && x.a === b.a);
  const extra = [b.t ? esc(a.name) : '', fmtM(b.e - b.s), prev ? 'viene de ayer' : '', next ? 'sigue mañana' : '', now ? 'ahora' : ''].filter(Boolean).join(' · ');
  return `<button class="blk${now ? ' now' : ''}" data-b="${b.id}" style="border-left-color:${a.color}"><span class="tm">${hm(b.s)}<br>${hm(b.e)}</span><span><b>${esc(lab(b))}</b><small>${extra}</small></span></button>`;
}
function renderDay() {
  const t = todayIdx();
  $('#dayTabs').innerHTML = D3.map((n, i) => `<button data-d="${i}" class="${i === day ? 'on' : ''}${i === t ? ' hoy' : ''}">${n}</button>`).join('');
  const bl = S.blocks.filter(b => b.d === day).sort((a, b) => a.s - b.s), used = bl.reduce((s, b) => s + b.e - b.s, 0);
  let h = `<div class="dayhead"><h2>${DAYS[day]}${day === t ? ' · hoy' : ''}</h2><span>${fmtM(used)} asignadas · ${fmtM(1440 - used)} libres</span></div>`, cur = 0;
  const gap = (s, e) => { if (e - s >= 15) h += `<button class="gap" data-new="${s}-${e}">+ Sin asignar ${hm(s)} – ${hm(e)}<small>${fmtM(e - s)}</small></button>`; };
  bl.forEach(b => { gap(cur, b.s); h += blockHTML(b); cur = Math.max(cur, b.e); }); gap(cur, 1440);
  $('#blocks').innerHTML = h;
}
$('#dayTabs').onclick = e => { if (e.target.dataset.d != null) { day = +e.target.dataset.d; renderDay(); } };
$('#blocks').onclick = e => {
  const g = e.target.closest('[data-new]'), b = e.target.closest('[data-b]');
  if (g) openBlock(null, g.dataset.new.split('-').map(Number));
  else if (b) openBlock(S.blocks.find(x => x.id === b.dataset.b));
};
$('#addB').onclick = () => { const g = gaps(day)[0]; openBlock(null, g ? [g[0], Math.min(g[1], g[0] + 60)] : null); };

const dB = $('#dB');
function chips() { $('#bD').innerHTML = D3.map((n, i) => `<button type="button" data-d="${i}" class="${selDays.has(i) ? 'on' : ''}">${n}</button>`).join(''); }
function openBlock(b, pre) {
  editB = b || null; const s = b ? b.s : pre ? pre[0] : 480, e = b ? b.e : pre ? pre[1] : 540;
  $('#dBt').textContent = b ? 'Editar bloque' : 'Nuevo bloque';
  $('#bA').innerHTML = S.activities.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
  $('#bA').value = b ? b.a : (S.activities.find(a => !a.center) || S.activities[0] || {}).id;
  $('#bT').value = b ? b.t : ''; $('#bS').value = hm(s); $('#bE').value = e >= 1440 ? '00:00' : hm(e);
  selDays = new Set([b ? b.d : day]); chips(); $('#bDel').hidden = !b;
  $('#bH').classList.remove('err'); dB.showModal();
}
$('#bD').onclick = e => {
  if (e.target.dataset.d == null) return; const d = +e.target.dataset.d;
  if (selDays.has(d)) { if (selDays.size > 1) selDays.delete(d); } else selDays.add(d);
  chips();
};
$('#bX').onclick = () => dB.close();
function bErr(msg) { const h = $('#bH'); h.textContent = msg; h.classList.add('err'); }
$('#fB').onsubmit = e => {
  e.preventDefault();
  const a = $('#bA').value, t = $('#bT').value.trim(), s = toMin($('#bS').value); let en = toMin($('#bE').value);
  if (en === 0 && s > 0) en = 1440;
  if (en === s) return bErr('El inicio y el fin no pueden ser iguales.');
  const cross = en < s, work = S.blocks.filter(b => !editB || b.id !== editB.id), add = [];
  for (const d of [...selDays].sort()) {
    const parts = cross ? [[d, s, 1440], [(d + 1) % 7, 0, en]] : [[d, s, en]];
    for (const [pd, ps, pe] of parts) {
      const hit = work.concat(add).find(x => x.d === pd && x.s < pe && ps < x.e);
      if (hit) return bErr(`Se superpone con «${lab(hit)}» (${D3[hit.d]} ${hm(hit.s)}–${hm(hit.e)}). Ajustá los horarios.`);
      add.push({ id: uid(), d: pd, s: ps, e: pe, a, t });
    }
  }
  S.blocks = work.concat(add); save(); dB.close(); renderAll();
};
$('#bDel').onclick = () => {
  if (!editB || !confirm('¿Eliminar este bloque?')) return;
  S.blocks = S.blocks.filter(b => b.id !== editB.id); save(); dB.close(); renderAll();
};

/* ---------- Actividades ---------- */
function renderActs() {
  $('#acts').innerHTML = S.activities.map(a => {
    const run = S.timer && S.timer.id === a.id;
    return `<li><button class="arow" data-e="${a.id}"><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i><span><b>${esc(a.name)}${a.center ? ' · centro' : ''}</b><small class="pl" data-id="${a.id}"></small></span></button><button class="tg${run ? ' run' : ''}" data-t="${a.id}" aria-label="${run ? 'Detener' : 'Medir'} ${esc(a.name)}">${run ? '■ Detener' : '▶ Medir'}</button></li>`;
  }).join('');
  updNums();
}
const updNums = () => $$('.pl').forEach(e => { e.textContent = `plan ${fmtH(planned(e.dataset.id))} · real ${fmtH(realMin(e.dataset.id, 0) / 60)}`; });
$('#acts').onclick = e => {
  const t = e.target.closest('[data-t]'), r = e.target.closest('[data-e]');
  if (t) toggleTimer(t.dataset.t); else if (r) openAct(r.dataset.e);
};
$('#addA').onclick = () => openAct(null);
const dA = $('#dA');
function openAct(id) {
  editA = id ? act(id) : null;
  $('#dAt').textContent = editA ? 'Editar actividad' : 'Nueva actividad';
  $('#aN').value = editA ? editA.name : ''; $('#aC').value = editA ? editA.color : '#27f5c9'; $('#aK').checked = !!(editA && editA.center);
  $('#aR').hidden = !editA; $('#aDel').hidden = !editA; if (editA) $('#aRv').textContent = fmtH(realMin(editA.id, 0) / 60);
  dA.showModal();
}
$('#aR').onclick = e => {
  const v = e.target.dataset.adj; if (!v || !editA) return;
  const w = weekKey(0); S.log[w] = S.log[w] || {}; S.log[w][editA.id] = Math.max(0, (S.log[w][editA.id] || 0) + Number(v));
  save(); $('#aRv').textContent = fmtH(realMin(editA.id, 0) / 60); tick();
};
$('#aX').onclick = () => dA.close();
$('#fA').onsubmit = e => {
  e.preventDefault();
  const name = $('#aN').value.trim(), color = $('#aC').value, center = $('#aK').checked; if (!name) return;
  if (center) S.activities.forEach(a => { a.center = false; });
  if (editA) Object.assign(editA, { name, color, center }); else S.activities.push({ id: uid(), name, color, center });
  save(); dA.close(); renderAll();
};
$('#aDel').onclick = () => {
  if (!editA || !confirm('¿Eliminar esta actividad? También se borran sus bloques del cronograma.')) return;
  const id = editA.id; if (S.timer && S.timer.id === id) S.timer = null;
  S.activities = S.activities.filter(a => a.id !== id); S.blocks = S.blocks.filter(b => b.a !== id);
  Object.values(S.log).forEach(w => delete w[id]); save(); dA.close(); renderAll();
};

/* ---------- Balance, puntaje y respaldo ---------- */
function renderBal() {
  const d = new Date(weekKey(offset) + 'T00:00:00');
  $('#weekLbl').textContent = (offset === 0 ? 'Esta semana · ' : 'Semana del ') + `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  $('#next').disabled = offset >= 0;
  $('#review').innerHTML = S.activities.map(a => {
    const p = planned(a.id), r = realMin(a.id, offset) / 60, diff = r - p, w = p > 0 ? Math.min(100, r / p * 100) : (r > 0 ? 100 : 0);
    return `<div class="rev"><b><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i>${esc(a.name)}</b><div class="bar"><span style="width:${w}%;background:${a.color}"></span></div>
      <small>${fmtH(r)} de ${fmtH(p)} planeadas <span class="${diff >= 0 ? 'ok' : 'low'}">(${diff >= 0 ? '+' : '−'}${fmtH(Math.abs(diff))})</span></small></div>`;
  }).join('') || '<p class="hint">Todavía no hay actividades.</p>';
}
$('#prev').onclick = () => { offset--; renderBal(); };
$('#next').onclick = () => { if (offset < 0) { offset++; renderBal(); } };
function score() {
  let p = 0, r = 0; S.activities.forEach(a => { const pl = planned(a.id); p += pl; r += Math.min(pl, realMin(a.id, offset) / 60); });
  $('#score b').textContent = String(p ? Math.round(r / p * 100) : 0).padStart(3, '0') + '%';
}
$('#exp').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  a.download = 'orbita-' + weekKey(0) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#imp').onchange = e => {
  const f = e.target.files[0]; if (!f) return; const rd = new FileReader();
  rd.onload = () => { try { S = clean(JSON.parse(rd.result)); save(); renderAll(); } catch (x) { alert('El archivo no es un respaldo válido de Órbita.'); } };
  rd.readAsText(f); e.target.value = '';
};

/* ---------- Cielo: ahora, leyenda y dibujo ---------- */
let nowKey = '';
function renderNow(force) {
  const t = S.timer, m = nowMin(), d = todayIdx(), b = t ? null : S.blocks.find(x => x.d === d && x.s <= m && m < x.e);
  const key = t ? 'T' + t.id : b ? 'B' + b.id : 'N';
  if (t) {
    const sec = Math.floor((Date.now() - t.start) / 1000), txt = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`;
    if (force || key !== nowKey) { const a = act(t.id); $('#now').innerHTML = `<span>Midiendo <b>${esc(a ? a.name : '')}</b><time></time></span><button class="run" data-n="stop">■ Detener</button>`; }
    $('#now time').textContent = txt;
  } else if (force || key !== nowKey) {
    $('#now').innerHTML = b ? `<span>Ahora: <b>${esc(lab(b))}</b> hasta ${hm(b.e)}</span><button data-n="start" data-a="${b.a}">▶ Medir</button>` : '<span>Ahora: sin bloque asignado</span>';
  }
  nowKey = key;
}
$('#now').onclick = e => { const n = e.target.dataset.n; if (n === 'stop') toggleTimer(S.timer.id); else if (n === 'start') toggleTimer(e.target.dataset.a); };
function renderLegend() {
  const list = S.activities.slice().sort((a, b) => (b.center ? 1 : 0) - (a.center ? 1 : 0));
  $('#legend').innerHTML = list.map(a => `<li><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i>${esc(a.name)}<b>${mode === 'plan' ? fmtH(planned(a.id)) : fmtH(val(a)) + ' de ' + fmtH(planned(a.id))}</b></li>`).join('');
}
const cv = $('#sky'), cx = cv.getContext('2d'), MONO = 'ui-monospace,Menlo,Consolas,monospace';
let W = 0, H = 0, stars = [], shot = null, nextShot = 2500;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize() {
  const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1; if (!r.width || !r.height) return;
  W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3, t: Math.random() * 6 }));
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(cv);
window.addEventListener('resize', resize);
function paint(t) {
  cx.clearRect(0, 0, W, H); cx.textAlign = 'center';
  stars.forEach(s => { cx.globalAlpha = .3 + .5 * Math.abs(Math.sin(t / 1300 + s.t)); cx.fillStyle = s.r > 1.3 ? '#27f5c9' : '#e6f1ff'; const z = s.r > 1.3 ? 2 : 1; cx.fillRect(Math.round(s.x), Math.round(s.y), z, z); });
  cx.globalAlpha = 1;
  if (!still) {
    if (!shot && t > nextShot) shot = { x: W * (.3 + Math.random() * .7), y: Math.random() * H * .35, t0: t };
    if (shot) {
      const k = (t - shot.t0) / 900;
      if (k > 1) { shot = null; nextShot = t + 5000 + Math.random() * 6000; }
      else {
        const x = shot.x - k * 240, y = shot.y + k * 120, g = cx.createLinearGradient(x, y, x + 70, y - 35);
        g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
        cx.strokeStyle = g; cx.lineWidth = 2; cx.globalAlpha = 1 - k; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + 70, y - 35); cx.stroke(); cx.globalAlpha = 1;
      }
    }
  }
  const core = S.activities.find(a => a.center), acts = S.activities.filter(a => !a.center), n = acts.length, x0 = W / 2, y0 = H / 2;
  const ax = W / 2 - 12, ay = H / 2 - 12, avail = Math.min(ax, ay), k = Math.min(1.7, Math.max(1, ax / ay)), sunR = Math.max(26, avail * .13);
  const maxH = Math.max(1, ...acts.map(a => Math.max(planned(a.id), realMin(a.id, offset) / 60)));
  const spacing = (avail - sunR - 6) / Math.max(n, 1), cap = Math.min(spacing * .8, 40), wide = W > 560;
  const pr = h => h <= 0 ? 0 : cap * (.3 + .7 * Math.sqrt(h / maxH));
  const g = cx.createRadialGradient(x0, y0, 2, x0, y0, sunR * 2.2);
  g.addColorStop(0, '#fff7c2'); g.addColorStop(.4, core ? core.color : '#ffd23f'); g.addColorStop(.5, 'rgba(255,210,63,.22)'); g.addColorStop(1, 'rgba(255,210,63,0)');
  cx.fillStyle = g; cx.beginPath(); cx.arc(x0, y0, sunR * 2.2, 0, 7); cx.fill();
  cx.fillStyle = '#1a1300'; cx.font = '700 11px ' + MONO;
  if (core) { cx.fillText(core.name.slice(0, 9), x0, y0 - 1); cx.fillText(fmtH(val(core)), x0, y0 + 12); }
  acts.forEach((a, i) => {
    const o = sunR + spacing * (i + .5), v = val(a), r = pr(v);
    const ang = i * 2.1 + (still ? 0 : t / 1000 * .35 / Math.pow(i + 1, .7)), ux = Math.cos(ang), uy = Math.sin(ang);
    const x = x0 + ux * o * k, y = y0 + uy * o;
    cx.strokeStyle = 'rgba(39,245,201,.14)'; cx.lineWidth = 1; cx.beginPath(); cx.ellipse(x0, y0, o * k, o, 0, 0, 7); cx.stroke();
    if (mode === 'real' && planned(a.id) > 0) {
      cx.setLineDash([3, 3]); cx.strokeStyle = a.color; cx.globalAlpha = .6;
      cx.beginPath(); cx.arc(x, y, pr(planned(a.id)) + 3, 0, 7); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1;
    }
    const rr = Math.max(r, 3);
    cx.globalAlpha = r ? 1 : .4; cx.shadowColor = a.color; cx.shadowBlur = 12; cx.fillStyle = a.color;
    cx.beginPath(); cx.arc(x, y, rr, 0, 7); cx.fill(); cx.shadowBlur = 0;
    cx.save(); cx.beginPath(); cx.arc(x, y, rr, 0, 7); cx.clip();
    cx.fillStyle = 'rgba(3,5,10,.5)'; cx.beginPath(); cx.arc(x + ux * rr * .5, y + uy * rr * .5, rr, 0, 7); cx.fill(); cx.restore();
    cx.globalAlpha = 1; cx.fillStyle = '#cfe3f5'; cx.font = (wide ? 11 : 10) + 'px ' + MONO;
    cx.fillText(wide ? `${a.name} · ${fmtH(v)}` : fmtH(v), x, y + rr + 12);
  });
  if (n) {
    const sa = still ? 1 : t / 2600, sx = x0 + Math.cos(sa) * avail * k, sy = y0 + Math.sin(sa) * avail;
    cx.fillStyle = '#e6f1ff'; cx.fillRect(sx - 2, sy - 2, 4, 4); cx.fillRect(sx - 6, sy - 1, 3, 2); cx.fillRect(sx + 3, sy - 1, 3, 2);
  } else { cx.fillStyle = '#8b9bb0'; cx.font = '13px ' + MONO; cx.fillText('Agregá una actividad para lanzar el primer planeta', x0, y0 + sunR * 2.4); }
}
function draw(t) {
  requestAnimationFrame(draw);
  if (W && H && cv.offsetParent !== null) { try { paint(t); } catch (e) { console.error(e); } }
}

/* ---------- Arranque ---------- */
function tick() {
  score(); renderNow(); renderLegend(); updNums();
  if ($('#v-bal').classList.contains('on')) renderBal();
  const m = nowMin(); if (m !== lastM) { lastM = m; if (!document.querySelector('dialog[open]')) renderDay(); }
}
function renderAll() { renderDay(); renderActs(); renderBal(); renderLegend(); renderNow(true); score(); }
renderAll(); resize(); setInterval(tick, 1000); requestAnimationFrame(draw);
})();
