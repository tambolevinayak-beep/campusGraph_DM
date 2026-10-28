// Dijkstra step table, Play animation, and the BFS vs Dijkstra comparison.
let timer = null;

function showSteps() {
  const R = S.run;
  $('steps').innerHTML = tr('th', 'Step', 'Visit', ...R.order.map(short)) +
    R.steps.map((s, i) => `<tr class="${i === S.stepIdx ? 'hl' : ''}">${[i + 1, '<b>' + s.visit + '</b>', ...R.order.map(n => s.dist[n] === null ? '&infin;' : s.dist[n])].map(x => `<td>${x}</td>`).join('')}</tr>`).join('');
  $('cmpBox').innerHTML = R.path.length
    ? `<p><b>BFS (fewest stops)</b><br>${R.bfs_path.join(' > ')}<br><span class="note">${R.bfs_path.length - 1} hops, ${R.bfs_metres} m</span></p>
       <p><b>Dijkstra (shortest distance)</b><br>${R.path.join(' > ')}<br><span class="note">${R.path.length - 1} hops, ${R.metres} m</span></p>`
    : '<p class="note">No route to compare.</p>';
}

function stopPlay() { clearInterval(timer); timer = null; $('play').textContent = 'Play animation'; }

function nextStep() {
  if (S.stepIdx < S.run.steps.length - 1) S.stepIdx++; else { S.stepIdx = -1; stopPlay(); }
  drawMap(); showSteps();
}

function initSteps() {
  $('play').onclick = () => {
    if (timer) { stopPlay(); return; }
    S.stepIdx = -1; $('play').textContent = 'Stop'; timer = setInterval(nextStep, 900);
  };
  $('stepBtn').onclick = () => { stopPlay(); nextStep(); };
}
