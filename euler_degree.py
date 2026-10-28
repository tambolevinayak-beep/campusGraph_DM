"""Degrees, handshaking lemma, Euler path and circuit."""
from bridges import components


def degrees(adj):
    return {n: len(adj[n]) for n in adj}


def handshaking(deg):
    """Sum of degrees must equal 2 x number of edges."""
    total = sum(deg.values())
    return {"sum": total, "edges": total // 2, "holds": total % 2 == 0}


def euler_check(adj):
    """Connected + 0 odd degrees -> circuit. Connected + 2 odd degrees -> path."""
    odd = [n for n in adj if len(adj[n]) % 2 == 1]
    pieces = [c for c in components(adj) if len(c) > 1]
    if len(pieces) > 1:
        return {"result": "none", "odd": odd}
    kind = "circuit" if len(odd) == 0 else "path" if len(odd) == 2 else "none"
    return {"result": kind, "odd": odd}
