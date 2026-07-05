// note that the correspondance is unproven

var itemSeparatorRegex = /[\t ,]/g;

function parseSequenceElement(s, i) {
  if (s.indexOf("v") == -1 || !isFinite(Number(s.substring(s.indexOf("v") + 1)))) {
    var numval = Number(s);
    return {
      value: numval,
      position: i,
      parentIndex: -1
    };
  } else {
    return {
      value: Number(s.substring(0, s.indexOf("v"))),
      position: i,
      parentIndex: Math.max(Math.min(i - 1, Number(s.substring(s.indexOf("v") + 1))), -1),
      forcedParent: true
    };
  }
}

function calcMountain(s) {
  var lastLayer;
  lastLayer = s.map(x => x.toString()).map(parseSequenceElement);
  var calculatedMountain = [lastLayer]; // rows
  while (true) {
    // assign parents
    var hasNextLayer = false;
    for (var i = 0; i < lastLayer.length; i++) {
      if (lastLayer[i].forcedParent) {
        if (lastLayer[i].parentIndex != -1) hasNextLayer = true;
        continue;
      }
      var p;
      if (calculatedMountain.length == 1) {
        p = lastLayer[i].position + 1;
      } else {
        p = 0;
        while (calculatedMountain[calculatedMountain.length - 2][p].position < lastLayer[i].position + 1) p++;
      }
      while (true) {
        if (p < 0) break;
        var j;
        if (calculatedMountain.length == 1) {
          p--;
          j = p - 1;
        } else { // ignoring
          p = calculatedMountain[calculatedMountain.length - 2][p].parentIndex;
          if (p < 0) break;
          j = 0;
          while (lastLayer[j].position < calculatedMountain[calculatedMountain.length - 2][p].position - 1) j++;
        }
        if (j < 0 || j < lastLayer.length - 1 && lastLayer[j].position + 1 != lastLayer[j + 1].position) break;
        if (lastLayer[j].value < lastLayer[i].value) {
          lastLayer[i].parentIndex = j;
          hasNextLayer = true;
          break;
        }
      }
    }
    if (!hasNextLayer) break;
    var currentLayer = [];
    calculatedMountain.push(currentLayer);
    for (var i = 0; i < lastLayer.length; i++) {
      if (lastLayer[i].parentIndex != -1) {
        currentLayer.push({ value: lastLayer[i].value - lastLayer[lastLayer[i].parentIndex].value, position: lastLayer[i].position - 1, parentIndex: -1 });
      }
    }
    lastLayer = currentLayer;
  }
  return calculatedMountain;
}

function Y_to_DBMS(s) {
  var mountain;
  mountain = calcMountain(s);
  var matrix = [];
  for (var i = 0; i < mountain[0].length; i++) matrix.push([]);
  for (var h = 0; h < mountain.length; h++) {
    for (var i = 0; i < mountain[h].length; i++) {
      matrix[mountain[h][i].position + h][h] = mountain[h][i].parentIndex == -1 ? 0 : matrix[mountain[h][mountain[h][i].parentIndex].position + h][h] + 1;
    }
  }
  for (var i = 0; i < mountain[0].length; i++) {
    while (matrix[i][matrix[i].length - 1] === 0 && matrix[i].length > 1) matrix[i].pop();
  }
  return matrix;
}