import { computeAHS } from './ahs.js';

/** Build pairwise matrix automatically from raw data */
export function buildPairwiseMatrixFromData(values, isBenefit = true) {
  const n = values.length;
  const M = Array.from({ length: n }, () => new Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        M[i][j] = 1;
      } else {
        const ratio = isBenefit
          ? values[i] / values[j]
          : values[j] / values[i];
        M[i][j] = ratio;
      }
    }
  }
  return M;
}

/** Data-driven AHP: convert data matrix to AHP results */
export function computeDataDrivenAHP({
  dataMatrix,
  criteriaNames,
  alternativeNames,
  benefitFlags
}) {
  const n = criteriaNames.length;
  const m = alternativeNames.length;

  if (dataMatrix.length !== m)
    throw new Error("dataMatrix rows must match number of alternatives");
  if (dataMatrix[0].length !== n)
    throw new Error("dataMatrix columns must match number of criteria");

  // build pairwise matrices automatically
  const alternativeMatrices = {};
  for (let k = 0; k < n; k++) {
    const colValues = dataMatrix.map((row) => row[k]);
    const isBenefit = benefitFlags?.[k] ?? true;
    alternativeMatrices[criteriaNames[k]] = buildPairwiseMatrixFromData(
      colValues,
      isBenefit
    );
  }

  // criteria matrix = equal importance (or replaceable)
  const criteriaMatrix = Array.from({ length: n }, () => Array(n).fill(1));

  // debug: log matrix shapes (removed after diagnosing issues)
  try {
    // avoid large dumps; log dimensions and a sample
    const altKeys = Object.keys(alternativeMatrices);
    const altShapes = altKeys.map(k => ({ key: k, size: alternativeMatrices[k]?.length ?? 0 }));
    console.log('computeDataDrivenAHP: criteriaMatrix size=', criteriaMatrix.length, 'alternativeMatrices=', altShapes);
  } catch (e) {
    console.error('computeDataDrivenAHP debug error', e);
  }
  

  return computeAHS(
    criteriaMatrix,
    alternativeMatrices,
    criteriaNames,
    alternativeNames
  );
}
