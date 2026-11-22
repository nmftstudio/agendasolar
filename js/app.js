(() => {
const SLOTS = 36, START = 6, DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const KEY = 'sistemaSolarTiempo.v1';
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad = n => String(n).padStart(2, '0');

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.activities) return s; } catch (e) {}
  return { activities: [
    { id: 'a1', name: 'Trabajo', color: '#ffd23f' }, { id: 'a2', name: 'Estudio', color: '#27f5c9' },
    { id: 'a3', name: 'Ejercicio', color: '#ff3d81' }, { id: 'a4', name: 'Descanso', color: '#8b7bff' }
  ], grid: {}, log: {}, timer: null };
}
let S = load(), mode = 'plan', offset = 0, sel = 'a1';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

function monday(off) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7);
  return d;
}
const weekKey = off => { const d = monday(off); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const planned = id => Object.values(S.grid).filter(v => v === id).length * 0.5;
function realMin(id, off) {
  let m = (S.log[weekKey(off)] || {})[id] || 0;
  if (off === 0 && S.timer && S.timer.id === id) m += (Date.now() - S.timer.start) / 60000;
  return m;
}
const fmt = h => h < 1 ? Math.round(h * 60) + ' min' : (Math.round(h * 10) / 10) + ' h';
const val = (a) => mode === 'plan' ? planned(a.id) : realMin(a.id, offset) / 60;

/* ---------- Actividades ---------- */
function renderActs() {
  $('#acts').innerHTML = `<li class="act ${sel === null ? 'sel' : ''}" data-id=""><i style="background:#555"></i><b>Borrador</b><span class="nums"><span>quita bloques del cronograma</span></span></li>` +
    S.activities.map(a => {
      const run = S.timer && S.timer.id === a.id;
      return `<li class="act ${sel === a.id ? 'sel' : ''}" data-id="${a.id}"><i style="background:${a.color}"></i><b>${esc(a.name)}</b>
      <span class="nums"><span class="pl" data-id="${a.id}"></span><span class="rl" data-id="${a.id}"></span></span>
      <span class="btns"><button data-act="tog" class="${run ? 'run' : ''}" title="Medir tiempo">${run ? '■' : '▶'}</button><button data-act="sub" title="Restar 30 min">−30</button><button data-act="add" title="Sumar 30 min">+30</button><button data-act="del" title="Eliminar">✕</button></span></li>`;
    }).join('');
  tick();
}
$('#acts').addEventListener('click', e => {
  const li = e.target.closest('.act'); if (!li) return;
  const id = li.dataset.id || null, act = e.target.dataset.act, wk = weekKey(0);
  if (!act) { sel = id; return renderActs(); }
  if (act === 'tog') {
    const was = S.timer && S.timer.id === id; stopTimer();
    if (!was) S.timer = { id, start: Date.now() };
  } else if (act === 'add' || act === 'sub') {
    S.log[wk] = S.log[wk] || {};
    S.log[wk][id] = Math.max(0, (S.log[wk][id] || 0) + (act === 'add' ? 30 : -30));
  } else if (act === 'del') {
    if (!confirm('¿Eliminar esta actividad y sus bloques?')) return;
    if (S.timer && S.timer.id === id) S.timer = null;
    S.activities = S.activities.filter(a => a.id !== id);
    Object.keys(S.grid).forEach(k => S.grid[k] === id && delete S.grid[k]);
    Object.values(S.log).forEach(w => delete w[id]);
    if (sel === id) sel = null;
    paintAll();
  }
  save(); renderActs();
});
function stopTimer() {
  if (!S.timer) return;
  const wk = weekKey(0), m = (Date.now() - S.timer.start) / 60000;
  S.log[wk] = S.log[wk] || {}; S.log[wk][S.timer.id] = (S.log[wk][S.timer.id] || 0) + m; S.timer = null;
}
$('#addForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#aName').value.trim(); if (!name) return;
  const id = 'a' + Date.now().toString(36);
  S.activities.push({ id, name, color: $('#aColor').value }); sel = id;
  $('#aName').value = ''; save(); renderActs();
});

