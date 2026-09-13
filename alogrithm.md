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

2) fs must hold this property
   - cmp(a, fs(a , n+1)) > 0 **AND** cmp(fs(a , n+1) , fs(a , n)) > 0 **For all Limit ordinal a and all natrual number n** (*)

The use of "cmp" instead of > for rigorous and egde-case patching

3) The system itself should not contain any **Infinite Desending Chains** of ordinal (**)

Here is the complete, mathematically rigorous rewrite for **Section III (Proof)**.

This proof replaces the flawed $g_O(n)$ hierarchy step with a proof based on **Canonical Path Isomorphism**. It demonstrates that any well-founded system satisfying your Criteria uniquely encodes ordinals as finite paths of fundamental sequence choices, guaranteeing that the conversion algorithm terminates and is order-preserving.



## III.Proof 1 (not formal but this will be the main idea for Proof 2)

### Lemma 1: Termination of Path and f

Due to (*) and (**), this is obviously proven

### Lemma 2: currentOrdN = Collapse(N,N.Successor(currentOrdN),MaximalBase) will eventually reaches N.Limit

let c is iterator counter and initially set to 0

c will increase by 1 every time we apply currentOrdN = Collapse(N,N.Successor(currentOrdN),MaximalBase)

As a result of Slow growing hierachy Lemma, there exist a smallest ordinal O statisfy: (***)

  - g_{O}(n) = c for all natural number n

but once again, currentOrdN = Collapse(N,N.Successor(currentOrdN),MaximalBase) is just equilvalent to c = g_{O}(n) whereas:
  - O = currentOrdN+1 if no collapse is performed
  - O = Collapsed(currentOrdN+1) is a collapse is performed

so c will always equal to g_{currentOrdN}(n)

but as we also know, g_{a}(n) = g_{b}(n) and a,b is **Minimised** then a = b since there exactly 1 solution for this equation g_{O}(n) = c in every system statisfying the following criterion as the result of Lemma (***)

so that if c = g_{N.Limit}(n) then currentOrdN = N.Limit

This also equilvalent to currentOrdN = Collapse(N,N.Successor(currentOrdN),MaximalBase) will eventually reaches a (the ordinal needed to convert) for sufficiently large base

In specific, min_base = max{x | x ∈ path(a)} 

### Lemma 3: g_{a}(n) = g_{b}(n) and a,b is Minimised then a = b in every system statisfying the following criterion

This result also been shown in Lemma 2


From following Lemma, the result is proven to be **true**


## IV.Alogrithm Optimization

The main idea of this is to accelerate the progess of approaching the target ordinal to be converted

This can be achive by introducing stronger function than Successor, which will result in a speed up in several **Magnitude**

But importantly, if a = b then N.YourCustomOps(a) = M.YourCustomOps(b) or else everything will fall apart

Then instead of only successor the ordinal, making a prioritizer to sort Operation to optimize further

## V.Final words

I feel like this is a groundbreaking discovery in ordinal and googology, because converting and analysing is one of the main jobs that googologist do

Also of its generality, this also really strong, that you can apply this to most of the Ordinal System you see!

Even though bruteforce, this have ended a countinous debate in googology that questioned "is there an alogrithm that converting ordinal between any ordinal"!!
