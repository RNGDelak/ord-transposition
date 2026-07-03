// dont care
class BMS {

    static cmp(m1, m2) {
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

        return c || this.cmp(m1.slice(1), m2.slice(1));
    }

    static isSuccessor(matrix) {
        return matrix !== "Limit" && (matrix.length === 0 || !matrix.at(-1)?.some(x => x !== 0));
    }

    static fs(m, FSterm) {
        if (m === "Limit") {
            if (FSterm === 0) return [[0]];
            return [
                Array(FSterm).fill(0),
                Array(FSterm).fill(1)
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

    static ZERO = [];

    static f(alpha, beta) {
        let n = 0;

        while (true) {
            const x = this.fs(beta, n);

            if (this.cmp(x, alpha) > 0) {
                return x;
            }

            n++;
        }
    }

    static g(alpha, beta, s) {
        while (true) {
            if (this.isSuccessor(beta)) return alpha;

            const split = this.f(alpha, beta);

            if (s === "") return split;

            const bit = s[0];
            s = s.slice(1);

            if (bit === "0") {
                beta = split;
            } else {
                alpha = split;
            }
        }
    }

    static gInv(alpha, beta, target) {
        let result = "";

        while (!this.isSuccessor(beta)) {
            const split = this.f(alpha, beta);
            const c = this.cmp(target, split);

            if (c === 0) break;

            if (c < 0) {
                result += "0";
                beta = split;
            } else {
                result += "1";
                alpha = split;
            }
        }

        return result;
    }

    static h(x, k = 0.5 , maxlen = 100, eps = 1e-10) {
        let result = "";

        while (Math.abs(x - k) > eps && result.length < maxlen) {
            if (x < k) {
                result += "0";
                x = x / k;
            } else {
                result += "1";
                x = (x - k) / (1 - k);
            }
        }

        return result;
    }

    static hInv(s, k = 0.5) {
        let x = k;

        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === "0") {
                x = k * x;
            } else {
                x = k + (1 - k) * x;
            }
        }

        return x;
    }
}
class Y_Sequence {
    static cmp(a, b) {
        if (a === "Limit" && b === "Limit") return 0;
        if (a === "Limit") return 1;
        if (b === "Limit") return -1;

        const n = Math.min(a.length, b.length);

        for (let i = 0; i < n; i++) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }

        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return 0;
    }

    static isSuccessor(array) {
        return array !== "Limit" && (array.length === 0 || array.at(-1) === 1);
    }

