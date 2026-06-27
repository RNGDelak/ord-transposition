/*
cOCF main functions
Limit : (0,0,0,0)(1,1,1,1)(2,2)

- for pretty printing , use convert()
note : this is the old version of rgetar cOCF version (feb 2020).it doesnt have much formatting to get around
*/


let bo = 'Limit', col = 'c',format=1,mf=false;

// get position of last symbol p of string st (if l=true then first)
function getls(st, p, l = false) {
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
function bb(booster, base) {
    return '[' + booster + ']' + base;
}

// get base of string st
function base(st) {
    return st.slice(getls(st, ']', true) + 1);
}

// get booster of string st
function booster(st) {
    return st.slice(1, getls(st, ']', true));
}

// get successor of ordinal st
function suc(st) {
    return '[]' + st;
}

// get predecessor of successor ordinal st = X + 1
function pred(st) {
    return st.slice(2);
}

// finite ordinal string st to number
function fostn(st) {
    return st.length / 2;
}

// finite ordinal e from integer to computer format
function cf(e) {
    let s = '';
    for (let i = 0; i < e; i++)
        s = suc(s)
    return s;
}

// cmp expressions st1, st2 (if st1<st2 then -1; if st1=st2 then 0; if st1>st2 then 1)
function cmp(st1, st2, b = false) {

    if (b) {
        let ccnf = cmpcnf(cnf(st1), cnf(st2));
        let c = st1 == st2 ? 0 : [...st1].reverse() > [...st2].reverse() ? 1 : -1;
        if (ccnf != c)
            return ccnf;
        return c;
    }
    return st1 == st2 ? 0 : [...st1].reverse() > [...st2].reverse() ? 1 : -1;
}

// delete all boosters of b < b, add a booster
function bbc(a, b) {
    while (b != '' && b != col && cmp(a, booster(b)) == 1)
        b = base(b);
    return bb(a, b);
}

function rest(l, st) {
    return cmp(l, st) == 1 ? st : rest(l, booster(st));
}

function ceill(l, st) {
    return cmp(l, st) == 1 ? l : bbc(ceill(l, booster(st)), st);
}

function ledge(st) {
    let x = booster(st);
    return cmp(col, x) == 1 ? col : bbc(ceill(col, x), base(st));
}

function cascade(x, c, st) {
    let y = booster(c);
    let d = cof(y);
    let s = d == col || d == ledge(c) ? bb(fs(y, rest(d, x)), base(c)) : cascade(y, d, c);
    return bb(fs(x, s), base(st));
}

// get cofinality of ordinal st
function cof(st) {
    if (st == bo)                         // L
        return '[[]]';
    else if (st == '' || st == col)            // 1, 6
        return st;
    else {
        let x = booster(st);
        if (x == '')                       // 2
            return '[]';
        else {
            let c = cof(x);
            if (c == '[]')                // 3
                return '[[]]';
            else if (c == '[[]]' || cmp(st, c) == 1)       // > C
                return c;
            else {
                let l = ledge(st);
                if (cmp(l, c) < 1)
                    return st;                    // 7
                else {
                    let ca = cmp(bbc(ceill(l, x), base(st)), c);
                    if (ca == 1)   // 4, 5, 8
                        return c;
                    else if (ca == 0)
                        return '[[]]';
                    else
                        return cof(cascade(x, c, st));
                }
            }
        }
    }
}

function expanlimit(n) {
    let result = `[${'c'}]`;

    for (let i = 0; i < n; i++) {
        result = `[${result}${'c'}]`;
    }

    return '['+result+']';
}

function tostring(n) {
    return "[".repeat(n) + "]".repeat(n);
}

// get n-th element of fs of ordinal st
function fs(st, n) {
    if (st == "Limit") return expanlimit(n)
    if (typeof n == "number") n = tostring(n)
    if (st == bo) {
        let s = col;
        for (let i = 0; i < fostn(n); i++)
            s = bb(s, col);
        for (let i = 0; i < 2; i++)
            s = bb(s, '');
        return s;
    }
    else if (st == '' || st == col)     // 1, 6
        return n;
    else {
        let x = booster(st);
        let beta = base(st);
        if (x == '')                         // 2
            return beta;
        else {
            let c = cof(x);
            if (c == '[]') {                    // 3
                let s = beta;
                x = pred(x);
                for (let i = 0; i < fostn(n); i++)
                    s = bb(x, s);
                return s;
            }
            else if (c == '[[]]' || cmp(st, c) == 1)     // > C
                return bb(fs(x, n), beta);
            else {
                let l = ledge(st);
                if (cmp(l, c) < 1)       // 7
                    return n;
                else {
                    let ca = cmp(bbc(ceill(l, x), base(st)), c);
                    if (ca == 1)                   // 4, 5, 8
                        return bb(fs(x, n), beta);
                    else if (ca == 0) {              // 9
                        let s = beta;
                        for (let i = 0; i < fostn(n); i++)
                            s = bb(fs(x, s), beta);
                        return s;
                    }
                    else
                        return fs(cascade(x, c, st), n);
                }
            }
        }
    }
}

function minimize(st) {
    let s = st;
    if (st == bo)                         // L
        s = st;
    else if (st == '' || st == col)            // 1, 6
        s = st;
    else {
        let x = booster(st);
        if (x == '')                       // 2
            s = st;
        else {
            let c = cof(x);
            if (c == '[]')                // 3
                s = st;
            //s=bb(bb('',booster(minimize(bb(base(x),base(st))))),base(st));
            else if (c == '[[]]' || cmp(st, c) == 1)       // > C
                s = st;
            //s=cascade(x,c,st);
            else {
                let l = ledge(st);
                if (cmp(l, c) < 1)
                    s = st;                    // 7
                //s=cascade(x,c,st);
                //minimize(bb(base(x),base(st)))
                //s=bb(bb(booster(x),booster(minimize(bb(base(x),base(st))))),base(st));
                else {
                    let ca = cmp(bbc(ceill(l, x), base(st)), c);
                    if (ca == 1)   // 4, 5, 8
                        s = st;
                    //s=cascade(x,c,st);
                    else if (ca == 0)
                        s = st;
                    //s=cascade(x,c,st);  
                    else {
                        s = cascade(x, c, st);
                        //let s=cascade(x,c,st);
                        //return s=st?s:minimize(s);
                    }
                }
            }
        }
    }
    return s;
    //return s==st?s:minimize(s);
}

// is st ε number
function isepsilon(st) {
    return st == '' ? false : st == col || st == bo ? true : cmp(st, booster(st)) < 1;
}

// largest ε nember ≤ CNF st (if st < ε_0 then '')
function floorepsilon(st) {
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
function isOmega(st) {
    return st == '' ? false : st == col || st == bo ? true : cmp(col, booster(st)) < 1;
}

// remove boosters of st < c
function floorOmega(st, c = col) {
    //while(st!=''&&st!=col&&st!=c&&cmp(c,booster(st))==1)
    while (st != '' && st != col && st != c && cmp(c, booster(st)) == 1)
        //while(st!=''&&(cmp(c,st)==1||cmp(c,booster(st))==1))
        st = base(st);
    return st;
}

// largest Ω number ≤ CNF st (if st < Ω then '')
function floorOmegacnf(st) {
    if (st == '')
        return '';
    let t = floorepsilon(st);
    while (!isOmega(t)) {
        st = t;
        t = floorepsilon(st);
    }
    return t;
}

function sepsilon(st, e) {
    let s = st[st.length - 1];
    if (s[0] == e)
        if (s[1] == 1)
            st.pop();
        else
            s[1]--;
    return st.length ? st : '';
}

function braintail(st, e) {
    let bra, i = 0, s = [];
    while (floorepsilon([st[i]]) != e)
        i++;
    let u = i;
    while (i < st.length) {
        s.push([st[i][0] == e ? '' : sepsilon(st[i][0], e), st[i][1]]);
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
function omegapower(st) {
    //if(st.length==1&&st[0][1]==1){
    //   let e=floorepsilon(st);
    //   if(e!=''&&st[0][0]==e)
    //      return st;}
    if (st != '' && !Array.isArray(st))
        return st;
    return [[st, 1]];
}

// cmp CNFs st1, st2 (if st1<st2 then -1; if st1=st2 then 0; if st1>st2 then 1)
function cmpcnf(st1, st2) {
    if (st1.toString() == st2.toString())
        return 0;
    if (st1 == '')
        return -1;
    if (st2 == '')
        return 1;
    let b1 = !Array.isArray(st1);
    let b2 = !Array.isArray(st2);
    if (b1 && b2)
        return cmp(st1, st2);
    let c;
    if (b1) {
        c = cmp(st1, floorepsilon(st2));
        return c == 0 ? -1 : c;
    }
    if (b2) {
        c = cmp(floorepsilon(st1), st2);
        return c == 0 ? 1 : c;
    }
    /*b1=st1[0].length==2;            // to cmp CNF and extended CNF
    b2=st2[0].length==2;
    if(b1^b2){
       if(b1)
          st1=cnf(st1,true);
       else
          st2=cnf(st2,true);
       }*/
    let i1 = st1.length - 1;
    let i2 = st2.length - 1;
    do {
        //if(b1&&b2){                  // to cmp CNF and extended CNF
        if (st1[0].length == 2 && st2[0].length == 2) {
            c = cmpcnf(st1[i1][0], st2[i2][0]);
            if (c != 0)
                return c;
            c = st1[i1][1] > st2[i2][1] ? 1 : st1[i1][1] < st2[i2][1] ? -1 : 0;
        }
        else {
            c = cmp(st1[i1][0], st2[i2][0]);
            if (c != 0)
                return c;
            c = cmpcnf(st1[i1][1], st2[i2][1]);
            if (c != 0)
                return c;
            c = cmpcnf(st1[i1][2], st2[i2][2]);
        }
        if (c != 0)
            return c;
        i1--;
        i2--;
    }
    while (i1 >= 0 && i2 >= 0);
    //if(i1<0&&i2<0)                // to cmp CNF and extended CNF
    //   return 0;
    if (i1 < 0)
        return -1;
    return 1;
}

// CNF st1 + CNF st2 
function sumcnf(st1, st2) {
    if (st1 == '')
        return st2;
    if (st2 == '')
        return st1;
    if (!Array.isArray(st1)) {
        let z1 = st1;
        st1 = [[st1, 1]];
    }
    if (!Array.isArray(st2)) {
        let z2 = st2;
        st2 = [[st2, 1]];
    }
    let b1 = st1[0].length == 2;
    let b2 = st2[0].length == 2;
    if (b1 ^ b2) {
        if (b1)
            st1 = [[z1 === undefined ? floorepsilon(st1) : z1, '', st1]];
        else
            st2 = [[z2 === undefined ? floorepsilon(st2) : z2, '', st2]];
    }
    let s = st2.slice(-1);
    let i = 0;
    if (b1 && b2) {
        let c = cmpcnf(s[0][0], st1[i][0]);
        while (c > 0) {
            i++;
            if (i < st1.length)
                c = cmpcnf(s[0][0], st1[i][0]);
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
        let c0 = cmp(s[0][0], st1[i][0]);
        let c1 = cmpcnf(s[0][1], st1[i][1]);
        while (c0 > 0 || (c0 == 0 && c1 > 0)) {
            i++;
            if (i < st1.length) {
                c0 = cmp(s[0][0], st1[i][0]);
                c1 = cmpcnf(s[0][1], st1[i][1]);
            }
            else
                break;
        }
        if (i == st1.length)
            return st2;
        if (c0 == 0 && c1 == 0) {
            st1[i][2] = sumcnf(st1[i][2], s[0][2]);
            st2.pop();
        }
    }
    return st2.concat(st1.slice(i));
}

// get CNF of st
function cnf(st, ext = false, b = true) {
    if (!Array.isArray(st) && (st == '' || isepsilon(st)))
        return st;
    let c = [];
    if (ext) {
        if (!Array.isArray(st))
            st = cnf(st);
        if (floorepsilon(st) == '')
            return st;
        let s, t, i = -1, e, brain, m, y = -1, h;
        for (s of st) {
            h = false;
            e = floorepsilon([s]);
            if (e == '') {
                brain = '';
                m = s;
            }
            else if (s[0] == e) {
                brain = '';
                m = ['', s[1]];
            }
            else {
                [brain, t] = braintail(s[0], e);
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
                s[1] = cnf(s[1], true);
                s[2] = cnf(s[2], true);
            }
    }
    else {
        let s, t, i = -1;
        while (st) {
            [s, st] = isepsilon(st) ? [st, ''] : [booster(st), base(st)];
            if (c.length == 0 || cmp(t, s) < 1) {
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
            s[0] = cnf(s[0]);
    }
    return c;
}

function unone(st) {
    return st == '1' ? '' : st;
}

function displayform(st, ext = false) {
    if (st == '')
        return 0;
    if (!Array.isArray(st))
        return convertepsilon(st, ext);
    if (ext) {
        if (st[0].length == 2)
            return displayform(st);
        let i = st.length - 1;
        let s = '';
        let e, ex, m;
        while (i >= 0) {
            s += ' + ';
            e = st[i][0];
            if (e == '')
                s += displayform(st[i][2]);
            else {
                s += convertepsilon(e, true);
                ex = st[i][1];
                m = displayform(st[i][2], true);
                if (Array.isArray(st[i][2]) && st[i][2].length > 1)
                    m = '(' + m + ')';
                else
                    m = unone(m);
                if (ex != '')
                    s += '<sup>' + displayform(ex, true) + '</sup>';
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
                    s += '<sup>' + displayform(ex) + '</sup>';
                s += unone(st[i][1]);
            }
            else if (ex == '')
                s += st[i][1];
            else {
                s += convertepsilon(ex);
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

function getle(cf, x, ex, b) {
    let le = '';
    if (b) {
        let u = 0;
        while (cmpcnf(cf, [ex[u]]) > 0)
            u++;
        if (u > 0)
            le = ex.slice(0, u);
    }
    if (le.length == 1 && le[0][1] == 1 && le[0][0] != '' && !Array.isArray(le[0][0]))
        return le[0][0];
    else
        return omegapower(le);
    return le;
}

function convertepsilon(st, ext = false) {
    if (st == col || st == bo)
        return st;
    if (st == '[[[[c]c]]c]')
        return 'I';
    if (st == '[[[c][[c]c]]c]')
        return 'M';
    //st=minimize(st);
    let x = booster(st);
    let beta = base(st);

    let f = floorOmega(x);
    let j = f;
    let sy = '';
    if (f == col) {
        sy = 'Ω';
        j = bb(col, col);
        j = bb(j, floorOmega(beta, j));
        j = bb(j, col);
        j = bb(j, floorOmega(beta, j));
    }
    else if (f == bb(col, col)) {
        sy = 'L';
        j = bb(col, col);
        j = bb(col, j);
        j = bb(j, floorOmega(beta, j));
        j = bb(j, col);
        j = bb(j, floorOmega(beta, j));
    }
    else if (f == bb(col, bb(col, col))) {
        sy = 'R';
        j = bb(col, col);
        j = bb(col, j);
        j = bb(col, j);
        j = bb(j, floorOmega(beta, j));
        j = bb(j, col);
        j = bb(j, floorOmega(beta, j));
    }
    else {
        if (f == bb(col, floorOmega(beta)))
            sy = 'φ';
        //else if(x!=''&&x[x.length-1]==col){
        //   if(f==bb(col,floorOmega(beta,bb(col,col))))
        //      sy='φ';}
    }
    if (sy != '' && cmp(bb(bb(bb('', f), f), f), x) > 0 && (sy != 'Ω' || cmp(bb(j, col), x) == 1)) {
        let cf = cnf(f);
        let fx = floorOmega(x, f);
        let ex = cnf(x);
        let eex = cnf(ex, true, false);
        let le = getle(cf, x, ex, x != f && eex[0][0] != f);
        while (beta) {
            let x1 = booster(beta);
            let fx1 = floorOmega(x1, j);
            if (fx1 == fx) {
                let ex1 = cnf(x1);
                le = sumcnf(getle(cf, x1, ex1, x1 != j && cnf(ex1, true, false)[0][0] != j), le);
                beta = base(beta);
            }
            else {
                if (fx == f)
                    le = sumcnf(beta, le);
                else {
                    let u = eex.length - 1;
                    while (u >= 0 && eex[u][0] == f)
                        u--;
                    u++;
                    let ca = cmpcnf(eex[u][2], cnf(beta));
                    le = sumcnf(ca == 1 ? '' : ca == 0 ? [['', 1]] : beta, le);
                }
                break;
            }
        }
        if (sy != 'φ' && le.length == 1 && le[0][1] == 1 && le[0][0] == '')
            le = '';
        else {
            if (ext)
                le = cnf(le, true);
            le = displayform(le, ext);
            if (sy == 'φ' && isFinite(le))
                le--;
        }
        if (sy == 'φ') {
            if (fx == f)
                return 'ε<sub>' + le + '</sub>';
            if (fx == bb(f, f))
                return 'ζ<sub>' + le + '</sub>';
            if (fx == bb(f, bb(f, f)))
                return 'η<sub>' + le + '</sub>';
            if (fx == bb(bb(f, f), f))
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
                    m = cnf(m, true);
                s += displayform(m, ext);
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
    return bb(displayform(cnf(x, ext), ext), beta == '' ? '' : (displayform(cnf(beta, ext), ext)));
}

function convert(st) {
    let d = format > 1 ? st : displayform(cnf(st, format), format);
    if (mf) {
        let s = minimize(st);
        while (s != st) {
            d = d + ' = ' + (format > 1 ? s : displayform(cnf(s, format), format));
            st = s;
            s = minimize(st);
        }
    }
    return d;
}

function isSuccessor(ord) {
    if (ord == "Limit") return false
    return (cof(ord) == '[]') ? true : false
}

const ZERO = ''
