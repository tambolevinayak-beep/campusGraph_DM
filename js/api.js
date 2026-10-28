// Small helpers that talk to the Python backend and return JSON.
async function getJSON(url) { return (await fetch(url)).json(); }
async function postJSON(url, body) {
  const r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  return r.json();
}
const api = {
  graph: () => getJSON('/api/graph'),
  run: body => postJSON('/api/run', body),
  tsp: body => postJSON('/api/tsp', body),
};
