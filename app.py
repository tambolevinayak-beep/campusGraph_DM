"""Flask backend: campus data + API. Each algorithm lives in its own file."""
import math, os
from flask import Flask, jsonify, request, send_from_directory, abort
from dijkstra import dijkstra, make_path, path_length, INF
from bfs_dfs import bfs, all_paths
from kruskal import kruskal
from bridges import components, find_bridges
from warshall import adjacency_matrix, warshall, relation_properties
from euler_degree import degrees, handshaking, euler_check
from coloring_tsp import greedy_coloring, tsp_lite

BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)

# ---- CAMPUS DATA (sample: replace with your own campus) ----
# name: (latitude, longitude). Click a building on Google Maps to read its coordinates.
BUILDINGS = {
    "Gate": (18.52126, 73.85600), "Parking": (18.52036, 73.85647), "Medical Room": (18.52189, 73.85657),
    "Admin Office": (18.52153, 73.85685), "Bank ATM": (18.52090, 73.85695), "Main Bldg": (18.52180, 73.85733),
    "Auditorium": (18.52108, 73.85761), "Library": (18.52225, 73.85818), "Comp Lab": (18.52135, 73.85818),
    "Canteen": (18.52045, 73.85790), "Seminar Hall": (18.52216, 73.85903), "Exam Hall": (18.52153, 73.85913),
    "Garden": (18.52090, 73.85856), "Workshop": (18.52099, 73.85960), "Playground": (18.52036, 73.85894),
    "Hostel": (18.52018, 73.85979),
}
# (A, B, distance in metres or None to compute with Haversine, 1 if the path has stairs)
EDGES = [
    ("Gate", "Parking", 40, 0), ("Gate", "Bank ATM", 70, 0), ("Gate", "Medical Room", 60, 0), ("Gate", "Main Bldg", 200, 0),
    ("Parking", "Canteen", 90, 0), ("Parking", "Bank ATM", 50, 0), ("Bank ATM", "Admin Office", 60, 0),
    ("Medical Room", "Admin Office", 45, 0), ("Admin Office", "Main Bldg", 55, 0), ("Main Bldg", "Auditorium", 70, 0),
    ("Main Bldg", "Library", 80, 0), ("Auditorium", "Comp Lab", 60, 0), ("Bank ATM", "Auditorium", 120, 0),
    ("Library", "Comp Lab", 65, 0), ("Library", "Seminar Hall", 60, 0), ("Comp Lab", "Canteen", 40, 1),
    ("Comp Lab", "Garden", 55, 0), ("Canteen", "Garden", 70, 0), ("Canteen", "Playground", 100, 0),
    ("Garden", "Exam Hall", 75, 0), ("Seminar Hall", "Exam Hall", 50, 0), ("Exam Hall", "Workshop", 80, 1),
    ("Workshop", "Playground", 60, 0), ("Playground", "Hostel", 70, 0),
]
EXITS = ["Gate", "Playground"]
SPEED = 1.5   # walking speed, metres per second


def haversine(p, q):
    """Straight-line distance in metres between two (lat, lon) points."""
    R = 6371000
    lat1, lon1, lat2, lon2 = map(math.radians, (p[0], p[1], q[0], q[1]))
    a = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


RAW = {}                                   # real distance of every path, both directions
for a, b, d, _ in EDGES:
    RAW[(a, b)] = RAW[(b, a)] = d if d is not None else round(haversine(BUILDINGS[a], BUILDINGS[b]))


def tri(t, centre, width):
    """1 at the peak hour, falling to 0 when `width` hours away."""
    return max(0, 1 - abs(t - centre) / width)


def crowd_factor(a, b, crowd):
    """Time-of-day crowding: weight = distance x (1 + factor)."""
    if not crowd or not crowd.get("on"):
        return 0
    t, f = float(crowd.get("hour", 13)), 0
    if "Canteen" in (a, b):
        f += 0.8 * tri(t, 13, 1)                      # lunch rush 12:00-14:00, peak 13:00
    if "Gate" in (a, b):
        f += 0.6 * (tri(t, 9, 1) + tri(t, 17, 1))     # gate rush 8-10 and 16-18
    return f


