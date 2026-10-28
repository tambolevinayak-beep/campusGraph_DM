"""Dijkstra's shortest path (simple version, no heap)."""
INF = float("inf")


def dijkstra(adj, start, end=None):
    """Pick the closest unvisited node, then update the distances of its neighbours."""
    dist = {n: INF for n in adj}
    dist[start] = 0
    prev, visited, steps = {}, [], []
    while len(visited) < len(adj):
        cur = min((n for n in adj if n not in visited), key=lambda n: dist[n])
        if dist[cur] == INF:
            break                               # the rest is unreachable
        visited.append(cur)
        for nb, w in adj[cur].items():
            if dist[cur] + w < dist[nb]:        # found a shorter way to nb
                dist[nb] = dist[cur] + w
                prev[nb] = cur
        steps.append({"visit": cur, "dist": {k: (None if v == INF else v) for k, v in dist.items()}})
        if cur == end:
            break
    return dist, prev, steps


def make_path(prev, start, end):
    """Walk backwards from the destination using the 'previous' links."""
    if end != start and end not in prev:
        return []
    path = [end]
    while path[-1] != start:
        path.append(prev[path[-1]])
    return path[::-1]


def path_length(adj, path):
    return sum(adj[path[i]][path[i + 1]] for i in range(len(path) - 1))
