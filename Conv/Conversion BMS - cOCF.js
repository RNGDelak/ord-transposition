/*
For pretty printing use cOCF.convert
*/

class cOCF {
    // Static class properties
    static bo = 'Limit';
    static col = 'c';
    static format = 1;
    static mf = false;
    static ZERO = '[]';

    // get position of last symbol p of string st (if l=true then first)
    static getls(st, p, l = false) {
        let e = l ? -1 : st.length;
        let np = 0;
        while (((!l && e > -1) || (l && e < st.length)) && (np != 0 || st[e] != p)) {
            l ? e++ : e--;
            if (st[e] == '[') np--;
            else if (st[e] == ']') np++;
        }
        return e;
    }

    // create [booster]base string
    static bb(booster, base) {
        return '[' + booster + ']' + base;
    }

    // get base of string st
    static base(st) {
        return st.slice(this.getls(st, ']', true) + 1);
    }

    // get booster of string st
    static booster(st) {
        return st.slice(1, this.getls(st, ']', true));
    }

    // get successor of ordinal st
    static suc(st) {
        return '[]' + st;
    }

    // get predecessor of successor ordinal st = X + 1
    static pred(st) {
        return st.slice(2);
    }

    // finite ordinal string st to number
    static fostn(st) {
        return st.length / 2;
    }

    // finite ordinal e from integer to computer format
    static cf(e) {
        let s = '';
        for (let i = 0; i < e; i++)
            s = this.suc(s);
        return s;
    }

    // cmp expressions st1, st2 (if st1<st2 then -1; if st1=st2 then 0; if st1>st2 then 1)
    static cmp(st1, st2, b = false) {
        if (b) {
            let ccnf = this.cmpcnf(this.cnf(st1), this.cnf(st2));
            let c = st1 == st2 ? 0 : [...st1].reverse() > [...st2].reverse() ? 1 : -1;
            if (ccnf != c)
                return ccnf;
            return c;
        }
        return st1 == st2 ? 0 : [...st1].reverse() > [...st2].reverse() ? 1 : -1;
    }

    // delete all boosters of b < b, add a booster
    static bbc(a, b) {
        while (b != '' && b != this.col && this.cmp(a, this.booster(b)) == 1)
            b = this.base(b);
        return this.bb(a, b);
    }

    static rest(l, st) {
        return this.cmp(l, st) == 1 ? st : this.rest(l, this.booster(st));
    }

    static ceill(l, st) {
        return this.cmp(l, st) == 1 ? l : this.bbc(this.ceill(l, this.booster(st)), st);
    }

    static ledge(st) {
        let x = this.booster(st);
        return this.cmp(this.col, x) == 1 ? this.col : this.bbc(this.ceill(this.col, x), this.base(st));
    }

    static cascade(x, c, st) {
        let y = this.booster(c);
        let d = this.cof(y);
        let s = d == this.col || d == this.ledge(c) ? this.bb(this.fs(y, this.rest(d, x)), this.base(c)) : this.cascade(y, d, c);
        return this.bb(this.fs(x, s), this.base(st));
    }

    // get cofinality of ordinal st
    static cof(st) {
        if (st == this.bo)                         // L
            return '[[]]';
        else if (st == '' || st == this.col)            // 1, 6
            return st;
        else {
            let x = this.booster(st);
            if (x == '')                       // 2
                return '[]';
            else {
                let c = this.cof(x);
                if (c == '[]')                // 3
                    return '[[]]';
                else if (c == '[[]]' || this.cmp(st, c) == 1)       // > C
                    return c;
                else {
                    let l = this.ledge(st);
                    if (this.cmp(l, c) < 1)
                        return st;                    // 7
                    else {
                        let ca = this.cmp(this.bbc(this.ceill(l, x), this.base(st)), c);
                        if (ca == 1)   // 4, 5, 8
                            return c;
                        else if (ca == 0)
                            return '[[]]';
                        else
                            return this.cof(this.cascade(x, c, st));
                    }
                }
            }
        }
    }

    static expanlimit(n) {
        let result = `[${'c'}]`;
        for (let i = 0; i < n; i++) {
            result = `[${result}${'c'}]`;
        }
        return '[' + result + ']';
    }

    static tostring(n) {
        return "[".repeat(n) + "]".repeat(n);
    }

