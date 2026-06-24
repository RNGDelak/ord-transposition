/*
HPrSS Main functions
Limit : ψ(Ω_ω)
*/

function cmp(a, b) {
	if (a == "Limit" && b == "Limit") return 0;
    if (a == "Limit" && b != "Limit") return 1;
    if (a != "Limit" && b == "Limit") return -1;

	for (let i = 0; i < a.length; i++) {
		if (i >= b.length) return 1;
		if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }

	if (a.length < b.length) return -1;
	if (a.length > b.length) return 1;
	return 0;
}

function fs(a, n) {
	if (a == "Limit") return [0,n+1]
	
	let getParent = i =>
		a.findLastIndex((v, j) => j < i && v < a[i]);

	let differences = a.map((v, i) => v - a[getParent(i)]);
	let parentDifference = differences[a.length - 1];
	let root = getParent(a.length - 1);

	if (parentDifference > 1) {
		while (differences[root] >= parentDifference) {
			let parent = getParent(root);
			if (parent === -1) break;
			root = parent;
		}
	}

	let out = [...a];
	let cutNode = out.pop();
	let increment = cutNode - a[root] - 1;
	let badPart = out.slice(root);

	for (let i = 1; i <= n; i++) {
		out.push(...badPart.map(v => v + increment * i));
	}

	return out;
}

function isSuccessor(array) {
	return array !== "Limit" && (array.length === 0 || array.at(-1) === 0);
}