//I set the base to 1k for simplicity
//if you want the exact version, heading on to the .html version (unchanged)


function Y_to_DBMS_over(s) {
   const maxtries = 1000;
   function ackworm(seq, el) {
      if (seq.at(-1) == 1) {
         return seq.slice(0, -1)
      }
      var ret = seq.slice(0, -1)
      for (var i = 0; i < el; i++) {
         ret.push(seq.at(-1) - 1)
      }
      return ret
   }
   // rowseq=(s,e)=>(wy(s,e)+""!=lprss(s,e)+""?[console.log(s,e),lprss(s,e)][1]:lprss(s,e))
   rowseq = ackworm
   limitfunc = n => [1, n + 1]
   function acksplitterms(seq) {
      var ret = []
      // skip initial 1 for infinite ordinals
      for (var i = seq.every(x => x == 1) ? 0 : 1; i < seq.length; i++) {
         ret.push([seq[i]])
      }
      return ret
   }
   function ackjointerms(seq) {
      var finite = 1
      for (var i of seq) {
         if (i[0] != 1) {
            finite = 0
            break
         }
      }
      var ret = finite ? [] : [1]
      for (var i of seq) {
         ret.push(i[0])
      }
      return ret
   }
   [splitterms, jointerms] = [acksplitterms, ackjointerms]
   // a+(-b+c) for b<c
   function addunadd(a, b, c) {
      var as = splitterms(a)
      var bs = splitterms(b)
      var cs = splitterms(c)
      var bcs = []
      // terms removed from c by b
      var drops = 0
      for (var i = 0; i < bs.length; i++) {
         if (comparearrays(bs[i], cs[i]) < 0) {
            break
         }
         drops++
      }
      bcs = cs.slice(drops)
      if (bcs.length == 0) {
         return a
      }
      var ret = []
      for (var i = 0; i < as.length; i++) {
         if (comparearrays(as[i], bcs[0]) < 0) {
            break
         }
         ret.push(as[i])
      }
      return jointerms(ret.concat(bcs))
   }
   function parseseq(seq) {
      var ret = seq.split(",").map(x => parseInt(x))
      return ret
   }
   function comparearrays(a, b) {
      for (var i = 0; i < Math.min(a.length, b.length); i++) {
         if (a[i] > b[i]) {
            return 1
         }
         if (a[i] < b[i]) {
            return -1
         }
      }
      return (a.length > b.length) - (a.length < b.length)
   }
   function maxrowbelow(mountain, column, row, inclusive) {
      var lastrow = []
      for (var i in mountain[column]) {
         var ai = parseseq(i)
         // lexicographic compare ai and row
         // todo: use comparearrays
         // return lastrow if ai>row
         var checklens = 1
         for (var j = 0; j < Math.min(ai.length, row.length); j++) {
            if (ai[j] > row[j]) {
               return lastrow
            } else if (ai[j] < row[j]) {
               checklens = 0
               break
            }
         }
         if (checklens) {
            if (ai.length > row.length) {
               return lastrow
            }
            if (ai.length == row.length && !inclusive) {
               return lastrow
            }
         }
         lastrow = ai
      }
      // console.log("mrb",mountain,column,row,inclusive,lastrow)
      return lastrow
   }
   function minrowabove(mountain, column, row, inclusive) {
      for (var i in mountain[column]) {
         var ai = parseseq(i)
         if (comparearrays(ai, row) > 0) {
            return ai
         }
      }
      // nothing found
      return [2]
   }
   function parent(mountain, column, row) {
      var checkcol = column
      var checkrow = row
      while (mountain[checkcol][checkrow][0] >= mountain[column][row][0]) {
         checkcol = mountain[checkcol][checkrow][1]
         if (checkcol < 0) {
            throw "checkcol<0";
         }
         checkrow = maxrowbelow(mountain, checkcol, checkrow, true)
         if (checkrow.length == 0) {
            // console.log(mountain,column,row,checkcol,checkrow)
            throw "checkrow is []";
         }
      }
      return [checkcol, checkrow]
   }
   function thenumber(mtn, col, row) {
      //console.log(mtn,col,row);
      if (row + '' == '1') { return; }
      if (mtn[col][row] + '' == 'undefined') { return ''; }
      return (thenumber(mtn, mtn[col][row][1], row) || 0) + 1;
   }
   function diffrow(currow, parentrow) {
      if (parentrow + "" == currow + "") {
         var nextrow = currow.slice()
         nextrow.push(1)
         return nextrow
      } else {
         // yto's rule
         // new row is largest row with fs elem
         // in (parentrow,currow]
         var tryindex = 0;
         while (comparearrays(limitfunc(tryindex), currow) < 0) { tryindex++; }
         var tryrow = limitfunc(tryindex++)//[1,currow[1]+1]
         var lastrow = limitfunc(tryindex++)//[1,currow[1]+2]
         if (tryrow[1] > 10) {
            console.warn("tryrow too high",tryrow[1]);
         }
         var tries = 0
         while (comparearrays(tryrow, currow) > 0) {
            lastrow = tryrow
            // maybe this should be 0
            var nextelem = 0
            do {
               tryrow = rowseq(lastrow, nextelem)
               nextelem++
               if (nextelem > 100) {
                  console.warn("nextelem sus", nextelem);
               }
            } while (comparearrays(tryrow, parentrow) <= 0)
            // console.log(tryrow)
            if (tries++ > maxtries) {
               throw "tries sus"
            }
         }
         return lastrow
      }
   }
   function tomatrix(sequence) {
      var mountain = []
      // rows that occur in the mountain
      // map from rows to themselves
      var usedrows = {}
      for (var i = 0; i < sequence.length; i++) {
         // column of mountain
         var newcol = { "1": [sequence[i], i - 1] }
         mountain.push(newcol)
         usedrows[[1]] = [1]
         // until current value is 1
         // find parent
         // new entry with value=current-parent, leftleg=parent
         // row is row+1 if parent row=row, else yto's rule
         var curvalue = sequence[i]
         var currow = [1]
         while (curvalue > 1) {
            var parentcol, parentrow
            [parentcol, parentrow] = parent(mountain, i, currow)
            var nextrow = diffrow(currow, parentrow)
            curvalue -= mountain[parentcol][parentrow][0]
            newcol[nextrow] = [curvalue, parentcol]
            usedrows[nextrow] = nextrow
            currow = nextrow
         }
      }
      // console.log(mountain)
      // display mountain
      var usedrows2 = []
      for (var i in usedrows) {
         usedrows2.push(usedrows[i])
      }
      usedrows2.sort(comparearrays)
      var matrix = '';
      for (let i = 0; i < mountain.length; i++) {
         let mcol = ''
         let col = mountain[i];
         let keys = Object.keys(col).map(x => x.split(',').map(Number)).slice(1);
         for (let j of keys) {
            let p = j.at(-1);
            mcol += ','.repeat(p);
            //console.log(i,j,mountain);
            mcol += thenumber(mountain, i, j);
         }
         matrix += '(' + mcol.slice(1) + ')';
      }
      if (!compress_BMS.checked) { matrix = matrix.replaceAll('()', '(0)') }
      return matrix;
   }
   return tomatrix(s)
   
}