def edge_list(blocked, accessible=False, crowd=None):
    """Open edges as (a, b, weight). Blocked edges (and stairs, if accessible) are left out."""
    out = []
    for a, b, d, stairs in EDGES:
        if f"{a}|{b}" in blocked or (accessible and stairs):
            continue
        out.append((a, b, round(RAW[(a, b)] * (1 + crowd_factor(a, b, crowd)))))
    return out


def build_adj(edges):
    adj = {n: {} for n in BUILDINGS}
    for a, b, w in edges:
        adj[a][b] = w
        adj[b][a] = w
    return adj


@app.route("/")
def home():
    return send_from_directory(BASE, "index.html")


@app.route("/<folder>/<path:name>")
def assets(folder, name):
    if folder not in ("css", "js", "images"):
        abort(404)
    return send_from_directory(os.path.join(BASE, folder), name)


@app.route("/api/graph")
def graph():
    return jsonify(buildings=BUILDINGS, edges=[[a, b, RAW[(a, b)], s] for a, b, _, s in EDGES])


@app.route("/api/run", methods=["POST"])
def run():
    data = request.json
    start, end, kind, blocked = data["start"], data["end"], data["type"], set(data["blocked"])
    via, crowd = data.get("via", ""), data.get("crowd")
    base = edge_list(blocked)                                  # real distances, no crowds
    g = build_adj(edge_list(blocked, False, crowd))            # all open paths
    gr = build_adj(edge_list(blocked, kind == "acc", crowd))   # graph used for the route

    target = end
    if kind == "emg":                                          # nearest exit
        d0 = dijkstra(gr, start)[0]
        options = [e for e in EXITS if e != start and d0[e] < INF]
        target = min(options, key=lambda e: d0[e]) if options else start

    stop = via if (kind != "emg" and via and via not in (start, target)) else ""   # optional stop
    goal = stop or target
    dist, prev, steps = dijkstra(gr, start, goal)
    path = make_path(prev, start, goal)
    metres = dist[goal] if path else None
    bpath = bfs(gr, start, goal)
    if stop and path:                                          # second leg: stop -> destination
        d2, p2, _ = dijkstra(gr, stop, target)
        leg2 = make_path(p2, stop, target)
        if leg2:
            path, metres, bpath = path + leg2[1:], metres + d2[target], bpath + bfs(gr, stop, target)[1:]
        else:
            path, metres = [], None

    if stop:
        routes, capped = ([(metres, path)] if path else []), False
    else:
        routes, capped = all_paths(gr, start, target)
        if capped and path and not any(d <= metres for d, _ in routes):
            routes = sorted(routes + [(metres, path)])         # keep the best route in the list

    order = list(BUILDINGS)
    matrix = adjacency_matrix(g, order)
    deg = degrees(g)
    mst, mst_total = kruskal(order, base)
    comps = components(g)
    near = dijkstra(g, start)[0]
    pairs = list(zip(path, path[1:]))

    return jsonify(
        target=target, via=stop, path=path, metres=metres,
        raw=sum(RAW[p] for p in pairs) if path else None,
        minutes=round(metres / SPEED / 60, 1) if metres else None,
        leg_raw=[RAW[p] for p in pairs], leg_sec=[round(gr[a][b] / SPEED, 1) for a, b in pairs],
        bfs_path=bpath, bfs_metres=path_length(gr, bpath) if bpath else None,
        steps=steps, order=order, total_routes=len(routes), routes_capped=capped,
        top_routes=[{"metres": d, "path": p} for d, p in routes[:3]],
        near={k: v for k, v in near.items() if v != INF},
        matrix=matrix, reach=warshall(matrix), relation=relation_properties(matrix),
        degrees=deg, hand=handshaking(deg), edge_count=handshaking(deg)["edges"],
        avg_degree=round(sum(deg.values()) / len(deg), 1),
        euler=euler_check(g), mst=mst, mst_total=mst_total,
        bridges=find_bridges(build_adj(base)), colors=greedy_coloring(g),
        components=comps, connected=len(comps) == 1,
    )


@app.route("/api/tsp", methods=["POST"])
def tsp():
    data = request.json
    g = build_adj(edge_list(set(data["blocked"]), False, data.get("crowd")))
    best = tsp_lite(g, data["start"], data["stops"])
    if best is None:
        return jsonify(error="Some stops cannot be reached.")
    return jsonify(metres=best[0], route=best[1])


if __name__ == "__main__":
    app.run(debug=True)
