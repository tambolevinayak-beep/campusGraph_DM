"""Greedy graph colouring and TSP-lite."""
from itertools import permutations
from dijkstra import dijkstra, INF


def greedy_coloring(adj):
    """Give each node the smallest colour not used by its neighbours."""
    color = {}
    for n in sorted(adj, key=lambda x: -len(adj[x])):     # busiest nodes first
        used = {color[nb] for nb in adj[n] if nb in color}
        c = 0
        while c in used:
            c += 1
        color[n] = c
    return color


def tsp_lite(adj, start, stops):
    """Try every visiting order; keep the cheapest. Fine for up to about 5 stops."""
    d = {s: dijkstra(adj, s)[0] for s in [start] + stops}
    best = None
    for order in permutations(stops):
        route = [start] + list(order)
        total = sum(d[route[i]][route[i + 1]] for i in range(len(route) - 1))
        if best is None or total < best[0]:
            best = (total, route)
    return None if best[0] == INF else best
