function lastPositiveRow(column) {
        for (var i = column.length - 1; i >= 0; i--) {
            if (column[i] > 0) return i + 1;
        }
        return 0;
    }



function incrementPrefix(column, count) {
        if (count < 0 || count > column.length) {
            throw new Error("Illegal prefix length: " + count);
        }
        var result = column.slice();
        for (var i = 0; i < count; i++) {
            result[i] += 1;
        }
        return result;
    }

    function decrementPrefix(column, count) {
        if (count < 0 || count > column.length) {
            throw new Error("Illegal prefix length: " + count);
        }
        var result = column.slice();
        for (var i = 0; i < count; i++) {
            if (result[i] === 0) {
                throw new Error("The first " + count + " entries of column " + JSON.stringify(column) + " cannot all be decremented by one");
            }
            result[i] -= 1;
        }
        return result;
    }

    function incrementRow(column, row) {
        if (row < 1 || row > column.length) {
            throw new Error("Illegal actual row number: " + row);
        }
        var result = column.slice();
        result[row - 1] += 1;
        return result;
    }

    function zeroFromRow(column, row) {
        if (row < 1 || row > column.length + 1) {
            throw new Error("Illegal zeroing start row: " + row);
        }
        var result = column.slice();
        for (var i = row - 1; i < result.length; i++) {
            result[i] = 0;
        }
        return result;
    }

    function firstRowColumn(value, n) {
        var col = new Array(n);
        for (var i = 0; i < n; i++) col[i] = 0;
        col[0] = value;
        return col;
    }

    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function compareArrays(a, b) {
        var len = Math.min(a.length, b.length);
        for (var i = 0; i < len; i++) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }
        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return 0;
    }

    function compareColumnSequences(seqA, seqB) {
        var len = Math.min(seqA.length, seqB.length);
        for (var i = 0; i < len; i++) {
            var cmp = compareArrays(seqA[i], seqB[i]);
            if (cmp !== 0) return cmp;
        }
        if (seqA.length < seqB.length) return -1;
        if (seqA.length > seqB.length) return 1;
        return 0;
    }

    function createAncestorIndex(columns) {
        if (columns.length === 0) {
            throw new Error("Cannot build ancestor relation for empty matrix");
        }
        var n = columns[0].length;
        var colCount = columns.length;

        var parents = [];
        for (var r = 0; r <= n; r++) parents.push(new Array(colCount));
        var ancestors = [];
        for (var r = 0; r <= n; r++) ancestors.push(new Array(colCount));

        for (var c = 0; c < colCount; c++) {
            parents[0][c] = (c > 0) ? c - 1 : null;
            var set = new Set();
            for (var i = 0; i < c; i++) set.add(i);
            ancestors[0][c] = set;
        }

        for (var r = 1; r <= n; r++) {
            var rowIdx = r - 1;
            for (var c = 0; c < colCount; c++) {
                var candidates = Array.from(ancestors[r - 1][c]).sort(function(a, b) { return b - a; });
                var parent = null;
                for (var ci = 0; ci < candidates.length; ci++) {
                    var cand = candidates[ci];
                    if (columns[cand][rowIdx] < columns[c][rowIdx]) {
                        parent = cand;
                        break;
                    }
                }
                parents[r][c] = parent;
                if (parent !== null) {
                    var set2 = new Set(ancestors[r][parent]);
                    set2.add(parent);
                    ancestors[r][c] = set2;
                } else {
                    ancestors[r][c] = new Set();
                }
            }
        }

        return {
            hasAncestorColumn: function(elementColumn, row, ancestorColumn) {
                if (elementColumn < 0 || elementColumn >= colCount) throw new RangeError();
                if (row < 0 || row > n) throw new RangeError();
                if (ancestorColumn < 0 || ancestorColumn >= colCount) throw new RangeError();
                return ancestors[row][elementColumn].has(ancestorColumn);
            },
            parentIsColumn: function(elementColumn, row, parentColumn) {
                if (elementColumn < 0 || elementColumn >= colCount) throw new RangeError();
                if (row < 0 || row > n) throw new RangeError();
                if (parentColumn < 0 || parentColumn >= colCount) throw new RangeError();
                return parents[row][elementColumn] === parentColumn;
            },
            ancestorChain: function(elementColumn, row) {
                if (row === 0) {
                    var chain = [];
                    for (var i = elementColumn - 1; i >= 0; i--) chain.push(i);
                    return chain;
                }
                var chain2 = [];
                var current = parents[row][elementColumn];
                while (current !== null) {
                    chain2.push(current);
                    current = parents[row][current];
                }
                return chain2;
            }
        };
    }

