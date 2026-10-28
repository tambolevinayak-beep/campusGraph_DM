// Start-up, shared state, tabs, theme and events.
const S = {graph: null, run: null, start: 'Gate', end: 'Library', via: '', type: 'short', blocked: new Set(), overlay: 'route', stepIdx: -1};
const $ = id => document.getElementById(id);
const short = n => n.split(' ')[0].slice(0, 4);
const tr = (t, ...c) => `<tr>${c.map(x => `<${t}>${x}</${t}>`).join('')}</tr>`;
const tag = (ok, yes, no) => `<span class="tag ${ok ? 'good' : 'warn'}">${ok ? yes : no}</span>`;
const ICON = {"Gate": "🚪", "Parking": "🅿️", "Medical Room": "🏥", "Admin Office": "🗂️", "Bank ATM": "🏧", "Main Bldg": "🏛️", "Auditorium": "🎭", "Library": "📚", "Comp Lab": "💻", "Canteen": "🍴", "Seminar Hall": "🎤", "Exam Hall": "📝", "Garden": "🌳", "Workshop": "🛠️", "Playground": "⚽", "Hostel": "🛏️"};
let pickNext = 'start';

function pickNode(n) {                       // first click = start, second = destination
  if (pickNext === 'start') { S.start = n; pickNext = 'end'; } else { S.end = n; pickNext = 'start'; }
  refresh();
}
function toggleEdge(k) { S.blocked.has(k) ? S.blocked.delete(k) : S.blocked.add(k); refresh(); }
const crowdState = () => ({on: $('crowdOn').checked, hour: +$('clock').value});   // time-of-day crowding settings
function clockTxt() {
  const t = +$('clock').value, h = Math.floor(t), m = Math.round((t - h) * 60);
  $('clockTxt').textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ($('crowdOn').checked ? '' : ' (crowds off)');
}

async function refresh() {
  stopPlay(); stopWalk(); S.stepIdx = -1; clockTxt();
  S.run = await api.run({start: S.start, end: S.end, via: S.via, type: S.type, blocked: [...S.blocked], crowd: crowdState()});
  $('start').value = S.start; $('end').value = S.end;
  drawMap(); showNavigate(); showAnalysis(); showSteps();
}

async function init() {
  S.graph = await api.graph();
  const names = Object.keys(S.graph.buildings);
  ['start', 'end', 'stops'].forEach(id => $(id).innerHTML = names.map(n => `<option>${n}</option>`).join(''));
  $('via').innerHTML = '<option value="">No stop</option>' + names.map(n => `<option>${n}</option>`).join('');
  initMap(); initQuick(); initSteps();

  $('start').onchange = e => { S.start = e.target.value; refresh(); };
  $('end').onchange = e => { S.end = e.target.value; refresh(); };
  $('swap').onclick = () => { [S.start, S.end] = [S.end, S.start]; refresh(); };
  $('find').onclick = refresh;
  $('via').onchange = e => { S.via = e.target.value; refresh(); };
  $('crowdOn').onchange = refresh;
  $('clock').oninput = refresh;
  $('walkBtn').onclick = walk;
  $('reset').onclick = () => { S.blocked.clear(); refresh(); };
  $('overlay').onchange = e => { S.overlay = e.target.value; drawMap(); };
  $('vSat').onclick = () => { setBase('sat'); drawMap(); };
  $('vGraph').onclick = () => { setBase('graph'); drawMap(); };
  document.querySelectorAll('#rtypes button').forEach(b => b.onclick = () => {
    S.type = b.dataset.r;
    document.querySelectorAll('#rtypes button').forEach(x => x.classList.toggle('ghost', x !== b));
    refresh();
  });
  document.querySelectorAll('aside [data-tab]').forEach(b => b.onclick = () => {
    document.querySelectorAll('aside [data-tab]').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.id === 'tab-' + b.dataset.tab));
  });
  $('theme').onclick = () => { const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'dark' ? '' : 'dark'; };
  $('date').textContent = '📅 ' + new Date().toLocaleDateString(undefined, {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
  refresh();
}
init();
