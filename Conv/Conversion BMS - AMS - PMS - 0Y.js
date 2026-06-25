function BMStoPMS(matrix) {
    const newMatrix = [];
    if (matrix.length === 0) return newMatrix;
    const cols = matrix[0].length;
    // Track the last row index (1-based) seen at each depth, per column.
    const lastAtDepth = Array.from({ length: cols }, () => new Map());
    for (let i = 0; i < matrix.length; i++) {
        const newRow = [];
        for (let j = 0; j < cols; j++) {
            const depth = matrix[i][j];
            if (depth === 0) {
                newRow[j] = 0;
            } else {
                const parentIndex = lastAtDepth[j].get(depth - 1);
                if (parentIndex == null) {
                    throw new Error(
                        `Invalid BMS matrix at row ${i}, col ${j}`
                    );
                }
                newRow[j] = (i + 1) - parentIndex;
            }
            lastAtDepth[j].set(depth, i + 1);
        }
        newMatrix[i] = newRow;
    }
    return newMatrix;
}

function PMStoBMS(matrix) {
    const rows = matrix.length;
    if (rows === 0) return [];

    const cols = matrix[0].length;
    const result = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let j = 0; j < cols; j++) {
        for (let i = 0; i < rows; i++) {
            const dist = matrix[i][j];

            if (dist === 0) {
                result[i][j] = 0;
            } else {
                const parent = i + 1 - dist; // 1-based row index

                if (parent <= 0)
                    throw new Error(`Invalid PMS at row ${i}, col ${j}`);

                result[i][j] = result[parent - 1][j] + 1;
            }
        }
    }

    return result;
}

function PMStoAMS(matrix) {
    return matrix.map((row, i) => row.map(v => v == 0 ? 0 : i + 1 - v));
}

function AMStoPMS(matrix) {
    return matrix.map((row, i) =>
        row.map(v => v === 0 ? 0 : (i + 1) - v)
    );
}

function AMSto0Y(matrix) {
    let a = Array(matrix.length).fill(1);
    for (let y = matrix[0].length - 1; y >= 0; y--) {
        for (let x = 0; x < matrix.length; x++) {
            a[x] = matrix[x][y] === 0 ? 1 : a[x] + a[matrix[x][y] - 1];
        }
    }
    return a;
}

function PMStoVZ(matrix) {
    const sequence = [];

    for (let i = 0; i < matrix.length; i++) {
        const row = [];

        for (let j = 0; j < matrix[i].length; j++) {
            let height = -1;
            let index = i + 1;

            while (index > 0) {
                height++;
                index -= (matrix[index - 1][j] || index);
            }

            row.push(height);
        }

        while (row.length > 1 && row.at(-1) === 0) row.pop();

        const v = row[0] + 1;
        sequence.push(v);

        for (let j = 1; j < row.length; j++) {
            sequence.push(v + row[j] + 1);
        }
    }

    return sequence.join(",");
}



/*
Pipeline : BMS <-> PMS <-> AMS -> 0Y
                               -> Vulcaniz
*/
