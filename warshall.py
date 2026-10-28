"""Adjacency matrix, Warshall's transitive closure, relation properties."""


def adjacency_matrix(adj, order):
    return [[1 if b in adj[a] else 0 for b in order] for a in order]


def warshall(matrix):
    """reach[i][j] = 1 if j can be reached from i, directly or through others."""
    n = len(matrix)
    reach = [row[:] for row in matrix]
    for i in range(n):
        reach[i][i] = 1
    for k in range(n):                     # allow building k as a stop-over
        for i in range(n):
            for j in range(n):
                reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j])
    return reach


def relation_properties(matrix):
    n = range(len(matrix))
    return {"reflexive": all(matrix[i][i] for i in n),
            "symmetric": all(matrix[i][j] == matrix[j][i] for i in n for j in n)}
