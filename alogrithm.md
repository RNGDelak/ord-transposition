# So this document imma explaining a alogrithm that allow us to comvert ordinal between any well-founded ordinal system!

## I.Alogrithm explaination

I will write a js program instead of pure math definition for apparent

```js
/*
Assume A.Zero, A.Limit, A.cmp, A.fs and A.Successor is defined
Do so: B.Zero, B.Limit, B.cmp, B.fs and B.Successor

In addition, N.Limit is the largest ordinal defined in system N
             N.Zero is the smallest ordinal defined in system N

Further Criteria is inside Criteria section
*/

// Conceptually this return min{n | a <= b[n]}
function f(N,a,b){
  let i = 0
  while(N.cmp(a,N.fs(b,i)) > 0) {i++;}
  return i;
}

//Extract the canonical path that goes from Bound ordinal (Limit) to a
function Path(N,a){
  let currentPath = []
  let currentOrdinal = N.Limit
  while (N.cmp(a,currentOrdinal) < 0){
    let branch = f(N,a,currentOrdinal)
    currentPath.push(branch)
    currentOrdinal = N.fs(currentOrdinal,branch)
  }
  return currentPath
}

function Collapse(N,a,base) {
  let currentOrdinal = N.Limit
  while (N.cmp(a,currentOrdinal) < 0) {
    let branch = f(N,a,currentOrdinal)
    if (branch >= base) {return currentOrdinal;} //Perform a collapse iff there an ancestor that has "branch" index >= base
    currentOrdinal = N.fs(currentOrdinal,branch)
  }
  return currentOrdinal //No collapse are performed
}


//Convert ordinal a inside system N to its corresponding inside system M
function Convert(N,M,a){
  let MaximalBase = Path(N,a).reduce((a, b) => Math.max(a, b), -Infinity); //Kinda hard to rigorously explain this here, move on Proof secion for explaination
  let currentOrdN = N.Zero
  let currentOrdM = M.Zero
  while (N.cmp(currentOrdN,a) < 0) {
    currentOrdN = Collapse(N,N.Successor(currentOrdN),MaximalBase)
    currentOrdM = Collapse(M,M.Successor(currentOrdM),MaximalBase)
  }
  return currentOrdM
}

/*
Time Complexity : O(g_{a}(PathMax(a)))
Space Complexity : <= O(g_{a}(PathMax(a)))

g stand for Slow growing Hierachy
PathMax(a) is just the largest element in Path(N,a) (N is the system that a belong to)
*/

```

## II.Criteria

For simplicity, let assuming cmp(a,b) will give out -1,0,1 for a<b , a=b and a>b respectively


These are criteria that a system must hold to let this alogrithm work

1) cmp must hold 2 of these properties

   - cmp(a,b) = cmp(b,c) = k then cmp(a,c) = k
   - cmp(a,b) = -cmp(b,a)

3) fs must hold this property

  - cmp(a, fs(a , n+1)) > 0 **AND** cmp(fs(a , n+1) , fs(a , n)) > 0 **For all Limit ordinal a and all natrual number n**

The use of "cmp" instead of > for rigorous and egde-case patching

3) The system itself should not contain any **Infinite Desending Chains** of ordinal

## III.Proof
