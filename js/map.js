// Leaflet map: satellite tiles, building markers, path lines, overlays.
let map, group, satLayer;
const COL = ['#1f8a7a', '#f2a23a', '#7b61c9', '#d6455d', '#3b8fd9'];

function initMap() {
  map = L.map('map').fitBounds(Object.values(S.graph.buildings), {padding: [50, 50]});
  satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {maxZoom: 19, attribution: 'Tiles &copy; Esri'});
  group = L.layerGroup().addTo(map);
  let loaded = false, failed = 0;                                   // no internet -> switch to Graph view by itself
  satLayer.on('tileload', () => { loaded = true; });
  satLayer.on('tileerror', () => {
    if (!loaded && ++failed >= 3) { setBase('graph'); $('mapnote').textContent = 'Satellite tiles could not load (check your internet). Showing Graph view.'; }
  });
  setBase('sat');
}

function setBase(mode) {
  mode === 'sat' ? satLayer.addTo(map) : map.removeLayer(satLayer);
  $('vSat').classList.toggle('on', mode === 'sat');
  $('vGraph').classList.toggle('on', mode !== 'sat');
  $('map').classList.toggle('plain', mode !== 'sat');
}

function onPath(p, a, b) {
  for (let i = 0; i < p.length - 1; i++)
    if ((p[i] === a && p[i + 1] === b) || (p[i] === b && p[i + 1] === a)) return true;
  return false;
}

function drawMap() {
  group.clearLayers();
  const B = S.graph.buildings, R = S.run;
  const seen = S.stepIdx >= 0 ? R.steps.slice(0, S.stepIdx + 1).map(s => s.visit) : [];
  const cur = S.stepIdx >= 0 ? R.steps[S.stepIdx].visit : null;
  const sat = $('vSat').classList.contains('on');

  S.graph.edges.forEach(([a, b, w, stairs]) => {            // paths
    const k = a + '|' + b;
    let color = sat ? '#e9e4d2' : '#8aa59f', weight = 5, dash = null;
    if (S.blocked.has(k)) { color = '#d6455d'; dash = '8 8'; }
    else if (S.overlay === 'route' && S.stepIdx < 0 && onPath(R.path, a, b)) { color = '#f2a23a'; weight = 9; }
    else if (S.overlay === 'mst' && R.mst.includes(k)) { color = '#2fbf62'; weight = 8; }
    L.polyline([B[a], B[b]], {color: '#12332e', weight: weight + 4, opacity: .55, interactive: false}).addTo(group);   // dark outline
    L.polyline([B[a], B[b]], {color, weight, dashArray: dash})
      .addTo(group).bindTooltip(w + ' m' + (stairs ? ' (stairs)' : ''), {sticky: true})
      .on('click', () => toggleEdge(k));
  });

  Object.entries(B).forEach(([n, ll]) => {                  // buildings
    let fill = '#ffffff';
    if (S.overlay === 'color') fill = COL[R.colors[n] % 5];
    if (seen.includes(n)) fill = '#bfe6dd';
    if (n === cur) fill = '#f2a23a';
    if (n === S.start) fill = '#2f9e5b';
    if (n === R.target) fill = '#d6455d';
    L.circleMarker(ll, {radius: 11, color: '#12332e', weight: 3, fillColor: fill, fillOpacity: 1})
      .addTo(group).bindTooltip(n, {permanent: true, direction: 'bottom', offset: [0, 8], className: 'lbl'})
      .on('click', () => pickNode(n));
  });
}

// ---- Walker animation with ETA (demo runs 40x faster than real time) ----
let walkT = null, wl = null;
function stopWalk() {
  clearInterval(walkT); walkT = null;
  if (wl) { wl.remove(); wl = null; }
  $('walkBtn').textContent = '🚶 Walk this route'; $('eta').textContent = '';
}
function walk() {
  const R = S.run, B = S.graph.buildings;
  if (walkT) { stopWalk(); return; }
  if (R.path.length < 2) return;
  const total = R.leg_sec.reduce((x, y) => x + y, 0);               // seconds for the whole route
  let sim = 0;
  wl = L.marker(B[R.path[0]], {icon: L.divIcon({html: '🚶', className: 'walker', iconSize: [30, 30]}), interactive: false}).addTo(map);
  $('walkBtn').textContent = '⏹ Stop';
  walkT = setInterval(() => {
    sim += 2;
    if (sim >= total) {
      wl.setLatLng(B[R.path[R.path.length - 1]]); $('eta').textContent = 'Arrived ✅';
      clearInterval(walkT); walkT = null; $('walkBtn').textContent = '🚶 Walk again'; return;
    }
    let acc = 0;                                                    // find the leg we are on and move along it
    for (let i = 0; i < R.leg_sec.length; i++) {
      if (sim <= acc + R.leg_sec[i]) {
        const f = (sim - acc) / R.leg_sec[i], a = B[R.path[i]], b = B[R.path[i + 1]];
        wl.setLatLng([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); break;
      }
      acc += R.leg_sec[i];
    }
    const left = total - sim;
    $('eta').textContent = 'ETA: ' + (left >= 60 ? Math.ceil(left / 60) + ' min' : Math.ceil(left) + ' s') + ' left';
  }, 50);
}
