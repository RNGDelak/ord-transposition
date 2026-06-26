/*
For pretty printing use CNF.pretty
*/

class CNF {
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
        return !this.asp(str)[1];
    }

    static lt(a, b) {
        if (!b) return false;
        if (a === "Limit") return false;
        if (b === "Limit") return true;
        if (!a) return true;

        if (!this.single(a) && !this.single(b)) {
            const a1 = this.asp(a);
            const b1 = this.asp(b);
            return (
                this.lt(a1[0], b1[0]) ||
                (!this.lt(b1[0], a1[0]) && this.lt(a1[1], b1[1]))
            );
        }

        if (!this.single(a) && this.single(b))
            return this.lt(this.asp(a)[0], b);

        if (this.single(a) && !this.single(b))
            return !this.lt(this.asp(b)[0], a);

        return this.lt(this.vsp(a)[0], this.vsp(b)[0]);
    }

    static cmp(a, b) {
        if (a === b) return 0;
        return this.lt(a, b) ? -1 : 1;
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
        if (typeof n === "number") n = this.to_str(n + 1);

        if (!a) return "";

        if (a === "Limit")
            return n ? `(${this.fs(a, this.fs(n))})` : "";

        if (!this.single(a)) {
            const a1 = this.asp(a);
            return a1[0] + this.fs(a1[1], n);
        }

        const inside = this.vsp(a)[0];

        if (!inside) return "";

        if (this.cof(inside) === "()") {
            return n
                ? `${this.fs(a, this.fs(n))}(${this.fs(inside)})`
                : "";
        }

        return `(${this.fs(inside, n)})`;
    }

    static pretty(a) {
        if (!a) return "0";

        if (!this.single(a)) {
            const [x, y] = this.asp(a);
            return `${this.pretty(x)}+${this.pretty(y)}`;
        }

        const e = this.vsp(a)[0];

        if (!e) return "1";

        const pe = this.pretty(e);

        return pe === "1"
            ? "ω"
            : `ω^(${pe})`;
    }

    static ZERO = "";

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

class LPrSS {

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

    static h(x, k = 0.5, maxlen = 100, eps = 1e-10) {
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

let Lim_CNF_in_LPrSS = [0, 2] // Lim(CNF) is 0,2 in LPrSS

function Conv_CNF(ord) {
    return LPrSS.g(LPrSS.ZERO, Lim_CNF_in_LPrSS, CNF.gInv(CNF.ZERO, "Limit", ord))
}

function Conv_LPrSS(ord) {
    return CNF.g(CNF.ZERO, "Limit", LPrSS.gInv(LPrSS.ZERO, Lim_CNF_in_LPrSS, ord));
}
