//for unknow ordinal please check meta analysis sheet instead of asking

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

class HPrSS {

    static cmp(a, b) {
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

    static fs(a, n) {
        if (a == "Limit") return [0, n + 1]

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

    static isSuccessor(array) {
        return array !== "Limit" && (array.length === 0 || array.at(-1) === 0);
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

let Lim_LPrSS_in_HPrSS = [0,2,4,5] // Lim(LPrSS) is 0,2,4,5 in LPrSS

function Conv_HPrSS(ord) {
    if (HPrSS.cmp(ord, [0,2,3,5]) < 0) {return ord} //completely equivalent to LPrSS ordinals
    return HPrSS.g([0,2,3,5], Lim_LPrSS_in_HPrSS, LPrSS.gInv([0,2,4], "Limit", ord))
}

function Conv_LPrSS(ord) {
    if (LPrSS.cmp(ord, [0,2,4]) < 0) {return ord} //completely equivalent to LPrSS ordinals
    return LPrSS.g([0,2,4], "Limit", HPrSS.gInv([0,2,3,5], Lim_LPrSS_in_HPrSS, ord));
}
