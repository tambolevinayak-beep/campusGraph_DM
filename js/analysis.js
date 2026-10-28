// Graph analysis tab.
function showAnalysis() {
  const R = S.run, mx = Math.max(...Object.values(R.degrees), 1);
  $('deg').innerHTML = R.order.map(n => `<div style="display:flex;justify-content:space-between;font-size:13px"><span>${n}</span><b>${R.degrees[n]}</b></div><div class="bar"><i style="width:${R.degrees[n] / mx * 100}%"></i></div>`).join('');
  $('hs').textContent = `Sum of degrees = ${R.hand.sum} = 2 x ${R.hand.edges} paths. Handshaking lemma ${R.hand.holds ? 'holds' : 'fails'}.`;

  const e = R.euler;
  $('euler').innerHTML = e.result === 'circuit' ? tag(1, 'Euler circuit exists', '') + ' All degrees are even.'
    : e.result === 'path' ? tag(1, 'Euler path exists', '') + ` Odd buildings: ${e.odd.join(' and ')}. Start at one, end at the other.`
    : tag(0, '', 'No Euler path') + ` ${e.odd.length} buildings have odd degree, or the campus is split.`;
  $('bridges').innerHTML = R.bridges.length ? tag(0, '', 'Bridges: ' + R.bridges.join(', ')) + ' Blocking one disconnects the campus.' : tag(1, 'No bridges', '');
  $('comps').textContent = `Connected components: ${R.components.length}. ` + R.components.map(c => '{' + c.join(', ') + '}').join(' ');
  $('mst').innerHTML = `Cheapest way to keep every building connected: <b>${R.mst_total} m</b> using ${R.mst.length} paths. Use the map overlay "Show spanning tree".`;
  $('rel').innerHTML = `"Connected to" is ${tag(R.relation.symmetric, 'symmetric', 'not symmetric')} ${tag(R.relation.reflexive, 'reflexive', 'not reflexive')}. Warshall's closure makes it reflexive and transitive.`;
  const grid = M => tr('th', '', ...R.order.map(short)) + M.map((r, i) => `<tr><th>${short(R.order[i])}</th>${r.map(v => `<td class="${v ? 'one' : ''}">${v}</td>`).join('')}</tr>`).join('');
  $('mat').innerHTML = grid(R.matrix);
  $('reach').innerHTML = grid(R.reach);
}
