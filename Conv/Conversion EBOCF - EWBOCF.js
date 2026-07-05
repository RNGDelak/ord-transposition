//Conversion from Extended Buchholz Ordinal Collapsing Function (EBOCF) to Extended Weak Buchholz Ordinal Collapsing Function (EWBOCF)
//note that the correspondance is unproven


const BUCHHOLZ_ZERO = [];
const BUCHHOLZ_ONE = { left: BUCHHOLZ_ZERO, right: BUCHHOLZ_ZERO };
const BUCHHOLZ_OMEGA = { left: BUCHHOLZ_ZERO, right: BUCHHOLZ_ONE };
const WEAK_ZERO = 0;
const WEAK_ONE = { left: WEAK_ZERO, right: WEAK_ZERO };
const WEAK_OMEGA = { left: WEAK_ZERO, right: { left: WEAK_ONE, right: WEAK_ZERO } };


function createScanner(str) {
  return { s: str, pos: 0, length: str.length };
}

function scanNext(scanner) {
  if (scanner.pos >= scanner.length) return null;
  return scanner.s.charAt(scanner.pos++);
}

function scanPeek(scanner) {
  if (scanner.pos >= scanner.length) return null;
  return scanner.s.charAt(scanner.pos);
}

// --- Parser Function ---
function parseBuchholz(scanner, context) {
  // Handle case if a raw string was passed at the root entry point
  if (typeof scanner === "string") {
    scanner = createScanner(scanner);
  }

  function appendToRSum(term) {
    if (state === START) r = term;
    else if (state === PLUS) {
      if (term instanceof Array) {
        r = (r instanceof Array) ? r.concat(term) : [r].concat(term);
      } else {
        if (r instanceof Array) r.push(term);
        else r = [r, term];
      }
    } else throw Error("Wrong state when attempting to append as sum");
    state = CLOSEDTERM;
  }
  
  var nums = "0123456789", symbols = "+()<>{}_,";
  var r = [];
  var TOP = 0, ANGLETERMLEFT = 1, ANGLETERMRIGHT = 2, PSITERMSUBSCRIPT = 3, PSITERMINNER = 4, PARENTHESISTERMINNER = 5, BRACES = 6;
  if (typeof context === "undefined") context = TOP;
  
  var START = 0, PLUS = 1, CLOSEDTERM = 2, EXIT = 3;
  var state = START;
  
  while (scanner.pos < scanner.length && state !== EXIT) {
    var scanpos = scanner.pos;
    var next = scanNext(scanner);
    var nextWord = next;
    var symbolType;
    
    if (nums.indexOf(nextWord) !== -1) {
      while (scanner.pos < scanner.length && nums.indexOf(scanPeek(scanner)) !== -1) nextWord += scanNext(scanner);
      symbolType = 0; // NUMBER
    } else if (symbols.indexOf(nextWord) !== -1) {
      symbolType = 1; // SYMBOL
    } else {
      while (scanner.pos < scanner.length && (nums + symbols).indexOf(scanPeek(scanner)) === -1) nextWord += scanNext(scanner);
      symbolType = 2; // WORD
    }
    
    if (symbolType === 0) {
      if (state !== START && state !== PLUS) throw Error("Unexpected character " + next + " at position " + scanpos);
      var num = +nextWord;
      if (num === 0) appendToRSum(BUCHHOLZ_ZERO);
      else if (num === 1) appendToRSum(BUCHHOLZ_ONE);
      else {
        for (var i = 0; i < num; i++) { state = PLUS; appendToRSum(BUCHHOLZ_ONE); }
      }
    } else if (nextWord === "ω" || nextWord === "w") {
      if (state !== START && state !== PLUS) throw Error("Unexpected character " + next + " at position " + scanpos);
      appendToRSum(BUCHHOLZ_OMEGA);
    } else if (nextWord === "<") {
      if (state !== START && state !== PLUS) throw Error("Unexpected character " + next + " at position " + scanpos);
      var leftterm = parseBuchholz(scanner, ANGLETERMLEFT);
      if (scanNext(scanner) !== ",") throw Error("Expected a comma at position " + (scanner.pos - 1));
      var rightterm = parseBuchholz(scanner, ANGLETERMRIGHT);
      if (scanNext(scanner) !== ">") throw Error("Expected closing > at position " + (scanner.pos - 1));
      appendToRSum({ left: leftterm, right: rightterm });
    } else if (nextWord === "ψ" || nextWord === "p" || nextWord === "psi") {
      if (state !== START && state !== PLUS) throw Error("Unexpected character " + next + " at position " + scanpos);
      if (scanNext(scanner) !== "_") throw Error("Expected _ at position " + (scanner.pos - 1));
      var subscriptterm = parseBuchholz(scanner, PSITERMSUBSCRIPT);
      if (scanNext(scanner) !== "(") throw Error("Expected opening ( at position " + (scanner.pos - 1));
      var innerterm = parseBuchholz(scanner, PSITERMINNER);
      if (scanNext(scanner) !== ")") throw Error("Expected closing ) at position " + (scanner.pos - 1));
      appendToRSum({ left: subscriptterm, right: innerterm });
    } else if (nextWord === "(") {
      if (state !== START && state !== PLUS) throw Error("Unexpected character " + next + " at position " + scanpos);
      if (scanner.pos < scanner.length && scanPeek(scanner) !== ")") {
        while (true) {
          state = PLUS;
          appendToRSum(parseBuchholz(scanner, PARENTHESISTERMINNER));
          var nextnext = scanNext(scanner);
          if (nextnext === ",") continue;
          if (nextnext === ")") break;
          throw Error("Expected a comma or closing ) at position " + (scanner.pos - 1));
        }
      } else scanner.pos++;
    } else if (nextWord === "+") {
      if (state === CLOSEDTERM) state = PLUS;
      else throw Error("Unexpected character + at position " + scanpos);
    } else if (nextWord === "{") {
      if (state !== START && state !== PLUS) throw Error("Unexpected character { at position " + scanpos);
      var subterm = parseBuchholz(scanner, BRACES);
      if (scanNext(scanner) !== "}") throw Error("Expected closing } at position " + (scanner.pos - 1));
      appendToRSum(subterm);
    } else {
      throw Error("Unexpected character " + next + " at position " + scanpos);
    }
    
    if (state === CLOSEDTERM) {
      var peek = scanPeek(scanner);
      if (context === BRACES && peek === "}") state = EXIT;
      else if (context === ANGLETERMLEFT && peek === ",") state = EXIT;
      else if (context === ANGLETERMRIGHT && peek === ">") state = EXIT;
      else if (context === PSITERMSUBSCRIPT && peek === "(") state = EXIT;
      else if (context === PSITERMINNER && peek === ")") state = EXIT;
      else if (context === PARENTHESISTERMINNER && (peek === "," || peek === ")")) state = EXIT;
    }
  }
  return r;
}

