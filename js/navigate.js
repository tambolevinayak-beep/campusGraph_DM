// Route cards: stats, summary, details, compare table, nearby, quick access, live updates, TSP.
const photo = n => `<div class="ph"><span>${ICON[n] || '📍'}</span><img src="images/${encodeURIComponent(n)}.jpg" alt="" onerror="this.remove()"></div>`;
const KIND = {short: 'Shortest route (Dijkstra)', acc: 'Accessible route (no stairs)', emg: 'Nearest emergency exit'};
const edgeW = (a, b) => { const e = S.graph.edges.find(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)); return e ? e[2] : '?'; };

function showNavigate() {
  const R = S.run;
  $('stats').innerHTML = [[R.order.length, '🏢 Buildings'], [R.edge_count, '🛤️ Paths'], [R.avg_degree, '🔗 Average degree'],
    [R.connected ? 'Yes' : 'No', '✅ Fully connected'], [R.total_routes + (R.routes_capped ? '+' : ''), '🔀 Routes found']]
    .map(([v, l]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join('');

  $('kind').textContent = KIND[S.type];
  if (!R.path.length) {
    $('dist').textContent = 'No route'; $('chips').innerHTML = '';
    $('time').textContent = 'These buildings are cut off. Unblock a path to reconnect them.';
    $('steps2').innerHTML = '<li>No route available</li>';
  } else {
    $('dist').textContent = R.raw + ' m';
    $('chips').innerHTML = R.path.map((n, i) => `<span class="chip ${i === 0 ? 's' : i === R.path.length - 1 ? 'e' : ''}">${n}</span>`).join('');
    $('time').textContent = `About ${R.minutes} min walking at 1.5 m/s` + (R.metres > R.raw ? `, including a crowd delay of ${((R.metres - R.raw) / 1.5 / 60).toFixed(1)} min.` : '.') + (R.via ? ` Stop on the way: ${R.via}.` : '');
    $('steps2').innerHTML = `<li>Start at <b>${R.path[0]}</b></li>` +
      R.path.slice(1).map((n, i) => `<li>Walk to <b>${n}</b> (${R.leg_raw[i]} m)</li>`).join('') + `<li>Reach <b>${R.target}</b></li>`;
  }
  $('routes').innerHTML = tr('th', 'Route', $('crowdOn').checked ? 'Cost with crowds' : 'Distance') +
    R.top_routes.map((r, i) => tr('td', (i ? '' : '<span class="tag good">Best</span> ') + r.path.map(short).join(' > '), r.metres + ' m')).join('');
  $('bfsNote').textContent = R.bfs_metres && R.bfs_metres > R.metres
    ? `Fewest stops gives ${R.bfs_metres} m, but Dijkstra finds ${R.metres} m.` : '';

  const d = R.near;                                          // nearby = closest buildings by Dijkstra distance
  $('near').innerHTML = Object.keys(d).filter(n => n !== S.start).sort((a, b) => d[a] - d[b]).slice(0, 4)
    .map(n => `<button class="nc" data-n="${n}">${photo(n)}<b>${n}</b><span class="d">${(d[n] / 1.5 / 60).toFixed(1)} min, ${d[n]} m</span></button>`).join('');

  $('live').innerHTML = (S.blocked.size ? [...S.blocked].map(k => `<li><span class="tag warn">Closed</span> ${k.replace('|', ' - ')}. Alternative route used.</li>`).join('')
    : '<li><span class="tag good">All clear</span> No paths are blocked.</li>') +
    (S.type === 'emg' ? `<li><span class="tag warn">Emergency</span> Nearest exit: <b>${R.target}</b></li>` : '') +
    (S.type === 'acc' ? '<li><span class="tag good">Accessible</span> Stair paths are avoided.</li>' : '');
}

function initQuick() {
  $('quick').innerHTML = Object.keys(S.graph.buildings).map(n => `<button class="qt" data-n="${n}"><span>${ICON[n] || '📍'}</span>${n}</button>`).join('');
  [$('quick'), $('near')].forEach(box => box.onclick = e => {
    const b = e.target.closest('button');
    if (b) { S.end = b.dataset.n; refresh(); }
  });
  $('tspBtn').onclick = async () => {
    const stops = [...$('stops').selectedOptions].map(o => o.value).filter(n => n !== S.start);
    if (stops.length < 2 || stops.length > 5) { $('tspOut').textContent = 'Select 2 to 5 stops (not the start).'; return; }
    const r = await api.tsp({start: S.start, stops, blocked: [...S.blocked], crowd: crowdState()});
    $('tspOut').textContent = r.error || `Best order (${r.metres} m): ${r.route.join(' > ')}`;
  };
}