    static fs(array, FSterm) {
        if (array === "Limit") return [1, FSterm + 2];

        function calcMountain(row) {
            const mountain = [row]; // rows
            while (true) {
                let hasNextRow = false;
                for (let i = 0; i < row.length; i++) {
                    if (row[i].forcedParent && row[i].parentIndex != -1) {
                        hasNextRow = true;
                        continue;
                    }
                    if (mountain.length == 1) {
                        const parentIndex = row.findLastIndex((x, j) => x.value < row[i].value && j < i);
                        if (parentIndex != -1) {
                            row[i].parentIndex = parentIndex;
                            hasNextRow = true;
                        }
                    } else {
                        const parentRow = mountain.at(-2);
                        let p = parentRow.findIndex(x => x.position >= row[i].position);
                        while (p >= 0) {
                            p = parentRow[p].parentIndex;
                            if (p < 0) break;
                            const j = row.findIndex(x => x.position >= parentRow[p].position);
                            if (j < 0 || (j + 1 < row.length && row[j].position + 1 != row[j + 1].position)) break;
                            if (row[j].value < row[i].value) {
                                row[i].parentIndex = j;
                                hasNextRow = true;
                                break;
                            }
                        }
                    }
                }
                if (!hasNextRow) break;
                const newRow = [];
                mountain.push(newRow);
                for (let i = 0; i < row.length; i++) {
                    if (row[i].parentIndex != -1) {
                        newRow.push({
                            value: row[i].value - row[row[i].parentIndex].value,
                            position: row[i].position,
                            parentIndex: -1
                        });
                    }
                }
                row = newRow;
            }
            return mountain;
        }

        function calcDiagonal(mountain) {
            const diagonal = [];
            const diagonalTree = [];
            for (let i = 0; i < mountain[0].length; i++) { // only one diagonal exists for each left-side-up diagonal line
                for (let j = mountain.length - 1; j >= 0; j--) { // prioritize the top
                    const k = mountain[j].find(x => x.position == i);
                    if (!k) continue;
                    let height = j;
                    let last = k;
                    while (true) {
                        const row = mountain[height];
                        const parentRow = mountain[height - 1];
                        if (height == 0) {
                            last = row[last.parentIndex];
                        } else {
                            const l = parentRow[parentRow.find(x => x.position == last.position).parentIndex]; // find right-down, go to its parent=left-down
                            const m = row.find(x => x.position == l.position); // find up-left of that=left
                            if (m) { // left exists
                                last = m;
                            } else {
                                height--;
                                last = l;
                            }
                        }
                        if (!last || last.parentIndex == -1) {
                            diagonal.push(k.value);
                            diagonalTree.push(last ? last.position : height - 1);
                            break;
                        }
                    }
                    break;
                }
            }
            return diagonal.map((v, i) => {
                const pw = diagonal.findLastIndex((x, j) => j < i && x < v);
                let p = diagonalTree[i];
                while (p > 0 && diagonal[p] >= diagonal[i]) p = diagonalTree[p];
                return {
                    value: v,
                    position: i,
                    parentIndex: p == pw ? -1 : p,
                    forcedParent: p != pw
                };
            });
        }

        function cloneMountain(mountain) {
            return mountain.map(layer => layer.map(e => ({ ...e })));
        }

        function getBadRoot(mountain) {
            const diagonal = calcMountain(calcDiagonal(mountain));
            if (diagonal[0].at(-1).value != 1) return getBadRoot(diagonal);
            const i = mountain.findLastIndex(v => v.at(-1).position == mountain[0].length - 1);
            return mountain[i - 1][mountain[i - 1].at(-1).parentIndex].position;
        }

        function mountainFromArray(a) {
            return calcMountain(a.map((v, i) => ({ value: Number(v), position: i, parentIndex: -1 })));
        }

        function mountainToArray(mountain) {
            return mountain.length == 0 ? [] : mountain[0].map(element => element.value);
        }

        function expand(mountain, n) {

            const result = cloneMountain(mountain);
            if (mountain[0].at(-1).parentIndex == -1) {
                result[0].pop();
                return result;
            }

            let cutHeight = mountain.findLastIndex((v, i) => v.at(-1).position == mountain[0].length - 1);
            for (let i = 0; i <= cutHeight; i++) result[i].pop(); // cut child
            if (!result.at(-1).length) result.pop();
            const cutLength = result[0].length;

            const badRootSeam = getBadRoot(mountain);
            let badRootHeight = cutHeight - 1;
            const diagonal = calcDiagonal(mountain);
            let newDiagonal;

            const yamakazi = diagonal.at(-1).value == 1; // Yamakazi-Funka dualilty
            if (yamakazi) { // copy bad part n times
                newDiagonal = diagonal.slice(0, -1);
                const badPart = newDiagonal.slice(badRootSeam);
                for (let i = 0; i < n; i++) newDiagonal.push(...badPart);
                cutHeight--;
            } else {
                newDiagonal = expand(calcMountain(diagonal), n)[0];
                badRootHeight = mountain.findLastIndex((v, i) => {
                    const x = v.find(x => x.position >= badRootSeam);
                    return x && x.position == badRootSeam;
                });
            }
            const tailHeight = cutHeight - badRootHeight;
            const tailLength = cutLength - badRootSeam;

            // Create Mt.Fuji
            for (let i = 1; i <= n; i++) { // iteration
                for (let j = badRootSeam; j < cutLength; j++) { // seam
                    let p = mountain[badRootHeight].find(x => x.position == j);
                    while (p && p.position > badRootSeam) {
                        p = mountain[badRootHeight][p.parentIndex];
                    }
                    const isAscending = p && p.position == badRootSeam;

                    const seamHeight = 1 + result.findLastIndex((v, i) => {
                        const x = v.find(x => x.position >= j);
                        return x && x.position == j;
                    });
                    const isReplacingCut = j == badRootSeam;
                    const klimit = isAscending ? seamHeight + tailHeight * i : seamHeight;
                    for (let k = klimit - 1; k >= 0; k--) {
                        if (!result[k]) result[k] = [];
                        let sy = k; // Bb
                        let sx = 0;

                        if (isAscending && k >= badRootHeight) {
                            if (k <= badRootHeight + tailHeight * (i - isReplacingCut)) { // Br replace
                                sy = badRootHeight;
                            } else if (isReplacingCut && k <= badRootHeight + tailHeight * i) { // Br extend
                                sy = k - tailHeight * (i - 1);
                            } else { // Be
                                sy = k - tailHeight * i;
                            }
                            if (!yamakazi && isReplacingCut) {
                                sx = mountain[sy].length - 1;
                            } else {
                                sx = mountain[sy].findIndex(x => x.position >= j);
                            }
                        } else {
                            if (isReplacingCut) {
                                sx = mountain[sy].length - 1;
                            } else {
                                sx = mountain[sy].findIndex(x => x.position >= j);
                            }
                        }
                        const sourceParent = mountain[sy][mountain[sy][sx].parentIndex];
                        const parentShifts = i - isReplacingCut;
                        let parentPosition = sourceParent ? sourceParent.position : -1;
                        if (parentPosition >= badRootSeam) parentPosition += parentShifts * tailLength;
                        const parentIndex = result[k].findIndex(x => x.position == parentPosition);
                        let value;
                        if (parentIndex == -1) {
                            value = newDiagonal[j + tailLength * i].value;
                        } else {
                            const leftUp = result[k + 1].find(x => x.position >= j + tailLength * i);
                            value = result[k][parentIndex].value + leftUp.value;
                        }
                        result[k].push({
                            value: value,
                            position: j + tailLength * i,
                            parentIndex: parentIndex,
                        });
                    }
                }
            }

            return result;
        }

        const mountain = mountainFromArray(array);
        return mountainToArray(expand(mountain, FSterm));
    }

