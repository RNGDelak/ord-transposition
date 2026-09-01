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