    // get n-th element of fs of ordinal st
    static fs(st, n) {
        if (st == "Limit") return this.expanlimit(n);
        if (typeof n == "number") n = this.tostring(n);
        if (st == this.bo) {
            let s = this.col;
            for (let i = 0; i < this.fostn(n); i++)
                s = this.bb(s, this.col);
            for (let i = 0; i < 2; i++)
                s = this.bb(s, '');
            return s;
        }
        else if (st == '' || st == this.col)     // 1, 6
            return n;
        else {
            let x = this.booster(st);
            let beta = this.base(st);
            if (x == '')                         // 2
                return beta;
            else {
                let c = this.cof(x);
                if (c == '[]') {                    // 3
                    let s = beta;
                    x = this.pred(x);
                    for (let i = 0; i < this.fostn(n); i++)
                        s = this.bb(x, s);
                    return s;
                }
                else if (c == '[[]]' || this.cmp(st, c) == 1)     // > C
                    return this.bb(this.fs(x, n), beta);
                else {
                    let l = this.ledge(st);
                    if (this.cmp(l, c) < 1)       // 7
                        return n;
                    else {
                        let ca = this.cmp(this.bbc(this.ceill(l, x), this.base(st)), c);
                        if (ca == 1)                   // 4, 5, 8
                            return this.bb(this.fs(x, n), beta);
                        else if (ca == 0) {              // 9
                            let s = beta;
                            for (let i = 0; i < this.fostn(n); i++)
                                s = this.bb(this.fs(x, s), beta);
                            return s;
                        }
                        else
                            return this.fs(this.cascade(x, c, st), n);
                    }
                }
            }
        }
    }

    static minimize(st) {
        let s = st;
        if (st == this.bo)                         // L
            s = st;
        else if (st == '' || st == this.col)            // 1, 6
            s = st;
        else {
            let x = this.booster(st);
            if (x == '')                       // 2
                s = st;
            else {
                let c = this.cof(x);
                if (c == '[]')                // 3
                    s = st;
                else if (c == '[[]]' || this.cmp(st, c) == 1)       // > C
                    s = st;
                else {
                    let l = this.ledge(st);
                    if (this.cmp(l, c) < 1)
                        s = st;                    // 7
                    else {
                        let ca = this.cmp(this.bbc(this.ceill(l, x), this.base(st)), c);
                        if (ca == 1)   // 4, 5, 8
                            s = st;
                        else if (ca == 0)
                            s = st;
                        else {
                            s = this.cascade(x, c, st);
                        }
                    }
                }
            }
        }
        return s;
    }

    // is st ε number
    static isepsilon(st) {
        return st == '' ? false : st == this.col || st == this.bo ? true : this.cmp(st, this.booster(st)) < 1;
    }

    // largest ε member ≤ CNF st (if st < ε_0 then '')
    static floorepsilon(st) {
        if (!Array.isArray(st))
            return st;
        let t = st[st.length - 1][0];
        while (Array.isArray(t) && t != 0) {
            st = t;
            t = st[st.length - 1][0];
        }
        return t;
    }

    // is st Ω number
    static isOmega(st) {
        return st == '' ? false : st == this.col || st == this.bo ? true : this.cmp(this.col, this.booster(st)) < 1;
    }

    // remove boosters of st < c
    static floorOmega(st, c = this.col) {
        while (st != '' && st != this.col && st != c && this.cmp(c, this.booster(st)) == 1)
            st = this.base(st);
        return st;
    }

    // largest Ω number ≤ CNF st (if st < Ω then '')
    static floorOmegacnf(st) {
        if (st == '')
            return '';
        let t = this.floorepsilon(st);
        while (!this.isOmega(t)) {
            st = t;
            t = this.floorepsilon(st);
        }
        return t;
    }

    static sepsilon(st, e) {
        let s = st[st.length - 1];
        if (s[0] == e)
            if (s[1] == 1)
                st.pop();
            else
                s[1]--;
        return st.length ? st : '';
    }

    static braintail(st, e) {
        let i = 0, s = [];
        while (this.floorepsilon([st[i]]) != e)
            i++;
        let u = i;
        while (i < st.length) {
            s.push([st[i][0] == e ? '' : this.sepsilon(st[i][0], e), st[i][1]]);
            i++;
        }
        let tail = st.slice(0, u);
        if (!tail.length)
            tail = '';
        else if (tail.length == 1 && tail[0][1] == 1 && tail[0][0] != '' && !Array.isArray(tail[0][0]))
            tail = tail[0][0];
        return [s, tail];
    }

