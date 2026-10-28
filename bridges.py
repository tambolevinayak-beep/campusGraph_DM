"""Connected components and bridges."""


def components(adj):
    """BFS from every unvisited node; each search finds one component."""
    seen, result = set(), []
    for n in adj:
        if n in seen:
            continue
        comp, i = [n], 0
        seen.add(n)
        while i < len(comp):
            for nb in adj[comp[i]]:
                if nb not in seen:
                    seen.add(nb)
                    comp.append(nb)
            i += 1
        result.append(comp)
    return result


def find_bridges(adj):
    """A bridge is an edge whose removal gives more components."""
    base = len(components(adj))
    bridges = []
    for a in list(adj):
        for b in list(adj[a]):
            if a < b:                              # look at each edge once
                w = adj[a].pop(b)
                adj[b].pop(a)                      # remove the edge
                if len(components(adj)) > base:
                    bridges.append(f"{a} - {b}")
                adj[a][b] = w
                adj[b][a] = w                      # put it back
    return bridges
