import { create, all } from "mathjs";

const math = create(all, {});

const RI = {
  1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
  11: 1.51, 12: 1.48, 13: 1.56, 14: 1.57, 15: 1.59
};


/** Consistency Ratio for a pairwise matrix M with weights w */
export function lambdaMax(M, w) {
  const Aw = math.multiply(M, w); // vector
  let sum = 0;
  for (let i = 0; i < w.length; i++) {
    sum += (Aw[i] / w[i]);
  }
  return sum / w.length;
}

/** Consistency Ratio for a pairwise matrix M with weights w */
export function consistencyRatio(M, w) {
  const n = M.length;
  if (n <= 2) return 0; // CR undefined but effectively 0
  const lam = lambdaMax(M, w);
  const CI = (lam - n) / (n - 1);
  const ri = RI[n] ?? RI[15]; // cap if very large n
  return ri === 0 ? 0 : CI / ri;
}