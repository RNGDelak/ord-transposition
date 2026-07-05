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

function VZtoBMS(X) {
    if (X.length === 0) return [];
    X = X.map(x => x - 1);


    const Y = [];
    let i = 0;

    while (true) {

        Y.push([X[i]]);
        let f = X[i];
        i++;

        if (i === X.length) break;

        while (true) {
            if (X[i] <= f + 1) break;

            let last = Y[Y.length - 1][Y[Y.length - 1].length - 1];
            let r = Array.isArray(last) ? last[0] : last;

            if (X[i] - f - 1 <= r) {
                Y[Y.length - 1].push(X[i] - f - 1);
            } else {
                let Z = [];
                r = X[i];

                let p = Y[Y.length - 1][Y[Y.length - 1].length - 1];
                if (Array.isArray(p)) p = p[0];

                while (true) {
                    Z.push(X[i] - r);

                    if (X[i] - r < 0) {
                        Z.pop();
                        break;
                    }

                    if (i === X.length - 1) {
                        i++;
                        break;
                    }

                    i++;
                }

                if (
                    typeof Y[Y.length - 1][Y[Y.length - 1].length - 1] === "number" &&
                    Y[Y.length - 1][Y[Y.length - 1].length - 1] === p
                ) {
                    Y[Y.length - 1].pop();
                }

                if (
                    typeof Y[Y.length - 1][Y[Y.length - 1].length - 1] === "number" &&
                    Y[Y.length - 1][Y[Y.length - 1].length - 1] === p
                ) {
                    Y[Y.length - 1].pop();
                }
                Y[Y.length - 1].push([p, VZtoBMS(Z)]);

                i--;
            }

            if (i === X.length - 1) {
                i++;
                break;
            }

            i++;
        }

        if (i === X.length) break;
    }
    const maxLen = Math.max(...Y.map(row => row.length));

    return Y.map(row => {
        const copy = [...row];
        while (copy.length < maxLen) {
            copy.push(0);
        }
        return copy;
    });

    return Y;
}

function BMS_to_0Y(s) {
  var itemSeparatorRegex = /[\t ,]/g;
  var matrix = [];
  
  // 1. Parse or Normalise input into a standard 2D array
  if (typeof s === "string") {
    if (!/^(\(\d*(,\d*)*\))*$/.test(s)) return "";
    matrix = JSON.parse(
      "[" + s
        .replace(itemSeparatorRegex, ",")
        .replace(/\(/g, "[")
        .replace(/\)/g, "]")
        .replace(/\]\[/g, "],[") + "]"
    );
  } else if (Array.isArray(s)) {
    // Deep clone the array to prevent mutating the user's original data
    for (var i = 0; i < s.length; i++) {
      matrix.push(Array.isArray(s[i]) ? s[i].slice(0) : [s[i]]);
    }
  }

  // Edge case safety check
  if (!matrix.length || !matrix[0].length) return "";

  // 2. Pad uneven columns with 0s (same behavior as your original script)
  var X = matrix.length;
  var Y = 0;
  for (var i = 0; i < X; i++) {
    if (matrix[i].length > Y) Y = matrix[i].length;
  }
  for (var i = 0; i < X; i++) {
    while (matrix[i].length < Y) {
      matrix[i].push(0);
    }
  }

  // 3. Core Logic: Find parent nodes
  var parentMatrix = [];
  for (var y = 0; y < Y; y++) {
    for (var x = 0; x < X; x++) {
      var p;
      if (y === 0) {
        parentMatrix.push([]);
        for (p = x; p >= 0; p--) {
          if (matrix[p][y] < matrix[x][y]) break;
        }
      } else {
        for (p = x; p >= 0; p = parentMatrix[p][y - 1]) {
          if (matrix[p][y] < matrix[x][y]) break;
        }
      }
      parentMatrix[x][y] = p;
    }
  }

  // 4. Accumulate values to build the 0-Y sequence
  var a = [];
  for (var x = 0; x < X; x++) a.push(1);
  for (var y = Y - 1; y >= 0; y--) {
    for (var x = 0; x < X; x++) {
      a[x] = matrix[x][y] === 0 ? 1 : a[x] + a[parentMatrix[x][y]];
    }
  }

  return a.join(",");
}

/*
Pipeline : BMS <-> PMS <-> AMS -> 0Y
                        -> Vulcaniz -> BMS
            BMS -> 0Y
                                      
*/