function normalizeMatrix(matrix) {
        if (!matrix || matrix.length === 0) {
            throw new Error("Matrix cannot be empty");
        }
        var maxLen = 2;
        for (var i = 0; i < matrix.length; i++) {
            var col = matrix[i];
            if (!Array.isArray(col)) throw new Error("Each column must be an array");
            if (col.length > maxLen) maxLen = col.length;
        }
        var result = [];
        for (var i = 0; i < matrix.length; i++) {
            var col = matrix[i];
            var newCol = col.slice();
            while (newCol.length < maxLen) {
                newCol.push(0);
            }
            for (var j = 0; j < newCol.length; j++) {
                var v = newCol[j];
                if (!Number.isInteger(v) || v < 0) {
                    throw new Error("Columns must contain only non-negative integers, found: " + v);
                }
            }
            result.push(newCol);
        }
        return result;
    }

function dbmsToBms(matrix) {
        var columns = normalizeMatrix(matrix);
        var n = columns[0].length;

        var index = columns.length - 1;

        while (index >= 0) {
            var x = columns[index];
            if (x[n - 2] > 0) {
                index--;
                continue;
            }

            var k = lastPositiveRow(x);
            if (k + 2 > n) {
                throw new Error("Column " + JSON.stringify(x) + " cannot construct the first k+2 rows; k=" + k + ", n=" + n);
            }

            var y = incrementPrefix(x, k + 1);
            var z = incrementPrefix(y, k + 2);

            var yIndex = index + 1;
            var machineStart = index + 2;

            if (yIndex >= columns.length ||
                !arraysEqual(columns[yIndex], y) ||
                machineStart >= columns.length ||
                compareArrays(columns[machineStart], z) < 0) {
                index--;
                continue;
            }

            var ancestors = createAncestorIndex(columns);
            var xPrime = [];
            var cursor = machineStart;
            var lastStep = null;
            var xEnd = cursor;

            while (true) {
                if (cursor >= columns.length || compareArrays(columns[cursor], z) < 0) {
                    xEnd = cursor;
                    break;
                }

                var t = columns[cursor];
                var matchingRows = [];
                for (var row = 0; row <= k + 1; row++) {
                    if (ancestors.hasAncestorColumn(cursor, row, yIndex)) {
                        matchingRows.push(row);
                    }
                }
                if (matchingRows.length === 0) {
                    throw new Error("Cannot find the largest l <= k+1 such that t[l] has an ancestor in y: x@" + (index + 1) + ", y@" + (yIndex + 1) + ", t@" + (cursor + 1));
                }
                var l = Math.max.apply(null, matchingRows);

                var stoppedByXParent = (l <= k) && ancestors.parentIsColumn(cursor, l + 1, index);

                var tPrime = decrementPrefix(t, l);
                if (stoppedByXParent) {
                    tPrime = zeroFromRow(tPrime, l + 2);
                }

                xPrime.push(tPrime);
                cursor++;
                lastStep = {
                    column: t,
                    l: l,
                    stoppedByXParent: stoppedByXParent
                };

                if (stoppedByXParent) {
                    xEnd = cursor;
                    break;
                }
            }

            var nextAfterX = (xEnd < columns.length) ? columns[xEnd] : null;
            var keepCase1 = (nextAfterX !== null && compareArrays(nextAfterX, firstRowColumn(z[0], n)) >= 0);

            var keepCase2 = lastStep !== null &&
                lastStep.column[lastStep.l] === 0 &&
                ancestors.parentIsColumn(xEnd - 1, lastStep.l, yIndex);

            var keepCase3 = lastStep !== null &&
                lastStep.stoppedByXParent &&
                (lastStep.l + 1) < n &&
                lastStep.column[lastStep.l + 1] > 0;

            var keepOriginalYx = keepCase1 || keepCase2 || keepCase3;

            if (keepOriginalYx) {
                columns.splice.apply(columns, [index + 1, 0].concat(xPrime));
            } else {
                columns.splice.apply(columns, [index + 1, xEnd - (index + 1)].concat(xPrime));
            }

            index--;
        }

        return columns;
    }

    function bmsToDbms(matrix, stepLimit) {
        if (stepLimit === undefined) stepLimit = 100000;
        var columns = normalizeMatrix(matrix);
        var n = columns[0].length;

        var index = 0;
        var steps = 0;

        while (index < columns.length) {
            steps++;
            if (steps > stepLimit) {
                throw new Error("Step limit exceeded; input may not be a standard expression, or the rules caused non-terminating insertion");
            }

            var x = columns[index];
            var k = lastPositiveRow(x);
            if (k >= n - 1) {
                index++;
                continue;
            }

            var y = incrementPrefix(x, k + 1);
            var z = incrementRow(y, k + 2);

            var xStart = index + 1;
            if (xStart >= columns.length || compareArrays(columns[xStart], z) < 0) {
                index++;
                continue;
            }

            var xEnd = xStart;
            while (xEnd < columns.length && compareArrays(columns[xEnd], z) >= 0) {
                xEnd++;
            }

            var ancestors = createAncestorIndex(columns);
            var xPrime = [];

            for (var cursor = xStart; cursor < xEnd; cursor++) {
                var t = columns[cursor];
                var matchingRows = [];
                for (var row = 0; row <= k + 1; row++) {
                    if (ancestors.hasAncestorColumn(cursor, row, index)) {
                        matchingRows.push(row);
                    }
                }
                if (matchingRows.length === 0) {
                    throw new Error("Cannot find the largest l <= k+1 such that t[l] has an ancestor in x: x@" + (index + 1) + ", x'@" + (xStart + 1) + ", t@" + (cursor + 1));
                }
                var l = Math.max.apply(null, matchingRows);
                var isLast = (cursor === xEnd - 1);
                if (isLast) {
                    if (l < 0 || l >= n) {
                        throw new Error("Cannot read t[l+1]: l=" + l + ", n=" + n);
                    }
                    if (ancestors.parentIsColumn(cursor, l, index) && t[l] === 0) {
                        l--;
                    }
                }
                if (l < 0) {
                    throw new Error("The last column adjustment made l negative");
                }
                var tPrime = incrementPrefix(t, l);
                xPrime.push(tPrime);
            }

            var remainder = columns.slice(xEnd);
            var compMatrix = [y];
            for (var i = 0; i < xPrime.length; i++) compMatrix.push(xPrime[i]);
            compMatrix.push(firstRowColumn(y[0] + 1, n));

            columns.splice(xStart, xEnd - xStart);

            if (compareColumnSequences(compMatrix, remainder) > 0) {
                var toInsert = [y];
                for (var j = 0; j < xPrime.length; j++) toInsert.push(xPrime[j]);
                columns.splice.apply(columns, [xStart, 0].concat(toInsert));
            }

            index++;
        }

        return columns;
    }

    window.dbmsToBms = dbmsToBms;
    window.bmsToDbms = bmsToDbms;
