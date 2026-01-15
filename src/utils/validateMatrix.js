
const matrixValidation = (matrix, name = 'matrix') => {
    const n = matrix.length;

    console.log("Validating matrix:", matrix);
    

    if (!Array.isArray(matrix) || n === 0 || !Array.isArray(matrix[0])) {
            throw new Error("Input must be a non-empty square matrix.");
    }
    
    for (let i = 0; i < n; i++) {
        if (!Array.isArray(matrix[i]) || matrix[i].length !== n) {
            throw new Error("Input must be a square matrix.");
        }

        const diag = Number(matrix[i][i]);
        if (!isFinite(diag) || Math.abs(diag - 1) > 1e-8) {
            throw new Error("Input must be a reciprocal matrix.");
        }

        for (let j = 0; j < n; j++) {
            const aij = Number(matrix[i][j]);
            const aji = Number(matrix[j][i]);
            if (!isFinite(aij) || !isFinite(aji)) {
                throw new Error(`${name} has non-finite entries at (${i},${j})`);
            }
            if (i !== j && Math.abs(aij * aji - 1) > 1e-6) {
                throw new Error(
                    `${name} must be reciprocal: a[${i}][${j}] ≈ 1 / a[${j}][${i}]`
                );
            }
        }
    }
};

export default matrixValidation;