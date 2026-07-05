// Im too lazy to warp it into a constructor so i did this

function conv(matrix) {
    function eq(a, b) {
        if (typeof (a) == 'number') { return a == b; }
        if (a.length == 2) { return eq(a[0], b[0]) && eq(a[1], b[1]); }
        return eq(a[0], b[0]) && eq(a[1], b[1]) && eq(a[2], b[2]);
    }
    // FROM COCF PROGRAM

    function paren(x, n) {
        console.log()
        let q = x[n] == '(' ? 1 : -1;
        let i = n;
        let t = 0;
        while (1) { t += (x[i] == '(' ? 1 : x[i] == ')' ? -1 : 0); if (!t) { break; }; i += q; }
        return i;
    }

    function firstTerm(x) {
        console.log()
        let m = paren(x, 1);
        return [x.slice(0, m + 1), x.slice(m + 2) || '0'];
    }

    function lastTerm(x) {
        console.log()
        let m = paren(x, x.length - 1);
        return [x.slice(0, m - 2) || '0', x.slice(m - 1)];
    }

    function terms(x) {
        console.log()
        if (x == '0') { return []; }
        return [firstTerm(x)[0]].concat(terms(firstTerm(x)[1]));
    }

    function arg(x) {
        console.log()
        return firstTerm(x)[0].slice(2, -1);
    }

    function lt(x, y) {
        console.log()
        if (y == '0') { return false; }
        if (x == '0') { return true; }
        if (x[0] == 'p' && y[0] == 'P') { return true; }
        if (x[0] == 'P' && y[0] == 'p') { return false; }
        if (arg(x) != arg(y)) { return lt(arg(x), arg(y)); }
        return lt(firstTerm(x)[1], firstTerm(y)[1]);
    }

    function add(x, y) {
        if (x == '0') { return y; }
        if (y == '0') { return x; }
        if (lt(firstTerm(x)[0], firstTerm(y)[0])) { return y; }
        let z = firstTerm(x)[0]
        let w = add(firstTerm(x)[1], y);
        if (w != '0') { return z + '+' + w; }
        return z;
    }

    function sub(x, y) {
        if (x == '0') { return '0'; }
        if (y == '0') { return x; }
        if (lt(firstTerm(y)[0], firstTerm(x)[0])) { return x; }
        return sub(firstTerm(x)[1], firstTerm(y)[1]);
    }

    function sua(x) { return split(x, 'P(0)'); }

    function exp(a) {
        if (a[0] == 'P') { return `P(${sub(a, 'P(0)')})`; }
        if (lt(a, 'p(p(P(0)))')) { return `p(${a})`; }
        let [x, y] = sua(arg(a));
        let p = split(y, `p(${add(x, 'P(0)')})`)[0];
        return 'p(' + add(x, add(p, sub(a, 'p(' + add(x, p) + ')'))) + ')';
    }

    function log(a) {
        if (a == '0') { return '0'; }
        if (a[0] == 'P') { return add('P(0)', arg(a)); }
        let [x, y] = sua(arg(a));
        let [p, q] = split(y, `p(${add(x, 'P(0)')})`);
        if (x == '0' && p == '0') {
            return q;
        }
        let m = add(`p(${add(x, p)})`, q);
        return m;
    }

    function div(a, b) { // only works when b is a.p.
        if (lt(a, b)) { return '0'; }
        return add(exp(sub(log(a), log(b))), div(firstTerm(a)[1], b));
    }

    function mul(a, b) { // only works when a is a.p.
        if (b == '0') { return '0'; }
        return add(exp(add(log(a), log(b))), mul(a, firstTerm(b)[1]))
    }

    function split(a, x) {
        if (a == '0') { return ['0', '0']; }
        if (lt(a, x)) { return ['0', a]; }
        if (lt(firstTerm(a)[0], x)) { return ['0', a]; }
        return [add(firstTerm(a)[0], split(firstTerm(a)[1], x)[0]), split(firstTerm(a)[1], x)[1]];
    }

    function op(x) { // "does it need parentheses when you write something*x"
        if (lt(x, 'p(p(0))')) { return false; }
        let f = (x[0] == 'p') ? `p(${sua(arg(x))[0]})` : 'P(0)';
        let g = null;
        let h = null;
        if (f == 'p(0)') { f = 'p(p(0))'; g = log(x); h = exp(g); }
        else { g = div(log(x), f); h = exp(mul(f, g)) }
        let c = div(x, h);
        let d = sub(x, mul(h, div(x, h)));
        if (d != '0') { return true; }
        return false;
    }

    // does not handle I(ψ(T^M),1) because it's too complicated
    function display(x, y) {
        //if(!y){return 'X'}
        //console.log(x);
        if (x == '0') { return '0'; }
        if (/^(p\(0\)\+)*p\(0\)$/.test(x)) { return ((x.length + 1) / 5).toString(); }
        let f = (x[0] == 'p') ? `p(${sua(arg(x))[0]})` : 'P(0)';
        let g = null;
        let h = null;
        if (f == 'p(0)') { f = 'p(p(0))'; g = log(x); h = firstTerm(x)[0]; }
        else { g = div(log(x), f); h = `${f == 'P(0)' ? 'P' : 'p'}(${split(arg(x), f)[0]})`; }
        let c = div(x, h);
        let d = sub(x, mul(h, div(x, h)));
        //console.log(f,g,h,'',c,d);
        if (c == 'p(0)' && d == '0') {
            if (exp(x) != x) {
                if (x == 'p(p(0))') { return 'ω'; }
                if (lt(x, 'p(P(0))')) { return `ω<sup>${display(log(x))}</sup>`; }
                return `${display(f)}<sup>${display(g)}</sup>`
            }
            if (x == 'P(0)') { return 'T'; }
            let m = div(log(lastTerm(arg(x))[1]), 'P(0)');
            let k = exp(mul('P(0)', div(log(lastTerm(arg(x))[1]), 'P(0)')));
            k = div(arg(x), k);
            //console.log(arg(x),k,m)
            k = sua(k);
            t = exp(add(mul('P(0)', m), 'P(0)'));
            let l = null;
            if (k[0] == '0') { l = '0'; }
            else { l = 'p(' + mul(exp(mul('P(0)', m)), k[0]) + ')'; }
            let r = 'p(' + mul(exp(mul('P(0)', m)), add(k[0], 'P(0)')) + ')';
            let [a, b] = split(k[1], r);
            a = 'p(' + mul(exp(mul('P(0)', m)), a) + ')'
            //console.log(k,r,l,a,b)
            if (a == 'p(0)') { a = '0'; }
            l = add(l, add(a, b))
            let s = ''
            if (lastTerm(arg(x))[1][0] == 'P' && b != '0') {
                if (m == 'p(0)') { s = 'Ω'; }
                else if (m == 'p(0)+p(0)') { s = 'I'; }
                else if (lt(m, 'p(P(P(p(P(P(P(0)))))))')) { s = `I(${display(sub(m, 'p(0)+p(0)'))},x)`; }
                else if (m == 'P(0)') { s = 'M'; }
                if (s == '') { return `ψ(${display(arg(x))})`; }
                if (l == 'p(0)') { return s.replace('x', '0'); }
                if (s.includes('x')) { return s.replace('x', display(sub(l, 'p(0)'))); }
                return `${s}<sub>${display(l)}</sub>`;
            }
            return `ψ(${display(arg(x))})`;
        }
        let a = display(h);
        //console.log(f,h,c,d)
        if (c != 'p(0)') {
            if (!op(c)) { a += display(c) }
            else { a += `&sdot;(${display(c)})`; }
        }
        if (d != '0') { a += '+' + display(d); }
        return a;
    }

    // END COCF

    function P(M, r, n) {
        if (r == -1) { return n - 1; }
        let q = P(M, r - 1, n);
        while (q > -1 && M[q][r] >= M[n][r]) { q = P(M, r - 1, q); }
        return q;
    }

    function C(M, n) {
        let X = [];
        for (let i = 0; i < M.length; i++) {
            if (P(M, 0, i) == n) { X.push(i); }
        }
        return X;
    }

    function CR(M, n) {
        let X = [];
        for (let i = 0; i < M.length; i++) {
            if (P(M, 0, i) == n) {
                X.push(i);
                X = X.concat(CR(M, i));
            }
        }
        return X;
    }

    function D(M, n) {
        let X = 0;
        for (let i = 0; i < M.length; i++) {
            if (P(M, 0, i) == n && M[i][1] > 0) { X++; }
        }
        return X;
    }

    function U(M, n) {
        if (M[n][1] == 0 || M[n][2] == 1 || n + 1 == M.length) { return [0, null]; }
        let m = P(M, 1, n);
        let L = [M[m][0] + 1, M[n][1], M[m][2] + 1];
        if (P(M, 1, n) == P(M, 1, n + 1) && eq(M[n + 1], L)) { return [1, n + 1]; }
        let q = n;
        let p = n;
        while (q != -1) {
            q = P(M, 0, q);
            if (P(M, 1, n) == P(M, 1, q) && eq(M[q], L) && M[n + 1][0] > M[q][0]) {
                if (M[p][2] == 1) { return [2, q] };
                return [1, q];
            }
            p = q;
        }
        return [0, null];
    }

    function mv(M, n, k) { // value of upgrader; k is same as in ov
        if (k) {
            let A = [k];
            while (A.at(-1) != n) { // "correct" value of k (justified?)
                A.push(P(M, 0, A.at(-1)));
                if (!M[A.at(-1)][0]) { break; } // if this ever gets used something's gone wrong
            }
            if (A.includes(n)) {
                for (i of A.toReversed()) {
                    if (M[i][2] == 0) { k = i; break; }
                }
            }
        }
        let S = '0';
        for (i of C(M, n)) {
            if (i > k && k) { break; }
            if (M[i][2] != 1) { continue; }
            let q = '0';
            for (j of C(M, i)) {
                if (j > k && k) { break; }
                q = add(q, ov(M, j, k));
            }
            S = add(S, exp(q));
        }
        let X = C(M, n).filter(x => M[x][2] && C(M, x).length);
        let p;
        if (!X.length) { p = 1; }
        else { p = M[CR(M, X.at(-1)).at(-1)][2]; }
        if (lt(sua(S)[1], 'p(p(0))') && p && !k) { S = add(S, 'p(0)'); } // 111 211 311 = ψ(T^2·ω), not ψ(T^2)
        // also, if k!=0, the condition will never be activated, since then it's a fixed point.
        return exp(S);
    }

    function ov(M, n, k) { // k = 3 (31) in 0 111 211 31 2 (-> T, since 31 is chain-upgraded)
        if (n == k) { return 'P(0)'; }
        if (M[n][2] == 0) { return o(M, n, k); }
        let S = '0';
        for (let i of C(M, n)) {
            if (i > k && k) { break; }
            S = add(S, ov(M, i, k));
        }
        return `P(${S})`;
    }

    function v(M, n, k) { // k is necessary to make the k value persist from ov (maybe? keeping it just in case)
        // console.log(n,k)
        if (M[n][1] == 0) { return '0'; }
        if (M[n][2] == 0) {
            let u = U(M, n);
            u = (u[0] ? mv(M, u[1], n * (u[0] == 2)) : 'p(0)');
            return add(v(M, P(M, 1, n), k), u);
        }
        return add(v(M, P(M, 2, n), k), mv(M, n, k));
    }

    function o(M, n, k) { // k is necessary to make the k value persist from ov
        let S = '0';
        for (let i of C(M, n)) {
            if (i > k && k) { break; }
            if (skipped(M, n).includes(i)) { continue; }
            S = add(S, o(M, i, k));
        }
        return `p(${add(mul('P(0)', v(M, n, k)), S)})`;
    }

    function skipped(M, n) {
        let S = [];
        let u = [...Array(M.length).keys()].map(x => (U(M, x)[0] == 1 ? U(M, x)[1] : null));
        //let u2=[...Array(M.length).keys()].map(x=>(U(M,x)[0]==2?U(M,x)[1]:null));
        for (let i of C(M, n)) {
            S = S.concat(skipped(M, i)); // for display purposes
            if (M[i][2] && M[n][2]) { S.push(i); continue; }
            if (u.includes(i)) {
                let c = C(M, i);
                if (c.length) { // e.g. 0 111 211 21 111 211
                    let j = c.at(-1);
                    if (eq(M[j], [M[i][0] + 1, M[i][1], 1])) { S.push(i); }
                    else if (eq(U(M, j - 1), [2, i]) && eq(M[j], [M[i][0] + 1, 0, 0]) && !C(M, j).length) { S.push(i); }
                }
                else { S.push(i); continue; }
            }
            if (eq(M[i], [M[n][0] + 1, 0, 0]) && eq(U(M, i - 1), [2, n]) && !C(M, i).length) { S.push(i); continue; }
        }
        return S;
    }

    function _o(M) {
        let S = '0';
        for (let i = 0; i < M.length; i++) { if (eq(M[i], [0, 0, 0])) { S = add(S, o(M, i)); } }
        return S;
    }

    function processMatrix(M) {
        return M.map(row => {
            let r = row.slice();
            while (r.length < 3) {
                r.push(0);
            }
            return r;
        });
    }
    return display(_o(processMatrix(matrix)))
}