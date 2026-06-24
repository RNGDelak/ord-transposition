/*
BMS Main functions. Pretty printing is approximately associated with Y-sequence.js via Uniform.js
Limit : Y(1,3)
*/

function cmp(m1, m2) {
    function sequence_compare(seq1, seq2) {
    if (seq1.length === 0) {
        if (seq2.length === 0) return 0;
        else return -1;
    } else {
        if (seq2.length === 0) return 1;
        else {
            if (seq1[0] < seq2[0]) return -1;
            else if (seq1[0] > seq2[0]) return 1;
            else return sequence_compare(seq1.slice(1), seq2.slice(1));
        }
    }
    }
    
    if (m1 === "Limit" && m2 === "Limit") return 0;
    if (m1 === "Limit") return 1;
    if (m2 === "Limit") return -1;

    if (m1.length === 0) return m2.length === 0 ? 0 : -1;
    if (m2.length === 0) return 1;

    let col1 = m1[0];
    let col2 = m2[0];

    const diff = col1.length - col2.length;

    if (diff > 0) {
        col2 = col2.concat(Array(diff).fill(0));
    } else if (diff < 0) {
        col1 = col1.concat(Array(-diff).fill(0));
    }

    const c = sequence_compare(col1, col2);

    return c || cmp(m1.slice(1), m2.slice(1));
}

function isSuccessor(matrix) {
    return matrix !== "Limit" && (matrix.length === 0 || !matrix.at(-1)?.some(x => x !== 0));
}

function fs(m, FSterm) {
    if (m === "Limit") {
        return [
            Array(FSterm + 1).fill(0),
            Array(FSterm + 1).fill(1)
        ];
    }

    if (m.length === 0) {
        return [];
    }

    const parent_cache = Object.create(null);
    const ascending_cache = Object.create(null);

    function parent(x, y) {
        const key = `${x},${y}`;

        if (key in parent_cache) {
            return parent_cache[key];
        }

        let p = x;

        while ((p = y ? parent(p, y - 1) : p - 1) >= 0) {
            if (m[p][y] < m[x][y]) break;
        }

        return parent_cache[key] = p;
    }

    function ascending(r, x, y) {
        const key = `${r},${x},${y}`;

        if (key in ascending_cache) {
            return ascending_cache[key];
        }

        return ascending_cache[key] =
            r <= x &&
            (r === x || ascending(r, parent(x, y), y));
    }

    const endcol = m.length - 1;
    let result = m.slice(0, endcol);

    const child = m[endcol];
    const ymax = child.length - 1;

    let LNZ;

    for (LNZ = ymax; LNZ >= 0; --LNZ) {
        if (child[LNZ] > 0) break;
    }

    if (LNZ < 0) {
        return result;
    }

    const BR = parent(endcol, LNZ);
    const BRcolumn = m[BR];

    const offset = child.map((v, y) =>
        y < LNZ ? v - BRcolumn[y] : 0
    );

    const offsetAsc = Array(endcol)
        .fill(0, BR)
        .map((_, x) =>
            offset.map((v, y) =>
                ascending(BR, x, y) ? v : 0
            )
        );

    for (let n = 1; n <= FSterm; n++) {
        for (let col = BR; col < endcol; col++) {
            result.push(
                m[col].map(
                    (v, y) =>
                        v + offsetAsc[col][y] * n
                )
            );
        }
    }

    if (
        ymax > 0 &&
        result.every(column => column[ymax] === 0)
    ) {
        result = result.map(column =>
            column.slice(0, ymax)
        );
    }

    return result;
}

const ZERO = []