    // ω ^ CNF st
    static omegapower(st) {
        if (st != '' && !Array.isArray(st))
            return st;
        return [[st, 1]];
    }

    // cmp CNFs st1, st2 (if st1<st2 then -1; if st1=st2 then 0; if st1>st2 then 1)
    static cmpcnf(st1, st2) {
        if (st1.toString() == st2.toString())
            return 0;
        if (st1 == '')
            return -1;
        if (st2 == '')
            return 1;
        let b1 = !Array.isArray(st1);
        let b2 = !Array.isArray(st2);
        if (b1 && b2)
            return this.cmp(st1, st2);
        let c;
        if (b1) {
            c = this.cmp(st1, this.floorepsilon(st2));
            return c == 0 ? -1 : c;
        }
        if (b2) {
            c = this.cmp(this.floorepsilon(st1), st2);
            return c == 0 ? 1 : c;
        }
        let i1 = st1.length - 1;
        let i2 = st2.length - 1;
        do {
            if (st1[0].length == 2 && st2[0].length == 2) {
                c = this.cmpcnf(st1[i1][0], st2[i2][0]);
                if (c != 0)
                    return c;
                c = st1[i1][1] > st2[i2][1] ? 1 : st1[i1][1] < st2[i2][1] ? -1 : 0;
            }
            else {
                c = this.cmp(st1[i1][0], st2[i2][0]);
                if (c != 0)
                    return c;
                c = this.cmpcnf(st1[i1][1], st2[i2][1]);
                if (c != 0)
                    return c;
                c = this.cmpcnf(st1[i1][2], st2[i2][2]);
            }
            if (c != 0)
                return c;
            i1--;
            i2--;
        }
        while (i1 >= 0 && i2 >= 0);
        if (i1 < 0)
            return -1;
        return 1;
    }

    // CNF st1 + CNF st2 
    static sumcnf(st1, st2) {
        if (st1 == '')
            return st2;
        if (st2 == '')
            return st1;
        let z1, z2;
        if (!Array.isArray(st1)) {
            z1 = st1;
            st1 = [[st1, 1]];
        }
        if (!Array.isArray(st2)) {
            z2 = st2;
            st2 = [[st2, 1]];
        }
        let b1 = st1[0].length == 2;
        let b2 = st2[0].length == 2;
        if (b1 ^ b2) {
            if (b1)
                st1 = [[z1 === undefined ? this.floorepsilon(st1) : z1, '', st1]];
            else
                st2 = [[z2 === undefined ? this.floorepsilon(st2) : z2, '', st2]];
        }
        let s = st2.slice(-1);
        let i = 0;
        if (b1 && b2) {
            let c = this.cmpcnf(s[0][0], st1[i][0]);
            while (c > 0) {
                i++;
                if (i < st1.length)
                    c = this.cmpcnf(s[0][0], st1[i][0]);
                else
                    break;
            }
            if (i == st1.length)
                return st2;
            if (c == 0) {
                st1[i][1] += s[0][1];
                st2.pop();
            }
        }
        else {
            let c0 = this.cmp(s[0][0], st1[i][0]);
            let c1 = this.cmpcnf(s[0][1], st1[i][1]);
            while (c0 > 0 || (c0 == 0 && c1 > 0)) {
                i++;
                if (i < st1.length) {
                    c0 = this.cmp(s[0][0], st1[i][0]);
                    c1 = this.cmpcnf(s[0][1], st1[i][1]);
                }
                else
                    break;
            }
            if (i == st1.length)
                return st2;
            if (c0 == 0 && c1 == 0) {
                st1[i][2] = this.sumcnf(st1[i][2], s[0][2]);
                st2.pop();
            }
        }
        return st2.concat(st1.slice(i));
    }

