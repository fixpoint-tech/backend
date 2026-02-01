
/** Geometric-mean priority vector for a positive reciprocal matrix */
const weightVectorGeometricMean = (M) => {
    const n = M.length;
    const gms = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let prod = 1;
        for (let j = 0; j < n; j++) prod *= Number(M[i][j]);
        gms[i] = Math.pow(prod, 1 / n);
    }
    const sum = gms.reduce((a, b) => a + b, 0);
    return gms.map((x) => x / sum);
}

export default weightVectorGeometricMean;