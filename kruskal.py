"""Kruskal's minimum spanning tree."""


def kruskal(nodes, edges):
    """Take edges from shortest to longest; skip any edge that would make a cycle."""
    leader = {n: n for n in nodes}

    def find(x):
        while leader[x] != x:
            x = leader[x]
        return x

    tree, total = [], 0
    for a, b, w in sorted(edges, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:                       # different groups -> no cycle
            leader[ra] = rb
            tree.append(f"{a}|{b}")
            total += w
    return tree, total