    // get CNF of st
    static cnf(st, ext = false, b = true) {
        if (!Array.isArray(st) && (st == '' || this.isepsilon(st)))
            return st;
        let c = [];
        if (ext) {
            if (!Array.isArray(st))
                st = this.cnf(st);
            if (this.floorepsilon(st) == '')
                return st;
            let s, t, i = -1, e, brain, m, h;
            for (s of st) {
                h = false;
                e = this.floorepsilon([s]);
                if (e == '') {
                    brain = '';
                    m = s;
                }
                else if (s[0] == e) {
                    brain = '';
                    m = ['', s[1]];
                }
                else {
                    [brain, t] = this.braintail(s[0], e);
                    if (brain.length == 1 && !brain[0][0].length && brain[0][1] == 1)
                        brain = '';
                    m = [t, s[1]];
                    h = t != '' && s[1] == 1 && !Array.isArray(t);
                }
                if (i < 0 || c[i][0] != e || c[i][1].toString() != brain.toString()) {
                    c.push([e, brain, h ? t : [m]]);
                    i++;
                }
                else {
                    if (!Array.isArray(c[i][2]))
                        c[i][2] = [[c[i][2], 1]];
                    c[i][2].push(m);
                }
            }
            if (b)
                for (s of c) {
                    s[1] = this.cnf(s[1], true);
                    s[2] = this.cnf(s[2], true);
                }
        }
        else {
            let s, t, i = -1;
            while (st) {
                [s, st] = this.isepsilon(st) ? [st, ''] : [this.booster(st), this.base(st)];
                if (c.length == 0 || this.cmp(t, s) < 1) {
                    if (i < 0 || c[i][0] != s) {
                        c.push([s, 1]);
                        i++;
                    }
                    else
                        c[i][1]++;
                    t = s;
                }
            }
            for (s of c)
                s[0] = this.cnf(s[0]);
        }
        return c;
    }

    static unone(st) {
        return st == '1' ? '' : st;
    }

    static displayform(st, ext = false) {
        if (st == '')
            return 0;
        if (!Array.isArray(st))
            return this.convertepsilon(st, ext);
        if (ext) {
            if (st[0].length == 2)
                return this.displayform(st);
            let i = st.length - 1;
            let s = '';
            let e, ex, m;
            while (i >= 0) {
                s += ' + ';
                e = st[i][0];
                if (e == '')
                    s += this.displayform(st[i][2]);
                else {
                    s += this.convertepsilon(e, true);
                    ex = st[i][1];
                    m = this.displayform(st[i][2], true);
                    if (Array.isArray(st[i][2]) && st[i][2].length > 1)
                        m = '(' + m + ')';
                    else
                        m = this.unone(m);
                    if (ex != '')
                        s += '<sup>' + this.displayform(ex, true) + '</sup>';
                    else if (m && (s[s.length - 1] == ']' || m[0] == '['))
                        s += '·';
                    s += m;
                }
                i--;
            }
            return s.slice(3);
        }
        else {
            let i = st.length - 1;
            let s = '';
            let ex;
            while (i >= 0) {
                s += ' + ';
                ex = st[i][0];
                if (Array.isArray(ex)) {
                    s += 'ω';
                    if (ex.length != 1 || ex[0][0] != 0 || ex[0][1] != 1)
                        s += '<sup>' + this.displayform(ex) + '</sup>';
                    s += this.unone(st[i][1]);
                }
                else if (ex == '')
                    s += st[i][1];
                else {
                    s += this.convertepsilon(ex);
                    if (st[i][1] != '1') {
                        if (s[s.length - 1] == ']')
                            s += '·';
                        s += st[i][1];
                    }
                }
                i--;
            }
            return s.slice(3);
        }
    }

    static getle(cf, x, ex, b) {
        let le = '';
        if (b) {
            let u = 0;
            while (this.cmpcnf(cf, [ex[u]]) > 0)
                u++;
            if (u > 0)
                le = ex.slice(0, u);
        }
        if (le.length == 1 && le[0][1] == 1 && le[0][0] != '' && !Array.isArray(le[0][0]))
            return le[0][0];
        else
            return this.omegapower(le);
    }

