const I = require('immutable');

export default {
  calcVertices,
  calcFaces
}

function calcVertices(P, u, pts, slices, m, n) {
  if (u === slices) { return pts; }
  return calcVertices(
    P,
    u + 1,
    pts.concat(
      // curve at row u
      calcCurve(
        I.List(),
        I.List().concat(
          deCasteljau(colj(P, m, n, 0), 0, m, u/slices),
          deCasteljau(colj(P, m, n, 1), 0, m, u/slices),
          deCasteljau(colj(P, m, n, 2), 0, m, u/slices),
          deCasteljau(colj(P, m, n, 3), 0, m, u/slices),
          deCasteljau(colj(P, m, n, 4), 0, m, u/slices),
          deCasteljau(colj(P, m, n, 5), 0, m, u/slices)
        ),
        0, slices, n
      )
    ),
    slices, m, n               
  );
}

// triangle faces for a leng x leng sheet of vertices
function calcFaces(leng) {
  return I.List().concat(
    triFan(I.List(), 1, 0, leng),
    triFan(I.List(), leng*(leng - 1) + 1, leng*(leng - 1), leng*leng),
    triStrip(I.List(), 0, leng, leng*(leng-1) - 1)
  );
}


function colj(P, m, n, j) {
  let Pj = I.List(); let i = 0;
  while (i < m) {
    Pj = Pj.push(P.get(j + n*i));
    i++;
  }
  return Pj;
}

function calcCurve(curve, Pu, v, slices, n) {
  if (v === slices) { return curve; } 
  return calcCurve(
    curve.concat(deCasteljau(Pu, 0, n, v/slices)),
    Pu, v + 1, slices, n
  );
}

function deCasteljau(P, i, deg, t) {
  if (i === deg - 1) {
    return P;
  }
  return deCasteljau(
    P.reduce(lerpPts(t), I.List()), 
    i + 1, deg, t
  );
}

function lerpPts(t) {
  return (accum, p, j, list) => {
    if (j === list.size-1) {
      return accum;
    }
    return accum.push(zipWith(
        add,
        p.map(u => u * (1 - t)),
        list.get(j + 1).map(u => u * t)
    ));
  }
}

function zipWith(f, A, B) {
  return A.map((a, i) => f(a, B.get(i)));
}

function add(a, b) { return a + b; }

function triFan(faces, i, center, leng) {
  if (i === leng - 1) { return faces; } 
  return triFan(
    faces.concat([center, i, i + 1]),
    i + 1,
    center,
    leng
  );
}

function triStrip(faces, i, rowLeng, leng) {
  if (i === leng) { return faces; } 
  return triStrip(
    faces.concat(
       // some annoying gaps in this mesh scheme, should fix ...
       (i === rowLeng - 1) ? [0, i, i + 1] : [],
       (i === leng - 1) ? [leng, leng + rowLeng, leng + 1] : [],
       [i, i + rowLeng, i + 1],
       [i + 1, i + rowLeng, i + rowLeng + 1]
     ),
    i + 1,
    rowLeng,
    leng
  );
}