/* ---------- Cronograma ---------- */
function buildGrid() {
  let h = '<div></div>' + DAYS.map((d, i) => `<div class="dh${i === (new Date().getDay() + 6) % 7 ? ' today' : ''}">${d}</div>`).join('');
  for (let s = 0; s < SLOTS; s++) {
    if (s % 2 === 0) h += `<div class="hr">${pad(START + s / 2)}:00</div>`;
    for (let d = 0; d < 7; d++) h += `<div class="cell ${s % 2 ? '' : 'h'}" data-k="${d}-${s}"></div>`;
  }
  $('#grid').innerHTML = h; paintAll();
}
function paintCell(c) {
  const a = S.activities.find(x => x.id === S.grid[c.dataset.k]);
  c.style.background = a ? a.color + 'cc' : '';
  c.title = a ? a.name : '';
}
const paintAll = () => document.querySelectorAll('.cell').forEach(paintCell);
let painting = false, erase = false;
function apply(c) {
  if (!c || !c.classList.contains('cell')) return;
  const k = c.dataset.k;
  if (erase) delete S.grid[k]; else S.grid[k] = sel;
  paintCell(c);
}
$('#grid').addEventListener('pointerdown', e => {
  const c = e.target.closest('.cell'); if (!c) return;
  e.preventDefault(); painting = true;
  erase = sel === null || S.grid[c.dataset.k] === sel; apply(c);
});
$('#grid').addEventListener('pointermove', e => {
  if (painting) apply(document.elementFromPoint(e.clientX, e.clientY));
});
window.addEventListener('pointerup', () => { if (painting) { painting = false; save(); tick(); } });
$('#clear').onclick = () => { if (confirm('¿Vaciar todo el cronograma?')) { S.grid = {}; save(); paintAll(); tick(); } };

