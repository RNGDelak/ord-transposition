/*
LPrSS Main functions. Pretty printing is associated with CNF.js via Uniform.js
Limit : φ(ω,0)
*/

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