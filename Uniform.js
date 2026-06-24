/********************************************************
 * REQUIRED GLOBAL FUNCTIONS
 ********************************************************/

//This function are ordinal sysrem dependences
//System for the example : LPrSS

function cmp(a, b) {
    if (a == "Limit" && b == "Limit") return 0;
    if (a == "Limit" && b != "Limit") return 1;
    if (a != "Limit" && b == "Limit") return -1;


    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }

    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
}

function fs(a, n) {
    if (a == "Limit") return [0,n+1]
	let out = [...a];
	let cutNode = out.pop();
	let root = out.length - 1;
	while (out[root] >= cutNode && root > 0) root--;
	let increment = cutNode - out[root] - 1;
	let badPart = out.slice(root);
	for (let i = 1; i < n; i++) {
		out = out.concat(badPart.map(v => v + increment * i));
	}
	return out;
}

function isSuccessor(a) {
	return a !== "Limit" && (a.length === 0 || a.at(-1) === 0);
}

let ZERO = [] // 0 = [] in LPrSS

/********************************************************
 * f(alpha,beta)
 ********************************************************/

function f(alpha, beta) {

    let n = 0;

    while (true) {

        const x = fs(beta, n);

        if (cmp(x, alpha) > 0) {
            return x;
        }

        n++;
    }
}

/********************************************************
 * g([α,β], s)
 ********************************************************/

function g(alpha, beta, s) {

    // terminal
    if (isSuccessor(beta)) {
        return alpha;
    }

    const split = f(alpha, beta);

    // empty string
    if (s === "") {
        return split;
    }

    const bit = s[0];
    const rest = s.slice(1);

    if (bit === "0") {
        return g(alpha, split, rest);
    }

    return g(split, beta, rest);
}

/********************************************************
 * g⁻¹
 ********************************************************/

function gInv(alpha, beta, target) {

    if (isSuccessor(beta)) {
        return "";
    }

    const split = f(alpha, beta);

    const c = cmp(target, split);

    if (c === 0) {
        return "";
    }

    if (c < 0) {
        return "0" +
            gInv(alpha, split, target);
    }

    return "1" +
        gInv(split, beta, target);
}

/********************************************************
 * h(x) -- defined as iterative function, but can be defined as a recursive form but dangerous to use because of floating point error
 ********************************************************/
const Maxlen = 1000
function h(x, k = 0.5) {
    let result = "";

    while (x !== k && result.length < Maxlen) {
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

/********************************************************
 * h⁻¹
 ********************************************************/

function hInv(s, k = 0.5) {

    if (s === "") {
        return k;
    }

    const bit = s[0];
    const rest = s.slice(1);

    if (bit === "0") {
        return k * hInv(rest, k);
    }

    return k +
        (1 - k) * hInv(rest, k);
}

/********************************************************
 * Extension of Fundamental sequence to rational
 ********************************************************/

function fsR(alpha, n, k = 0.5) {

    const x = 1 - Math.pow(1 - k, n);

    return g(ZERO, alpha, h(x, k));
}

/********************************************************
 * fsR⁻¹
 ********************************************************/

function fsRInv(alpha, beta, k = 0.5) {

    const s = gInv(ZERO, alpha, beta);

    const x = hInv(s, k);

    return Math.log(1 - x) /
           Math.log(1 - k);
}
