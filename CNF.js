/*
CNF Main functions with Pretty printing
Limit : e_0
*/

function asp(str) {
    if (!str) return ["", ""];
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "(") depth++;
        if (str[i] === ")") depth--;
        if (!depth) return [str.slice(0, i + 1), str.slice(i + 1)];
    }
}

function vsp(str) {
    return [str.slice(1, -1)];
}

function to_str(n) {
    return "()".repeat(n);
}

function single(str) {
    return !asp(str)[1];
}

function lt(a, b) {
    if (!b) return false;
    if (a === "Limit") return false;
    if (b === "Limit") return true;
    if (!a) return true;

    if (!single(a) && !single(b)) {
        const a1 = asp(a);
        const b1 = asp(b);
        return (
            lt(a1[0], b1[0]) ||
            (!lt(b1[0], a1[0]) && lt(a1[1], b1[1]))
        );
    }

    if (!single(a) && single(b))
        return lt(asp(a)[0], b);

    if (single(a) && !single(b))
        return !lt(asp(b)[0], a);

    return lt(vsp(a)[0], vsp(b)[0]);
}

function cmp(a, b) {
    if (a === b) return 0;

    return lt(a, b) ? -1 : 1;
}

function isSuccessor(a) {
    return a.endsWith("()");
}

function cof(x) {
    if (!x) return "";
    if (x === "Limit") return "(())";
    if (x.slice(-2) === "()") return "()";
    return "(())";
}

function fs(a, n = "") {
    if (typeof n === "number") n = to_str(n+1);

    if (!a) return "";

    if (a === "Limit")
        return n ? `(${fs(a, fs(n))})` : "";

    if (!single(a)) {
        const a1 = asp(a);
        return a1[0] + fs(a1[1], n);
    }

    const inside = vsp(a)[0];

    if (!inside) return "";

    if (cof(inside) === "()") {
        return n
            ? `${fs(a, fs(n))}(${fs(inside)})`
            : "";
    }

    return `(${fs(inside, n)})`;
}

function pretty(a) {
    if (!a) return "0";

    if (!single(a)) {
        const [x, y] = asp(a);
        return `${pretty(x)}+${pretty(y)}`;
    }

    const e = vsp(a)[0];

    if (!e) return "1";

    const pe = pretty(e);

    return pe === "1"
        ? "ω"
        : `ω^(${pe})`;
}

const ZERO = "";