// --- Transformation Functions ---
function oplus(x, y) {
  if (x === 0) return y;
  return { left: x.left, right: oplus(x.right, y) };
}

function triangle(x) {
  if (x instanceof Array) {
    if (x.length === 0) return WEAK_ZERO;
    if (x.length === 2) return { left: diamond(x[0]), right: triangle(x[1]) };
    return { left: diamond(x[0]), right: triangle(x.slice(1)) };
  }
  return { left: diamond(x), right: WEAK_ZERO };
}

function diamond(x) {
  if (x instanceof Array) {
    if (x.length === 0) return WEAK_ZERO;
    if (x.length === 2) return oplus(diamond(x[0]), diamond(x[1]));
    return oplus(diamond(x[0]), diamond(x.slice(1)));
  }
  return { left: triangle(x.left), right: triangle(x.right) };
}

function trans(x) {
  if (x instanceof Array) {
    if (x.length === 0) return WEAK_ZERO;
    if (x.length === 2) return oplus(trans(x[0]), trans(x[1]));
    return oplus(trans(x[0]), trans.slice(1));
  }
  if (x.left instanceof Array && x.left.length === 0) return diamond(x);
  return triangle(x);
}

function weakEqual(x, y) {
  if (x === 0) return y === 0;
  if (y === 0) return false;
  return weakEqual(x.left, y.left) && weakEqual(x.right, y.right);
}

// --- Stringifier ---
function stringifyWeak(x) {
  if (x === 0) return "0";
  if (weakEqual(x, WEAK_ONE)) return "1";
  if (weakEqual(x, WEAK_OMEGA)) return "ω";
  
  var left = "";
  if (weakEqual(x.left, WEAK_ONE)) left = "1";
  else if (weakEqual(x.left, WEAK_OMEGA)) left = "ω";
  
  left ||= stringifyWeak(x.left);
  var right = stringifyWeak(x.right);
  
  return "ψ_" + left + "(" + right + ")";
}

function EBOCF_to_EWBOCF(inputLine) {
  var trimmed = inputLine.trim();
  if (!trimmed) return "";
  try {
    return stringifyWeak(trans(parseBuchholz(trimmed)));
  } catch (e) {
    return "[Error]: " + e.message;
  }
}