/*
For pretty pringtin use A.pretty
*/

// System A for this example : CNF
class A {
    static asp(str) {
        if (!str) return ["", ""];
        let depth = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === "(") depth++;
            if (str[i] === ")") depth--;
            if (!depth) return [str.slice(0, i + 1), str.slice(i + 1)];
        }
        return [str, ""];
    }

    static vsp(str) {
        return [str.slice(1, -1)];
    }

    static to_str(n) {
        return "()".repeat(n);
    }

    static single(str) {
        return !A.asp(str)[1];
    }

    static lt(a, b) {
        if (!b) return false;
        if (a === "Limit") return false;
        if (b === "Limit") return true;
        if (!a) return true;

        if (!A.single(a) && !A.single(b)) {
            const a1 = A.asp(a);
            const b1 = A.asp(b);
            return (
                A.lt(a1[0], b1[0]) ||
                (!A.lt(b1[0], a1[0]) && A.lt(a1[1], b1[1]))
            );
        }

        if (!A.single(a) && A.single(b))
            return A.lt(A.asp(a)[0], b);

        if (A.single(a) && !A.single(b))
            return !A.lt(A.asp(b)[0], a);

        return A.lt(A.vsp(a)[0], A.vsp(b)[0]);
    }

    static cmp(a, b) {
        if (a === b) return 0;
        return A.lt(a, b) ? -1 : 1;
    }

    static isSuccessor(a) {
        return a !== "Limit" && (typeof a === "string" && a.endsWith("()"));
    }

    static cof(x) {
        if (!x) return "";
        if (x === "Limit") return "(())";
        if (x.slice(-2) === "()") return "()";
        return "(())";
    }

    static fs(a, n = "") {
        if (typeof n === "number") n = A.to_str(n + 1);

        if (!a) return "";

        if (a === "Limit")
            return n ? `(${A.fs(a, A.fs(n))})` : "";

        if (!A.single(a)) {
            const a1 = A.asp(a);
            return a1[0] + A.fs(a1[1], n);
        }

        const inside = A.vsp(a)[0];

        if (!inside) return "";

        if (A.cof(inside) === "()") {
            return n
                ? `${A.fs(a, A.fs(n))}(${A.fs(inside)})`
                : "";
        }

        return `(${A.fs(inside, n)})`;
    }

    static pretty(a) {
        if (!a) return "0";

        if (!A.single(a)) {
            const [x, y] = A.asp(a);
            return `${A.pretty(x)}+${A.pretty(y)}`;
        }

        const e = A.vsp(a)[0];

        if (!e) return "1";

        const pe = A.pretty(e);

        return pe === "1"
            ? "ω"
            : `ω^(${pe})`;
    }

    static ZERO = "";

    static f(alpha, beta) {
        let n = 0;

        while (true) {
            const x = A.fs(beta, n);

            if (A.cmp(x, alpha) > 0) {
                return x;
            }

            n++;
        }
    }

    static g(alpha, beta, s) {
        if (A.isSuccessor(beta)) return alpha;

        const split = A.f(alpha, beta);

        if (s === "") return split;

        const bit = s[0];
        const rest = s.slice(1);

        if (bit === "0")
            return A.g(alpha, split, rest);

        return A.g(split, beta, rest);
    }

    static gInv(alpha, beta, target) {
        if (A.isSuccessor(beta)) return "";

        const split = A.f(alpha, beta);
        const c = A.cmp(target, split);

        if (c === 0) return "";

        if (c < 0)
            return "0" + A.gInv(alpha, split, target);

        return "1" + A.gInv(split, beta, target);
    }

    static h(x, k = 0.5) {
        let result = "";

        while (x !== k) {
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
        if (s === "") return k;

        const bit = s[0];
        const rest = s.slice(1);

        if (bit === "0")
            return k * A.hInv(rest, k);

        return k + (1 - k) * A.hInv(rest, k);
    }
}

// System B for this example : LPrSS
class B {

    static cmp(a, b) {
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

    static fs(a, n) {
        if (a == "Limit") return [0, n + 1]
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

    static isSuccessor(a) {
        return a !== "Limit" && (a.length === 0 || a.at(-1) === 0);
    }

    static ZERO = [];

    static f(alpha, beta) {

        let n = 0;

        while (true) {

            const x = B.fs(beta, n);

            if (B.cmp(x, alpha) > 0) {
                return x;
            }

            n++;
        }
    }


    static g(alpha, beta, s) {
        if (B.isSuccessor(beta)) return alpha;
        const split = B.f(alpha, beta);
        if (s === "") return split;
        const bit = s[0];
        const rest = s.slice(1);
        if (bit === "0") return B.g(alpha, split, rest);
        return B.g(split, beta, rest);
    }

    static gInv(alpha, beta, target) {
        if (B.isSuccessor(beta)) return "";
        const split = B.f(alpha, beta);
        const c = B.cmp(target, split);
        if (c === 0) return "";
        if (c < 0) return "0" + B.gInv(alpha, split, target);
        return "1" + B.gInv(split, beta, target);
    }

    static h(x, k = 0.5) {
        let result = "";

        while (x !== k) {
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
        if (s === "") return k;
        const bit = s[0];
        const rest = s.slice(1);
        if (bit === "0") return k * B.hInv(rest, k);
        return k + (1 - k) * B.hInv(rest, k);
    }
}

let LimAinB = [0, 2] // Lim(CNF) is 0,2 in LPrSS
/*
Special case : if lim(A) = Lim(B) then LimAinB = "Limit"
*/

function ConvA(ord) {
    return B.g(B.ZERO, LimAinB, A.gInv(A.ZERO, "Limit", ord))
    // Inside intervals [B.ZERO,LimAinB] , the adress of that ordinal in A is preserved
}

function ConvB(ord) {
    return A.g(A.ZERO, "Limit", B.gInv(B.ZERO, LimAinB, ord));
    // Inside intervals [B.ZERO,LimAinB] , the adress of that ordinal in B is preserved
}