    static ZERO = [];

    static f(alpha, beta) {

        let n = 0;

        while (true) {

            const x = this.fs(beta, n);

            if (this.cmp(x, alpha) > 0) {
                return x;
            }

            n++;
        }
    }


    static g(alpha, beta, s) {
        while (true) {
            if (this.isSuccessor(beta)) return alpha;

            const split = this.f(alpha, beta);

            if (s === "") return split;

            const bit = s[0];
            s = s.slice(1);

            if (bit === "0") {
                beta = split;
            } else {
                alpha = split;
            }
        }
    }

    static gInv(alpha, beta, target) {
        let result = "";

        while (!this.isSuccessor(beta)) {
            const split = this.f(alpha, beta);
            const c = this.cmp(target, split);

            if (c === 0) break;

            if (c < 0) {
                result += "0";
                beta = split;
            } else {
                result += "1";
                alpha = split;
            }
        }

        return result;
    }

    static h(x, k = 0.5 , maxlen = 100, eps = 1e-10) {
        let result = "";

        while (Math.abs(x - k) > eps && result.length < maxlen) {
            if (x < k) {
                result += "0";
                x = x / k;
            } else {
                result += "1";
                x = (x - k) / (1 - k);
            }
        }

        return result;
    }
    
    static hInv(s, k = 0.5) {
        let x = k;

        for (let i = s.length - 1; i >= 0; i--) {
            if (s[i] === "0") {
                x = k * x;
            } else {
                x = k + (1 - k) * x;
            }
        }

        return x;
    }
}

let Lim_BMS_in_Yseq = [1, 3] // Lim(BMS) is 1,3 in y

/*
THIS IS JUST AN APPROXIMATION NOT EXACT
AFTER BH , IT SEEMS WRONG FOR ALL
*/

function Conv_BMS(ord) {
    return Y_Sequence.g(Y_Sequence.ZERO, Lim_BMS_in_Yseq, BMS.gInv(BMS.ZERO, "Limit", ord))
}

function Conv_Y_sequence(ord) {
    return BMS.g(BMS.ZERO, "Limit", Y_Sequence.gInv(Y_Sequence.ZERO, Lim_BMS_in_Yseq, ord));
}

