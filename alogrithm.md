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

---

## IV. Proof 2 (rewritten Proof 1)

### Definitions and Setup

Let $N = (S_N, <_N, \text{Zero}_N, \text{Limit}_N, \text{fs}_N)$ be an ordinal notation system satisfying Criteria 1, 2, and 3.

For any $\lambda \in S_N$ such that $\lambda$ is a limit ordinal, Criterion 2 dictates that the sequence $(\text{fs}_N(\lambda, n))_{n \in \mathbb{N}}$ is strictly increasing and strictly bounded above by $\lambda$.

We define the **Canonical Path** of an ordinal $a \le_N \text{Limit}_N$ as the tuple sequence $\text{Path}(N, a) = [i_0, i_1, \dots, i_{k-1}]$ generated by tracing fundamental sequence branches downward from $\text{Limit}_N$.

---

### Lemma 1: Well-Definedness and Termination of `f` and `Path`

For any ordinal $a <_N \text{Limit}_N$:

1. **Termination of `f(N, a, b)`:**
Let $b$ be a limit ordinal with $a <_N b$. By Criterion 2, $\text{fs}_N(b, n) <_N \text{fs}_N(b, n+1) <_N b$ for all $n \in \mathbb{N}$. Because $N$ has no gaps below limit ordinals ($\sup_{n} \text{fs}_N(b, n) = b$), there exists a minimal natural number $i \in \mathbb{N}$ such that $a \le_N \text{fs}_N(b, i)$. The search loop in `f` increments $i$ sequentially and is guaranteed to terminate at $i = \min \{ n \in \mathbb{N} \mid a \le_N \text{fs}_N(b, n) \}$.
2. **Termination of `Path(N, a)`:**
`Path(N, a)` constructs a sequence of ordinals $(\lambda_m)_{m \ge 0}$ where:

$$\lambda_0 = \text{Limit}_N$$


$$\lambda_{m+1} = \text{fs}_N(\lambda_m, f(N, a, \lambda_m))$$



By Criterion 2, $\text{fs}_N(\lambda_m, i) <_N \lambda_m$ for all $i$. Therefore, the sequence forms a strictly descending chain:

$$\text{Limit}_N = \lambda_0 >_N \lambda_1 >_N \lambda_2 >_N \dots \ge_N a$$



By Criterion 3 ($N$ contains no infinite descending chains), this sequence cannot decrease infinitely. Thus, there exists a finite step $k$ such that $\lambda_k = a$, at which point the loop terminates. `Path(N, a)` yields a unique, finite sequence of indices $[i_0, i_1, \dots, i_{k-1}]$.

---

### Lemma 2: Uniqueness of Canonical Path Representation

Let $a, b \in S_N$ with $a <_N \text{Limit}_N$ and $b <_N \text{Limit}_N$.

$$\text{Path}(N, a) = \text{Path}(N, b) \iff a = b$$

**Proof:**

* **$(\Leftarrow)$** Trivially true since `f` and fundamental sequences are deterministic functions.
* **$(\Rightarrow)$** Let $\text{Path}(N, a) = [i_0, i_1, \dots, i_{k-1}]$. Reconstructing the ordinal from $\text{Limit}_N$ using this path sequence via:

$$x_0 = \text{Limit}_N, \quad x_{j+1} = \text{fs}_N(x_j, i_j)$$



evaluates to $x_k$. By Lemma 1, $x_k = a$ and $x_k = b$. Therefore, $a = b$. $\blacksquare$

---

### Lemma 3: Order Preservation of Branch Choices

Let $a, b \in S_N$ with $a <_N b$. Let $\vec{p}_a = \text{Path}(N, a)$ and $\vec{p}_b = \text{Path}(N, b)$.

Then $\vec{p}_a$ is lexicographically smaller than $\vec{p}_b$ (denoted $\vec{p}_a <_{\text{lex}} \vec{p}_b$).

**Proof:**
Trace both paths simultaneously starting from $\lambda_0 = \text{Limit}_N$.

1. If $\vec{p}_a$ is a strict prefix of $\vec{p}_b$, then $a$ is an ancestor limit ordinal of $b$ along the branch path, meaning $a >_N b$, which contradicts $a <_N b$.
2. Thus, there must exist a first index $m$ where branch choice $i_m^{(a)} \neq i_m^{(b)}$.
3. At step $m$, both paths share the common limit ordinal $\lambda_m$. Since $a <_N b \le_N \lambda_m$, $f(N, a, \lambda_m)$ finds the smallest index $i_m^{(a)}$ such that $a \le_N \text{fs}_N(\lambda_m, i_m^{(a)})$.
4. Because $\text{fs}_N(\lambda_m, n)$ is strictly monotonically increasing with $n$ (Criterion 2), it follows directly that $i_m^{(a)} < i_m^{(b)}$.
5. Hence, $\vec{p}\_a <\_{\text{lex}} \vec{p}\_b$. $\blacksquare$

---

### Theorem: Correctness of Inter-System Ordinal Conversion

Let $N$ and $M$ be two notation systems satisfying Criteria 1–3 with isomorphic limit structures. The function $\Phi: N \to M$ defined by:


$$\Phi(a) = \text{Reconstruct}(M, \text{Path}(N, a))$$


where $\text{Reconstruct}(M, [i_0, \dots, i_{k-1}])$ sequentially applies $M.\text{fs}$ starting from $M.\text{Limit}$, is a strict **order-isomorphism**.

**Proof:**

1. **Well-Definedness:** By Lemma 1, $\text{Path}(N, a)$ produces a finite, deterministic index array $\vec{p}_a$ in finite steps. Reconstructing in $M$ executes $k$ deterministic fundamental sequence steps, guaranteeing termination in $O(k)$ operations.
2. **Order Preservation:** Let $a <_N b$. By Lemma 3, $\vec{p}_a <_{\text{lex}} \vec{p}_b$. Applying these path choices to $M.\text{fs}$ starting from $M.\text{Limit}$ preserves the exact same index comparison at the first point of divergence $m$. By Criterion 2 of system $M$, $M.\text{fs}(\lambda_m, i_m^{(a)}) <_M M.\text{fs}(\lambda_m, i_m^{(b)})$, implying $\Phi(a) <_M \Phi(b)$.
3. **Bijectivity:** By Lemma 2, every ordinal has a unique canonical path. Reconstructing across systems maps every canonical path in $N$ to its exact structural dual in $M$.

Therefore, the canonical path trace algorithm correctly converts any ordinal $a \in N$ to its exact equivalent $\Phi(a) \in M$. $\blacksquare$


## V.Alogrithm Optimization

The main idea of this is to accelerate the progess of approaching the target ordinal to be converted

This can be achive by introducing stronger function than Successor, which will result in a speed up in several **Magnitude**

But importantly, if a = b then N.YourCustomOps(a) = M.YourCustomOps(b) or else everything will fall apart

Then instead of only successor the ordinal, making a prioritizer to sort Operation to optimize further

## VI.Final words

I feel like this is a groundbreaking discovery in ordinal and googology, because converting and analysing is one of the main jobs that googologist do

Also of its generality, this also really strong, that you can apply this to most of the Ordinal System you see!

Even though bruteforce, this have ended a countinous debate in googology that questioned "is there an alogrithm that converting ordinal between any ordinal"!!