    static convertepsilon(st, ext = false) {
        if (st == this.col || st == this.bo)
            return st;
        if (st == '[[[[c]c]]c]')
            return 'I';
        if (st == '[[[c][[c]c]]c]')
            return 'M';
        
        let x = this.booster(st);
        let beta = this.base(st);

        let f = this.floorOmega(x);
        let j = f;
        let sy = '';
        if (f == this.col) {
            sy = 'Ω';
            j = this.bb(this.col, this.col);
            j = this.bb(j, this.floorOmega(beta, j));
            j = this.bb(j, this.col);
            j = this.bb(j, this.floorOmega(beta, j));
        }
        else if (f == this.bb(this.col, this.col)) {
            sy = 'L';
            j = this.bb(this.col, this.col);
            j = this.bb(this.col, j);
            j = this.bb(j, this.floorOmega(beta, j));
            j = this.bb(j, this.col);
            j = this.bb(j, this.floorOmega(beta, j));
        }
        else if (f == this.bb(this.col, this.bb(this.col, this.col))) {
            sy = 'R';
            j = this.bb(this.col, this.col);
            j = this.bb(this.col, j);
            j = this.bb(this.col, j);
            j = this.bb(j, this.floorOmega(beta, j));
            j = this.bb(j, this.col);
            j = this.bb(j, this.floorOmega(beta, j));
        }
        else {
            if (f == this.bb(this.col, this.floorOmega(beta)))
                sy = 'φ';
        }
        if (sy != '' && this.cmp(this.bb(this.bb(this.bb('', f), f), f), x) > 0 && (sy != 'Ω' || this.cmp(this.bb(j, this.col), x) == 1)) {
            let cf = this.cnf(f);
            let fx = this.floorOmega(x, f);
            let ex = this.cnf(x);
            let eex = this.cnf(ex, true, false);
            let le = this.getle(cf, x, ex, x != f && eex[0][0] != f);
            while (beta) {
                let x1 = this.booster(beta);
                let fx1 = this.floorOmega(x1, j);
                if (fx1 == fx) {
                    let ex1 = this.cnf(x1);
                    le = this.sumcnf(this.getle(cf, x1, ex1, x1 != j && this.cnf(ex1, true, false)[0][0] != j), le);
                    beta = this.base(beta);
                }
                else {
                    if (fx == f)
                        le = this.sumcnf(beta, le);
                    else {
                        let u = eex.length - 1;
                        while (u >= 0 && eex[u][0] == f)
                            u--;
                        u++;
                        let ca = this.cmpcnf(eex[u][2], this.cnf(beta));
                        le = this.sumcnf(ca == 1 ? '' : ca == 0 ? [['', 1]] : beta, le);
                    }
                    break;
                }
            }
            if (sy != 'φ' && le.length == 1 && le[0][1] == 1 && le[0][0] == '')
                le = '';
            else {
                if (ext)
                    le = this.cnf(le, true);
                le = this.displayform(le, ext);
                if (sy == 'φ' && isFinite(le))
                    le--;
            }
            if (sy == 'φ') {
                if (fx == f)
                    return 'ε<sub>' + le + '</sub>';
                if (fx == this.bb(f, f))
                    return 'ζ<sub>' + le + '</sub>';
                if (fx == this.bb(f, this.bb(f, f)))
                    return 'η<sub>' + le + '</sub>';
                if (fx == this.bb(this.bb(f, f), f))
                    return 'Γ<sub>' + le + '</sub>';
            }
            if (sy != 'φ' || fx == f)
                return sy + (le == '' ? '' : '<sub>' + le + '</sub>');
            let s = '';
            let i = eex.length - 1;
            let p = eex[i][1];
            let m = eex[i][2];
            p = p == '' ? 1 : p[0][1];
            let q = p;
            while (q > 0) {
                s += ', ';
                if (q == p) {
                    i--;
                    if (ext)
                        m = this.cnf(m, true);
                    s += this.displayform(m, ext);
                    if (i >= 0) {
                        p = eex[i][1];
                        m = eex[i][2];
                        p = eex[i][0] != f ? 0 : p == '' ? 1 : p[0][1];
                    }
                }
                else
                    s += 0;
                q--;
            }
            return sy + '(' + s.slice(2) + ', ' + le + ')';
        }
        return this.bb(this.displayform(this.cnf(x, ext), ext), beta == '' ? '' : (this.displayform(this.cnf(beta, ext), ext)));
    }

    static convert(st) {
        let d = this.format > 1 ? st : this.displayform(this.cnf(st, this.format), this.format);
        if (this.mf) {
            let s = this.minimize(st);
            while (s != st) {
                d = d + ' = ' + (this.format > 1 ? s : this.displayform(this.cnf(s, this.format), this.format));
                st = s;
                s = this.minimize(st);
            }
        }
        return d;
    }

