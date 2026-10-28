"""BFS (fewest stops) and DFS (all simple paths)."""
from dijkstra import make_path, path_length


def bfs(adj, start, end):
    """Level by level with a queue. Ignores distances, only counts stops."""
    prev, queue = {start: None}, [start]
    while queue:
        cur = queue.pop(0)
        if cur == end:
            break
        for nb in adj[cur]:
            if nb not in prev:
                prev[nb] = cur
                queue.append(nb)
    return make_path(prev, start, end)


def all_paths(adj, start, end, cap=500):
    """Go deep, backtrack, and record every path that does not repeat a building.
    Stops after `cap` paths, because the number of paths grows very fast on big campuses."""
    found, state = [], {"capped": False}

    def go(node, path):
        if len(found) >= cap:
            state["capped"] = True
            return
        if node == end:
            found.append((path_length(adj, path), path[:]))
            return
        for nb in adj[node]:
            if nb not in path:
                path.append(nb)
                go(nb, path)
                path.pop()

    go(start, [start])
    return sorted(found), state["capped"]     # shortest first