/* ---------- Balance ---------- */
function tick() {
  score(); const nw = new Date(); $('#clock').textContent = pad(nw.getHours()) + ':' + pad(nw.getMinutes());
  document.querySelectorAll('.pl').forEach(e => e.textContent = 'plan ' + fmt(planned(e.dataset.id)));
  document.querySelectorAll('.rl').forEach(e => e.textContent = 'real ' + fmt(realMin(e.dataset.id, 0) / 60));
  const d = monday(offset);
  $('#weekLbl').textContent = (offset === 0 ? 'Esta semana · ' : 'Semana del ') + `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  $('#next').disabled = offset >= 0;
  $('#review').innerHTML = S.activities.map(a => {
    const p = planned(a.id), r = realMin(a.id, offset) / 60, diff = r - p;
    const w = p > 0 ? Math.min(100, r / p * 100) : (r > 0 ? 100 : 0);
    return `<div class="rev"><b><i style="background:${a.color}"></i>${esc(a.name)}</b>
      <div class="bar"><span style="width:${w}%;background:${a.color}"></span></div>
      <small>${fmt(r)} de ${fmt(p)} <span class="${diff >= 0 ? 'ok' : 'low'}">(${diff >= 0 ? '+' : '−'}${fmt(Math.abs(diff))})</span></small></div>`;
  }).join('') || '<p class="hint">Agregá una actividad para empezar.</p>';
}
$('#prev').onclick = () => { offset--; tick(); };
$('#next').onclick = () => { if (offset < 0) { offset++; tick(); } };
$('#modeSeg').addEventListener('click', e => {
  const m = e.target.dataset.m; if (!m) return; mode = m;
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
});

/* ---------- Cielo ---------- */
const cv = $('#sky'), cx = cv.getContext('2d'); let W, H, stars = [], shot = null, nextShot = 2500;
const MONO = 'ui-monospace,Menlo,Consolas,monospace';
function resize() {
  const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1; W = r.width; H = r.height;
  cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: 110 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3, t: Math.random() * 6 }));
}
new ResizeObserver(resize).observe(cv);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
function draw(t) {
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
  const acts = S.activities, n = acts.length, x0 = W / 2, y0 = H / 2;
  const avail = Math.min(W, H) / 2 - 12, sunR = Math.max(24, avail * .15);
  const maxH = Math.max(1, ...acts.map(a => Math.max(planned(a.id), realMin(a.id, offset) / 60)));
  const spacing = (avail - sunR - 8) / Math.max(n, 1), cap = Math.min(spacing * .46, 38);
  const pr = h => h <= 0 ? 0 : Math.max(5, cap * Math.sqrt(h / maxH));
  const total = acts.reduce((s, a) => s + val(a), 0);
  const g = cx.createRadialGradient(x0, y0, 2, x0, y0, sunR * 2.2);
  g.addColorStop(0, '#fff7c2'); g.addColorStop(.4, '#ffd23f'); g.addColorStop(.5, 'rgba(255,210,63,.22)'); g.addColorStop(1, 'rgba(255,210,63,0)');
  cx.fillStyle = g; cx.beginPath(); cx.arc(x0, y0, sunR * 2.2, 0, 7); cx.fill();
  cx.fillStyle = '#1a1300'; cx.font = '700 13px ' + MONO; cx.fillText(fmt(total), x0, y0 + 4);
  acts.forEach((a, i) => {
    const o = sunR + spacing * (i + .5), v = val(a), r = pr(v);
    const ang = i * 2.1 + (still ? 0 : t / 1000 * .35 / Math.pow(i + 1, .7)), ux = Math.cos(ang), uy = Math.sin(ang);
    const x = x0 + ux * o, y = y0 + uy * o;
    cx.strokeStyle = 'rgba(39,245,201,.14)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x0, y0, o, 0, 7); cx.stroke();
    if (mode === 'real' && planned(a.id) > 0) {
      cx.setLineDash([3, 3]); cx.strokeStyle = a.color; cx.globalAlpha = .6;
      cx.beginPath(); cx.arc(x, y, pr(planned(a.id)) + 3, 0, 7); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1;
    }
    const rr = Math.max(r, 3);
    cx.globalAlpha = r ? 1 : .4; cx.shadowColor = a.color; cx.shadowBlur = 14; cx.fillStyle = a.color;
    cx.beginPath(); cx.arc(x, y, rr, 0, 7); cx.fill(); cx.shadowBlur = 0;
    cx.save(); cx.beginPath(); cx.arc(x, y, rr, 0, 7); cx.clip();
    cx.fillStyle = 'rgba(3,5,10,.5)'; cx.beginPath(); cx.arc(x + ux * rr * .5, y + uy * rr * .5, rr, 0, 7); cx.fill(); cx.restore();
    cx.globalAlpha = 1; cx.fillStyle = '#cfe3f5'; cx.font = '11px ' + MONO;
    cx.fillText(`${a.name} · ${fmt(v)}`, x, y + rr + 14);
  });
  if (n) {
    const sa = still ? 1 : t / 2600, sx = x0 + Math.cos(sa) * avail, sy = y0 + Math.sin(sa) * avail;
    cx.fillStyle = '#e6f1ff'; cx.fillRect(sx - 2, sy - 2, 4, 4); cx.fillRect(sx - 6, sy - 1, 3, 2); cx.fillRect(sx + 3, sy - 1, 3, 2);
  } else { cx.fillStyle = '#7d8da1'; cx.font = '14px ' + MONO; cx.fillText('Agregá una actividad para lanzar el primer planeta', x0, y0 + sunR * 2.4); }
  requestAnimationFrame(draw);
}

/* ---------- Puntaje y respaldo ---------- */
function score() {
  let p = 0, r = 0;
  S.activities.forEach(a => { const pl = planned(a.id); p += pl; r += Math.min(pl, realMin(a.id, offset) / 60); });
  $('#score b').textContent = String(p ? Math.round(r / p * 100) : 0).padStart(3, '0') + '%';
}
$('#exp').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  a.download = 'orbita-' + weekKey(0) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#imp').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result); if (!Array.isArray(d.activities)) throw 0;
      S = { activities: d.activities.map(a => ({ id: String(a.id).replace(/[^\w-]/g, ''), name: String(a.name).slice(0, 24), color: /^#[0-9a-f]{6}$/i.test(a.color) ? a.color : '#888888' })), grid: d.grid || {}, log: d.log || {}, timer: null };
      if (!S.activities.some(a => a.id === sel)) sel = null;
      save(); paintAll(); renderActs();
    } catch (x) { alert('El archivo no es un respaldo válido de Órbita.'); }
  };
  rd.readAsText(f); e.target.value = '';
};

buildGrid(); renderActs(); setInterval(tick, 1000); requestAnimationFrame(draw);
})();