    static isSuccessor(ord) {
        if (ord == "Limit") return false;
        return (this.cof(ord) == '[]') ? true : false;
    }

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

class BMS {

    static cmp(m1, m2) {
        function sequence_compare(seq1, seq2) {
            if (seq1.length === 0) {
                if (seq2.length === 0) return 0;
                else return -1;
            } else {
                if (seq2.length === 0) return 1;
                else {
                    if (seq1[0] < seq2[0]) return -1;
                    else if (seq1[0] > seq2[0]) return 1;
                    else return sequence_compare(seq1.slice(1), seq2.slice(1));
                }
            }
        }

        if (m1 === "Limit" && m2 === "Limit") return 0;
        if (m1 === "Limit") return 1;
        if (m2 === "Limit") return -1;

        if (m1.length === 0) return m2.length === 0 ? 0 : -1;
        if (m2.length === 0) return 1;

        let col1 = m1[0];
        let col2 = m2[0];

        const diff = col1.length - col2.length;

        if (diff > 0) {
            col2 = col2.concat(Array(diff).fill(0));
        } else if (diff < 0) {
            col1 = col1.concat(Array(-diff).fill(0));
        }

        const c = sequence_compare(col1, col2);

        return c || this.cmp(m1.slice(1), m2.slice(1));
    }

    static isSuccessor(matrix) {
        return matrix !== "Limit" && (matrix.length === 0 || !matrix.at(-1)?.some(x => x !== 0));
    }

    static fs(m, FSterm) {
        if (m === "Limit") {
            if (FSterm === 0) return [[0]];
            return [
                Array(FSterm).fill(0),
                Array(FSterm).fill(1)
            ];
        }

        if (m.length === 0) {
            return [];
        }

        const parent_cache = Object.create(null);
        const ascending_cache = Object.create(null);

        function parent(x, y) {
            const key = `${x},${y}`;

            if (key in parent_cache) {
                return parent_cache[key];
            }

            let p = x;

            while ((p = y ? parent(p, y - 1) : p - 1) >= 0) {
                if (m[p][y] < m[x][y]) break;
            }

            return parent_cache[key] = p;
        }

        function ascending(r, x, y) {
            const key = `${r},${x},${y}`;

            if (key in ascending_cache) {
                return ascending_cache[key];
            }

            return ascending_cache[key] =
                r <= x &&
                (r === x || ascending(r, parent(x, y), y));
        }

        const endcol = m.length - 1;
        let result = m.slice(0, endcol);

        const child = m[endcol];
        const ymax = child.length - 1;

        let LNZ;

        for (LNZ = ymax; LNZ >= 0; --LNZ) {
            if (child[LNZ] > 0) break;
        }

        if (LNZ < 0) {
            return result;
        }

        const BR = parent(endcol, LNZ);
        const BRcolumn = m[BR];

        const offset = child.map((v, y) =>
            y < LNZ ? v - BRcolumn[y] : 0
        );

        const offsetAsc = Array(endcol)
            .fill(0, BR)
            .map((_, x) =>
                offset.map((v, y) =>
                    ascending(BR, x, y) ? v : 0
                )
            );

        for (let n = 1; n <= FSterm; n++) {
            for (let col = BR; col < endcol; col++) {
                result.push(
                    m[col].map(
                        (v, y) =>
                            v + offsetAsc[col][y] * n
                    )
                );
            }
        }

        if (
            ymax > 0 &&
            result.every(column => column[ymax] === 0)
        ) {
            result = result.map(column =>
                column.slice(0, ymax)
            );
        }

        return result;
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

let Lim_cOCF_in_BMS = [[0,0,0,0],[1,1,1,1],[2,2,0,0]] // Lim(cOCF) is (0,0,0,0)(1,1,1,1)(2,2) in BMS

function Conv_cOCF(ord) {
    return BMS.g(LPrSS.ZERO, Lim_cOCF_in_BMS, cOCF.gInv(cOCF.ZERO, "Limit", ord))
}

function Conv_BMS(ord) {
    return cOCF.g(cOCF.ZERO, "Limit", BMS.gInv(BMS.ZERO, Lim_cOCF_in_BMS, ord));
}
