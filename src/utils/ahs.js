import { create, all } from "mathjs";
import matrixValidation from "./validateMatrix.js";
import weightVectorGeometricMean from "./computePriorityVector.js";
import { consistencyRatio } from "./computeConsistancyRatio.js";

const math = create(all, {});

/**
 * Compute AHP results.
 * @param {number[][]} criteriaMatrix  n x n
 * @param {Object.<string, number[][]>} alternativeMatrices  for each criterion key: m x m
 * @param {string[]} criteriaNames     length n
 * @param {string[]} alternativeNames  length m
 * @returns structured results
 */

export function computeAHS(
  criteriaMatrix,
  alternativeMatrices,
  criteriaNames,
  alternativeNames
) {

  // --- validate criteria matrix ---
  matrixValidation(criteriaMatrix, 'criteriaMatrix');
  const n = criteriaMatrix.length;

  // --- validate criteria names matrix ---
  if (!Array.isArray(criteriaNames) || criteriaNames.length !== n) {
    throw new Error("criteriaNames length must match criteriaMatrix size.");
  }

  // --- weights for criteria (GM method) + CR ---
  const criteriaWeights = weightVectorGeometricMean(criteriaMatrix);
  const criteriaCR = consistencyRatio(criteriaMatrix, criteriaWeights);

  // --- for each criterion, compute alt weights + CR ---
  const altLocalWeightsByCriterion = {}; // key -> vector length m
  const altCRByCriterion = {};           // key -> number
  let m = null;

  for (let k = 0; k < n; k++) {
    const key = criteriaNames[k];
    const M = alternativeMatrices[key];

    if (!M) {
      throw new Error(`Missing alternative matrix for criterion: ${key}`);
    }

    matrixValidation(M, `alternativeMatrices["${key}"]`);

    if (m === null) m = M.length;
    if (M.length !== m) {
      throw new Error("All alternative matrices must be the same size (m x m)");
    }

    const w = weightVectorGeometricMean(M);
    const cr = consistencyRatio(M, w);

    altLocalWeightsByCriterion[key] = w;
    altCRByCriterion[key] = cr;

  }

  if (!Array.isArray(alternativeNames) || alternativeNames.length !== m) {
    throw new Error("alternativeNames length must match alternative matrix size");
  }


  // --- aggregate global scores: sum_k (criteriaWeight[k] * altWeight_k[i]) ---
  const globalScores = new Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    let s = 0;
    for (let k = 0; k < n; k++) {
      const key = criteriaNames[k];
      s += criteriaWeights[k] * altLocalWeightsByCriterion[key][i];
    }
    globalScores[i] = s;
  }

  // --- ranking indices sorted desc ---
  const idx = globalScores.map((v, i) => i)
    .sort((i, j) => globalScores[j] - globalScores[i]);

  const ranking = idx.map((i) => ({
    name: alternativeNames[i],
    score: Number(globalScores[i].toFixed(6))
  }));

  return {
    criteria: criteriaNames.map((name, i) => ({
      name,
      weight: Number(criteriaWeights[i].toFixed(6))
    })),
    criteriaCR: Number(criteriaCR.toFixed(6)),
    alternatives: alternativeNames,
    localWeights: Object.fromEntries(
      Object.entries(altLocalWeightsByCriterion).map(([k, w]) => [
        k,
        w.map((x) => Number(x.toFixed(6)))
      ])
    ),
    localCR: Object.fromEntries(
      Object.entries(altCRByCriterion).map(([k, cr]) => [k, Number(cr.toFixed(6))])
    ),
    globalScores: alternativeNames.map((name, i) => ({
      name,
      score: Number(globalScores[i].toFixed(6))
    })),
    ranking
  };

}



