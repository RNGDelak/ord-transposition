# About this project

I'm dreaming about converting ordinals between different notation systems smoothly, but it seems impossible... for now.

## Links

The main construction: https://github.com/RNGDelak/ord-limbms/blob/main/README.md

## Progress

### Perfectly Converted

These conversions are mathematically exact.

BMS <-> PMS <-> AMS -> 0Y

             -> Vulcaniz -> BMS
    -> 0Y
    -> **2 Shifted OCF (Version 2)**

Y-sequence -> DBMS

LPrSS <-> **CNF**

### Accurately Converted

These conversions are practically accurate enough for use, although not necessarily mathematically proven.


BMS -> **2 Shifted OCF (Version 1)**

SPrSS <-> **Veblen** (unproven)

EBOCF -> **EWBOCF** (unproven)

Dimensional Y-sequence <-> DBMS (unproven)


### Merely Converted

The accuracy of these conversions is still not acceptable.

This section includes notation systems where the three core operations (`fs`, `cmp`, and `isSuccessor`) have been implemented, but only the implemented conversions are listed here.


BMS <-> Y-sequence (Normal/Weak)
    <-> **cOCF**

LPrSS <-> HPrSS


## In Progress

Converting notations from MMS...

## Abbreviations

* **unproven** means the correspondence between the notations has not been proven.
* **Bold** means the notation has a pretty-printing function.
