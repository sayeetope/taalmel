import { edgeCount } from './graph';
import type { Graph } from './types';

/**
 * Chromatic polynomial by deletion–contraction.
 * Coefficients are ascending: P(k) = Σ coeffs[i] · k^i.
 * Exponential; returns null above `maxN` vertices.
 */
export function chromaticPolynomial(graph: Graph, maxN = 12): number[] | null {
  const { n, adj } = graph;
  if (n > maxN) return null;
  if (n === 0) return [1];

  const E = edgeCount(graph);
  if (E === 0) {
    const coeffs = Array<number>(n + 1).fill(0);
    coeffs[n] = 1;
    return coeffs;
  }

  let ei = -1;
  let ej = -1;
  for (let i = 0; i < n && ei === -1; i++) {
    for (let j = i + 1; j < n && ei === -1; j++) {
      if (adj[i][j]) {
        ei = i;
        ej = j;
      }
    }
  }

  const delAdj = adj.map((row) => [...row]);
  delAdj[ei][ej] = false;
  delAdj[ej][ei] = false;
  const delGraph: Graph = { n, adj: delAdj, pos: graph.pos, radius: graph.radius };

  const newN = n - 1;
  const map: number[] = [];
  let idx = 0;
  for (let v = 0; v < n; v++) {
    if (v === ej) {
      map.push(-1);
      continue;
    }
    map.push(idx++);
  }

  const conAdj = Array.from({ length: newN }, () => Array<boolean>(newN).fill(false));
  for (let i = 0; i < n; i++) {
    if (i === ej) continue;
    for (let j = i + 1; j < n; j++) {
      if (j === ej) continue;
      if (adj[i][j]) {
        conAdj[map[i]][map[j]] = true;
        conAdj[map[j]][map[i]] = true;
      }
    }
  }
  for (let v = 0; v < n; v++) {
    if (v === ei || v === ej) continue;
    if (adj[ej][v]) {
      conAdj[map[ei]][map[v]] = true;
      conAdj[map[v]][map[ei]] = true;
    }
  }

  const newPos = graph.pos ? graph.pos.filter((_, i) => i !== ej) : [];
  const newRadius = graph.radius ? graph.radius.filter((_, i) => i !== ej) : [];
  const conGraph: Graph = { n: newN, adj: conAdj, pos: newPos, radius: newRadius };

  const pDel = chromaticPolynomial(delGraph, maxN);
  const pCon = chromaticPolynomial(conGraph, maxN);
  if (!pDel || !pCon) return null;

  const maxLen = Math.max(pDel.length, pCon.length);
  const result = Array<number>(maxLen).fill(0);
  for (let i = 0; i < maxLen; i++) {
    result[i] = (pDel[i] ?? 0) - (pCon[i] ?? 0);
  }

  return result;
}

/** Evaluate P(k). */
export function evaluatePolynomial(coeffs: number[], k: number): number {
  let result = 0;
  for (let i = 0; i < coeffs.length; i++) {
    result += coeffs[i] * Math.pow(k, i);
  }
  return result;
}

/** Human-readable polynomial. */
export function formatPolynomial(coeffs: number[] | null): string {
  if (!coeffs) return 'N/A (graph too large)';
  const terms: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    if (coeffs[i] === 0) continue;
    let term = '';
    const c = coeffs[i];
    if (i === 0) {
      term = c.toString();
    } else if (i === 1) {
      term = (c === 1 ? '' : c === -1 ? '-' : c.toString()) + 'k';
    } else {
      term = (c === 1 ? '' : c === -1 ? '-' : c.toString()) + 'k^' + i;
    }
    if (terms.length > 0 && c > 0) term = '+ ' + term;
    terms.push(term);
  }
  return terms.join(' ') || '0';
}

/** Brute-force count of valid k-colorings; O(k^n), n ≤ 10. */
export function countColorings(graph: Graph, k: number, maxN = 10): number | null {
  const { n, adj } = graph;
  if (n > maxN) return null;
  if (n === 0) return 1;

  let count = 0;
  const coloring = Array<number>(n).fill(0);

  function enumerate(pos: number): void {
    if (pos === n) {
      count++;
      return;
    }
    for (let c = 0; c < k; c++) {
      coloring[pos] = c;
      let valid = true;
      for (let u = 0; u < pos; u++) {
        if (adj[pos][u] && coloring[pos] === coloring[u]) {
          valid = false;
          break;
        }
      }
      if (valid) enumerate(pos + 1);
    }
  }

  enumerate(0);
  return count;
}
