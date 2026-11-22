(() => {
'use strict';
const KEY = 'orbita.v5';
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], D3 = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hm = m => m >= 1440 ? '24:00' : pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const toMin = v => { const [h, m] = v.split(':').map(Number); return h * 60 + m; };
const fmtM = m => { const h = Math.floor(m / 60), r = Math.round(m % 60); return h && r ? `${h} h ${r} min` : h ? `${h} h` : `${r} min`; };
const fmtH = h => h < 1 ? Math.round(h * 60) + ' min' : String(Math.round(h * 10) / 10).replace('.', ',') + ' h';
const uid = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
/* fechas (siempre locales, claves 'AAAA-MM-DD') */
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pdt = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dow = d => (d.getDay() + 6) % 7, monday = d => addD(d, -dow(d));
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const DRE = /^\d{4}-\d{2}-\d{2}$/;
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
function range(p, r) {
  if (p === 'w') { const a = monday(r); return [a, addD(a, 6)]; }
  if (p === 'm') return [new Date(r.getFullYear(), r.getMonth(), 1), new Date(r.getFullYear(), r.getMonth() + 1, 0)];
  return [new Date(r.getFullYear(), 0, 1), new Date(r.getFullYear(), 11, 31)];
}
const shift = (p, r, n) => p === 'w' ? addD(r, 7 * n) : p === 'm' ? new Date(r.getFullYear(), r.getMonth() + n, 1) : new Date(r.getFullYear() + n, 0, 1);
function perLabel(p, r) {
  const [a, b] = range(p, r);
  if (p === 'w') return `Semana ${isoWeek(a)} · ${a.getDate()}${a.getMonth() !== b.getMonth() ? ' ' + MES[a.getMonth()] : ''}–${b.getDate()} ${MES[b.getMonth()]}`;
  return p === 'm' ? `${MESL[r.getMonth()]} ${r.getFullYear()}` : `Año ${r.getFullYear()}`;
}

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
const yesterday = () => ds(addD(today(), -1));
function seed() {
  const tpl = [];
  SEMANA_A.forEach((day, d) => day.split(';').forEach(x => {
    const [r, a, t] = x.split(':'), [s, e] = r.split('-').map(v => Math.round(v * 60));
    tpl.push({ id: 'b' + tpl.length, d, s, e, a, t: t || '' });
  }));
  return { activities: ACTS.map(([id, name, color, c]) => ({ id, name, color, center: !!c })), tpl, days: {}, rec: [], frozen: yesterday() };
}
/* Modelo: tpl = semana regular; days[fecha] = día personalizado o ya registrado; rec = eventos que se repiten (cada mes / cada año) */
function clean(d) {
  if (!d || !Array.isArray(d.activities)) throw new Error('formato');
  const activities = d.activities.map(a => ({ id: String(a.id).replace(/[^\w-]/g, ''), name: String(a.name).slice(0, 40), color: /^#[0-9a-f]{6}$/i.test(a.color) ? a.color : '#888888', center: !!a.center }));
  const ids = new Set(activities.map(a => a.id)), ok = b => b && ids.has(b.a) && b.s >= 0 && b.e <= 1440 && b.s < b.e, tt = b => String(b.t || '').slice(0, 40);
  const tpl = (d.tpl || d.blocks || []).filter(b => ok(b) && b.d >= 0 && b.d < 7).map((b, i) => ({ id: 'b' + i, d: b.d | 0, s: b.s | 0, e: b.e | 0, a: b.a, t: tt(b) }));
  const days = {};
  Object.entries(d.days || {}).forEach(([k, l]) => { if (DRE.test(k) && Array.isArray(l)) days[k] = l.filter(ok).map((b, i) => ({ id: 'k' + i, s: b.s | 0, e: b.e | 0, a: b.a, t: tt(b) })); });
  const rec = (d.rec || []).filter(r => ok(r) && (r.k === 'y' || r.k === 'm')).map((r, i) => ({ id: 'r' + i, k: r.k, m: r.m | 0, dd: r.dd | 0, s: r.s | 0, e: r.e | 0, a: r.a, t: tt(r) }));
  return { activities, tpl, days, rec, frozen: DRE.test(d.frozen) ? d.frozen : yesterday() };
}
function load() {
  for (const k of [KEY, 'orbita.v4']) { try { const s = JSON.parse(localStorage.getItem(k)); if (s && s.activities && (s.tpl || s.blocks)) return clean(s); } catch (e) {} }
  return seed();
}
let S = load(), per = 'w', pref = today(), sel = ds(today()), wd = dow(today()), ctx = null, editA = null, selDays = new Set(), ST = { mins: {}, days: 1, buckets: [] }, lastDay = ds(today()), lastMin = -1, lastNow = '';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const act = id => S.activities.find(a => a.id === id);
const lab = b => b.t || (act(b.a) || {}).name || '';
const planned = id => (ST.mins[id] || 0) / 60;

/* ---------- Lógica de agenda ---------- */
const clone = b => ({ id: b.id, s: b.s, e: b.e, a: b.a, t: b.t || '' });
function place(list, nb) { // el bloque nuevo se hace lugar: recorta o reemplaza lo que haya en su horario
  const out = [];
  list.forEach(b => {
    if (b.e <= nb.s || nb.e <= b.s) { out.push(b); return; }
    const head = b.s < nb.s, tail = b.e > nb.e;
    if (head) out.push({ ...b, e: nb.s });
    if (tail) out.push({ ...b, id: head ? uid() : b.id, s: nb.e });
  });
  out.push(nb); return out.sort((a, b) => a.s - b.s);
}
const tplDay = d => S.tpl.filter(b => b.d === d).sort((a, b) => a.s - b.s);
function tplPlace(d, nb) { S.tpl = S.tpl.filter(b => b.d !== d).concat(place(tplDay(d), { ...nb, d })); }
const recHit = (r, d) => r.dd === d.getDate() && (r.k === 'm' || r.m === d.getMonth() + 1);
function proj(k) { // lo proyectado: semana regular + eventos que se repiten
  const d = pdt(k); let l = tplDay(dow(d)).map(b => ({ ...clone(b), src: 't' }));
  S.rec.forEach(r => { if (recHit(r, d)) l = place(l, { ...clone(r), src: 'r' }); });
  return l;
}
const dayBlocks = k => S.days[k] ? S.days[k].map(b => ({ ...b, src: 'd' })).sort((a, b) => a.s - b.s) : proj(k);
function custom(k) { if (!S.days[k]) S.days[k] = proj(k).map(clone); return S.days[k]; }
function freeze() { // la bitácora registra cada día que pasa tal como estaba planificado
  const y = yesterday(); if (S.frozen >= y) return;
  let d = addD(pdt(S.frozen), 1);
  for (let i = 0; ds(d) <= y && i < 4000; i++, d = addD(d, 1)) { const k = ds(d); if (!S.days[k]) S.days[k] = proj(k).map(clone); }
  S.frozen = y; save();
}
function recalc() {
  const [a, b] = range(per, pref), mins = {}, bk = []; let n = 0;
  for (let d = a; d <= b; d = addD(d, 1), n++) {
    const i = per === 'y' ? d.getMonth() : n;
    const bb = bk[i] || (bk[i] = { m: {}, label: per === 'y' ? MES[i] : per === 'w' ? 'LMXJVSD'[i] : (i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : ''), title: per === 'y' ? MESL[i] : `${D3[dow(d)]} ${d.getDate()}` });
    dayBlocks(ds(d)).forEach(x => { const m = x.e - x.s; mins[x.a] = (mins[x.a] || 0) + m; bb.m[x.a] = (bb.m[x.a] || 0) + m; });
  }
  ST = { mins, days: n, buckets: bk };
}

/* ---------- Pestañas y periodo ---------- */
function show(v) {
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  try { window.scrollTo(0, 0); } catch (e) {} resize();
}
$('.tabs').onclick = e => { if (e.target.dataset.v) show(e.target.dataset.v); };
function renderPer() {
  const h = `<div class="seg">${[['w', 'Semana'], ['m', 'Mes'], ['y', 'Año']].map(([k, n]) => `<button data-p="${k}" class="${k === per ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div class="weeknav"><button data-n="-1" aria-label="Anterior">‹</button><span>${perLabel(per, pref)}</span><button data-n="1" aria-label="Siguiente">›</button><button data-n="0">Hoy</button></div>`;
  $$('.per').forEach(p => { p.innerHTML = h; });
}
document.addEventListener('click', e => {
  const b = e.target.closest('.per button'); if (!b) return;
  if (b.dataset.p) per = b.dataset.p; else if (b.dataset.n != null) pref = b.dataset.n === '0' ? today() : shift(per, pref, +b.dataset.n); else return;
  recalc(); renderPer(); renderLegend(); renderActs(); renderBal();
});

/* ---------- Listas de bloques (bitácora y semana regular) ---------- */
function blockHTML(b, pl, nl, now) {
  const a = act(b.a) || { name: '?', color: '#888' }, r = b.src === 'r' ? S.rec.find(x => x.id === b.id) : null;
  const prev = b.s === 0 && pl.some(x => x.e === 1440 && x.a === b.a), next = b.e === 1440 && nl.some(x => x.s === 0 && x.a === b.a);
  const extra = [b.t ? esc(a.name) : '', fmtM(b.e - b.s), prev ? 'viene de ayer' : '', next ? 'sigue mañana' : '', r ? (r.k === 'y' ? 'se repite cada año' : 'se repite cada mes') : '', now ? 'ahora' : ''].filter(Boolean).join(' · ');
  return `<button class="blk${now ? ' now' : ''}" data-b="${b.id}" style="border-left-color:${a.color}"><span class="tm">${hm(b.s)}<br>${hm(b.e)}</span><span><b>${esc(lab(b))}</b><small>${extra}</small></span></button>`;
}
function listHTML(bl, pl, nl, isToday) {
  let h = '', cur = 0; const m = nowMin();
  const gap = (s, e) => { if (e - s >= 15) h += `<button class="gap" data-new="${s}-${e}">+ Sin asignar ${hm(s)} – ${hm(e)}<small>${fmtM(e - s)}</small></button>`; };
  bl.forEach(b => { gap(cur, b.s); h += blockHTML(b, pl, nl, isToday && m >= b.s && m < b.e); cur = Math.max(cur, b.e); }); gap(cur, 1440);
  return h;
}
const usedOf = bl => bl.reduce((t, b) => t + b.e - b.s, 0);
const firstGap = bl => { let cur = 0; for (const b of bl) { if (b.s - cur >= 30) return [cur, Math.min(b.s, cur + 60)]; cur = Math.max(cur, b.e); } return 1440 - cur >= 30 ? [cur, Math.min(1440, cur + 60)] : null; };
function renderBit() {
  const sd = pdt(sel), mon = monday(sd), t = ds(today()), cust = !!S.days[sel], past = sel < t;
  $('#bLbl').textContent = perLabel('w', mon); $('#bGo').value = sel;
  $('#dTabs').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addD(mon, i), k = ds(d); return `<button data-k="${k}" class="${k === sel ? 'on' : ''}${k === t ? ' hoy' : ''}">${D3[i]}<small>${d.getDate()}${S.days[k] ? ' •' : ''}</small></button>`; }).join('');
  const bl = dayBlocks(sel), used = usedOf(bl);
  const note = past ? (cust ? 'Registrado: así quedó este día en la bitácora.' : 'Sin registro de este día (se muestra la semana regular).') : cust ? 'Día personalizado: ya no sigue los cambios de la semana regular.' : 'Sigue la semana regular. Si agregás o cambiás un bloque, este día queda personalizado.';
  $('#blocks').innerHTML = `<div class="dayhead"><h2>${DAYS[dow(sd)]} ${sd.getDate()} de ${MESL[sd.getMonth()].toLowerCase()}${sel === t ? ' · hoy' : ''}</h2><span>${fmtM(used)} asignadas · ${fmtM(1440 - used)} libres</span></div><p class="hint">${note}</p>`
    + (cust && !past ? '<button class="ghost rst" data-r="1">Volver a la semana regular</button>' : '')
    + listHTML(bl, dayBlocks(ds(addD(sd, -1))), dayBlocks(ds(addD(sd, 1))), sel === t);
}
function renderTpl() {
  const t = dow(today()), bl = tplDay(wd), used = usedOf(bl);
  $('#wTabs').innerHTML = D3.map((n, i) => `<button data-d="${i}" class="${i === wd ? 'on' : ''}${i === t ? ' hoy' : ''}">${n}</button>`).join('');
  $('#wBlocks').innerHTML = `<div class="dayhead"><h2>${DAYS[wd]}</h2><span>${fmtM(used)} asignadas · ${fmtM(1440 - used)} libres</span></div>` + listHTML(bl, tplDay((wd + 6) % 7), tplDay((wd + 1) % 7), false);
}
$('#bPrev').onclick = () => { sel = ds(addD(pdt(sel), -7)); renderBit(); };
$('#bNext').onclick = () => { sel = ds(addD(pdt(sel), 7)); renderBit(); };
$('#bHoy').onclick = () => { sel = ds(today()); renderBit(); };
$('#bGo').onchange = e => { if (DRE.test(e.target.value)) { sel = e.target.value; renderBit(); } };
$('#dTabs').onclick = e => { const b = e.target.closest('[data-k]'); if (b) { sel = b.dataset.k; renderBit(); } };
$('#wTabs').onclick = e => { if (e.target.dataset.d != null) { wd = +e.target.dataset.d; renderTpl(); } };
$('#blocks').onclick = e => {
  const g = e.target.closest('[data-new]'), b = e.target.closest('[data-b]');
  if (e.target.closest('[data-r]')) { if (confirm('¿Volver a la semana regular para este día? Se pierden sus cambios.')) { delete S.days[sel]; save(); renderAll(); } }
  else if (g) openBlock('d', null, g.dataset.new.split('-').map(Number));
  else if (b) openBlock('d', dayBlocks(sel).find(x => x.id === b.dataset.b));
};
$('#wBlocks').onclick = e => {
  const g = e.target.closest('[data-new]'), b = e.target.closest('[data-b]');
  if (g) openBlock('t', null, g.dataset.new.split('-').map(Number)); else if (b) openBlock('t', S.tpl.find(x => x.id === b.dataset.b));
};
$('#addD').onclick = () => openBlock('d', null, firstGap(dayBlocks(sel)));
$('#addW').onclick = () => openBlock('t', null, firstGap(tplDay(wd)));

/* ---------- Editor de bloques ---------- */
const dB = $('#dB');
const chips = () => { $('#bD').innerHTML = D3.map((n, i) => `<button type="button" data-d="${i}" class="${selDays.has(i) ? 'on' : ''}">${n}</button>`).join(''); };
function openBlock(mode, b, pre) {
  ctx = { mode, b: b || null, date: sel }; const s = b ? b.s : pre ? pre[0] : 480, e = b ? b.e : pre ? pre[1] : 540;
  $('#dBt').textContent = b ? 'Editar bloque' : 'Nuevo bloque';
  $('#bA').innerHTML = S.activities.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
  $('#bA').value = b ? b.a : (S.activities.find(a => !a.center) || S.activities[0] || {}).id;
  $('#bT').value = b ? b.t || '' : ''; $('#bS').value = hm(s); $('#bE').value = e >= 1440 ? '00:00' : hm(e);
  $('#bWK').hidden = mode !== 't'; $('#bDT').hidden = mode !== 'd';
  const r = b && b.src === 'r' ? S.rec.find(x => x.id === b.id) : null;
  if (mode === 't') { selDays = new Set([b ? b.d : wd]); chips(); } else { $('#bF').value = sel; $('#bU').value = ''; $('#bR').value = r ? r.k : ''; }
  const h = $('#bH'); h.classList.remove('err');
  h.textContent = (mode === 't' ? 'Reemplaza lo que haya en ese horario de la semana regular.' : r ? 'Es un evento que se repite: al guardar cambia en todas sus repeticiones.' : 'Reemplaza lo que haya en ese horario, solo en la fecha elegida.') + ' Si "Hasta" es anterior a "Desde", el bloque sigue después de medianoche.';
  $('#bDel').hidden = !b; dB.showModal();
}
$('#bD').onclick = e => {
  if (e.target.dataset.d == null) return; const d = +e.target.dataset.d;
  if (selDays.has(d)) { if (selDays.size > 1) selDays.delete(d); } else selDays.add(d); chips();
};
$('#bX').onclick = () => dB.close();
function bErr(m) { const h = $('#bH'); h.textContent = m; h.classList.add('err'); }
function removeOrig() {
  const b = ctx.b; if (!b) return;
  if (b.src === 'r') S.rec = S.rec.filter(r => r.id !== b.id); else S.days[ctx.date] = custom(ctx.date).filter(x => x.id !== b.id);
}
const put = (k, nb) => { S.days[k] = place(custom(k), nb); };
$('#fB').onsubmit = e => {
  e.preventDefault();
  const a = $('#bA').value, t = $('#bT').value.trim(), s = toMin($('#bS').value); let en = toMin($('#bE').value);
  if (en === 0 && s > 0) en = 1440;
  if (en === s) return bErr('El inicio y el fin no pueden ser iguales.');
  const cross = en < s;
  if (ctx.mode === 't') {
    if (ctx.b) S.tpl = S.tpl.filter(x => x.id !== ctx.b.id);
    selDays.forEach(d => { if (cross) { tplPlace(d, { id: uid(), s, e: 1440, a, t }); tplPlace((d + 1) % 7, { id: uid(), s: 0, e: en, a, t }); } else tplPlace(d, { id: uid(), s, e: en, a, t }); });
  } else {
    const f = $('#bF').value, u = $('#bU').value, rep = $('#bR').value;
    if (!f) return bErr('Elegí una fecha.');
    if (u && u < f) return bErr('La fecha final es anterior a la inicial.');
    if (rep && (u || cross)) return bErr('Un evento que se repite no puede abarcar varios días ni cruzar la medianoche.');
    removeOrig();
    if (rep) { const d = pdt(f); S.rec.push({ id: uid(), k: rep, m: d.getMonth() + 1, dd: d.getDate(), s, e: en, a, t }); }
    else for (let d = pdt(f); ds(d) <= (u || f); d = addD(d, 1)) {
      put(ds(d), { id: uid(), s, e: cross ? 1440 : en, a, t });
      if (cross) put(ds(addD(d, 1)), { id: uid(), s: 0, e: en, a, t });
    }
    sel = f;
  }
  save(); dB.close(); renderAll();
};
$('#bDel').onclick = () => {
  const b = ctx && ctx.b; if (!b) return;
  if (!confirm(b.src === 'r' ? 'Es un evento que se repite: se elimina de todas sus repeticiones. ¿Seguir?' : '¿Eliminar este bloque?')) return;
  if (ctx.mode === 't') S.tpl = S.tpl.filter(x => x.id !== b.id); else removeOrig();
  save(); dB.close(); renderAll();
};

/* ---------- Planetas ---------- */
function renderActs() {
  $('#actHint').textContent = `Horas de ${perLabel(per, pref).toLowerCase()}. Tocá un planeta para editarlo.`;
  $('#acts').innerHTML = S.activities.map(a => `<li><button class="arow" data-e="${a.id}"><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i><span><b>${esc(a.name)}${a.center ? ' · centro' : ''}</b><small>${fmtH(planned(a.id))}</small></span></button></li>`).join('');
}
$('#acts').onclick = e => { const r = e.target.closest('[data-e]'); if (r) openAct(r.dataset.e); };
$('#addA').onclick = () => openAct(null);
const dA = $('#dA');
function openAct(id) {
  editA = id ? act(id) : null; $('#dAt').textContent = editA ? 'Editar planeta' : 'Nuevo planeta';
  $('#aN').value = editA ? editA.name : ''; $('#aC').value = editA ? editA.color : '#27f5c9'; $('#aK').checked = !!(editA && editA.center);
  $('#aDel').hidden = !editA; dA.showModal();
}
$('#aX').onclick = () => dA.close();
$('#fA').onsubmit = e => {
  e.preventDefault();
  const name = $('#aN').value.trim(), color = $('#aC').value, center = $('#aK').checked; if (!name) return;
  if (center) S.activities.forEach(a => { a.center = false; });
  if (editA) Object.assign(editA, { name, color, center }); else S.activities.push({ id: uid(), name, color, center });
  save(); dA.close(); renderAll();
};
$('#aDel').onclick = () => {
  if (!editA || !confirm('¿Eliminar este planeta? También se borran sus bloques de la semana regular y de la bitácora.')) return;
  const id = editA.id; S.activities = S.activities.filter(a => a.id !== id); S.tpl = S.tpl.filter(b => b.a !== id); S.rec = S.rec.filter(r => r.a !== id);
  Object.keys(S.days).forEach(k => { S.days[k] = S.days[k].filter(b => b.a !== id); });
  save(); dA.close(); renderAll();
};

/* ---------- Balance (según lo proyectado en cada periodo) ---------- */
function renderBal() {
  const total = ST.days * 1440, rows = S.activities.map(a => ({ a, m: ST.mins[a.id] || 0 })), asg = rows.reduce((t, r) => t + r.m, 0);
  rows.push({ a: { name: 'Sin asignar', color: '#4a5870' }, m: Math.max(0, total - asg) });
  $('#review').innerHTML = rows.map(({ a, m }) => { const p = total ? m / total * 100 : 0; return `<div class="rev"><b><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i>${esc(a.name)}</b><div class="bar"><span style="width:${p}%;background:${a.color}"></span></div><small>${fmtH(m / 60)} · ${Math.round(p)}%</small></div>`; }).join('');
  const bk = ST.buckets.filter(Boolean), mx = Math.max(1, ...bk.map(b => Object.values(b.m).reduce((t, v) => t + v, 0)));
  $('#stack').innerHTML = bk.map(b => `<div class="col" title="${esc(b.title)}"><div class="seg2">${S.activities.map(a => b.m[a.id] ? `<span style="height:${b.m[a.id] / mx * 100}%;background:${a.color}" title="${esc(a.name)}: ${fmtH(b.m[a.id] / 60)}"></span>` : '').join('')}</div><small>${b.label}</small></div>`).join('');
}
$('#exp').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  a.download = 'orbita-' + ds(today()) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#imp').onchange = e => {
  const f = e.target.files[0]; if (!f) return; const rd = new FileReader();
  rd.onload = () => { try { S = clean(JSON.parse(rd.result)); freeze(); save(); renderAll(); } catch (x) { alert('El archivo no es un respaldo válido de Órbita.'); } };
  rd.readAsText(f); e.target.value = '';
};

/* ---------- Cielo ---------- */
function renderNow() {
  const l = dayBlocks(ds(today())), m = nowMin(), b = l.find(x => x.s <= m && m < x.e), n = l.find(x => x.s > m);
  const h = b ? `Ahora: <b>${esc(lab(b))}</b> hasta ${hm(b.e)}${n && n.s === b.e ? ` · luego ${esc(lab(n))}` : ''}` : n ? `Libre hasta ${hm(n.s)} · luego <b>${esc(lab(n))}</b>` : 'Sin más bloques por hoy';
  if (h !== lastNow) { lastNow = h; $('#now').innerHTML = `<span>${h}</span>`; }
}
function renderHead() { const t = today(); $('#score b').textContent = 'Semana ' + isoWeek(t); $('#score span').textContent = `${D3[dow(t)].toLowerCase()} ${t.getDate()} ${MES[t.getMonth()]} ${t.getFullYear()}`; }
function renderLegend() {
  $('#legend').innerHTML = S.activities.slice().sort((a, b) => (b.center ? 1 : 0) - (a.center ? 1 : 0)).map(a => `<li><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i>${esc(a.name)}<b>${fmtH(planned(a.id))}</b></li>`).join('');
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
  const maxH = Math.max(1, ...acts.map(a => planned(a.id)));
  const spacing = (avail - sunR - 6) / Math.max(n, 1), cap = Math.min(spacing * .8, 40), wide = W > 560;
  const pr = h => h <= 0 ? 0 : cap * (.3 + .7 * Math.sqrt(h / maxH));
  const g = cx.createRadialGradient(x0, y0, 2, x0, y0, sunR * 2.2);
  g.addColorStop(0, '#fff7c2'); g.addColorStop(.4, core ? core.color : '#ffd23f'); g.addColorStop(.5, 'rgba(255,210,63,.22)'); g.addColorStop(1, 'rgba(255,210,63,0)');
  cx.fillStyle = g; cx.beginPath(); cx.arc(x0, y0, sunR * 2.2, 0, 7); cx.fill();
  cx.fillStyle = '#1a1300'; cx.font = '700 11px ' + MONO;
  if (core) { cx.fillText(core.name.slice(0, 9), x0, y0 - 1); cx.fillText(fmtH(planned(core.id)), x0, y0 + 12); }
  acts.forEach((a, i) => {
    const o = sunR + spacing * (i + .5), v = planned(a.id), r = pr(v);
    const ang = i * 2.1 + (still ? 0 : t / 1000 * .35 / Math.pow(i + 1, .7)), ux = Math.cos(ang), uy = Math.sin(ang);
    const x = x0 + ux * o * k, y = y0 + uy * o;
    cx.strokeStyle = 'rgba(39,245,201,.14)'; cx.lineWidth = 1; cx.beginPath(); cx.ellipse(x0, y0, o * k, o, 0, 0, 7); cx.stroke();
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
  } else { cx.fillStyle = '#8b9bb0'; cx.font = '13px ' + MONO; cx.fillText('Agregá un planeta para empezar', x0, y0 + sunR * 2.4); }
}
function draw(t) {
  requestAnimationFrame(draw);
  if (W && H && cv.offsetParent !== null) { try { paint(t); } catch (e) { console.error(e); } }
}

/* ---------- Arranque ---------- */
function renderAll() { recalc(); renderHead(); renderPer(); renderLegend(); renderActs(); renderBal(); renderBit(); renderTpl(); lastNow = ''; renderNow(); }
function tick() {
  const k = ds(today()), busy = document.querySelector('dialog[open]');
  if (k !== lastDay && !busy) { lastDay = k; freeze(); renderAll(); return; }
  renderNow(); const m = nowMin();
  if (m !== lastMin && !busy) { lastMin = m; renderBit(); }
}
freeze(); renderAll(); resize(); setInterval(tick, 1000); requestAnimationFrame(draw);
})();
